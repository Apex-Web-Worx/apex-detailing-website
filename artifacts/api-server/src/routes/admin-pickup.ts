import { Router, type IRouter, type Request, type Response, type NextFunction } from "express";
import {
  db,
  bookingsTable,
  notificationTemplatesTable,
  shopSettingsTable,
} from "@workspace/db";
import { eq } from "drizzle-orm";
import { buildScheduledAt, parseDateString } from "../lib/availability";
import {
  cancelScheduledReviews,
  getShopSettings,
  getTemplates,
  listBookingCommunications,
  listBookingTimeline,
  listCustomerCommunications,
  listReviewQueue,
  markCompleted,
  markInProgress,
  markReadyAndNotify,
  stopDetailingTimer,
  renderVehicleReadyPreview,
  retryReviewRequest,
  seedNotificationDefaults,
  bookingTemplateVars,
  sendReviewRequestNow,
  skipReviewRequest,
  unskipReviewRequest,
} from "../lib/pickup-workflow";
import {
  DEFAULT_VEHICLE_READY_EMAIL,
  DEFAULT_VEHICLE_READY_SMS,
} from "../lib/message-templates";

const router: IRouter = Router();

function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const expected = process.env["ADMIN_TOKEN"];
  if (!expected) {
    res.status(500).json({
      message: "Server is missing ADMIN_TOKEN. Set it in environment variables.",
    });
    return;
  }
  const provided = req.header("x-admin-token");
  if (provided !== expected) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }
  next();
}

router.get("/admin/shop-settings", requireAdmin, async (_req, res) => {
  await seedNotificationDefaults();
  const settings = await getShopSettings();
  res.json(settings);
});

router.patch("/admin/shop-settings", requireAdmin, async (req, res) => {
  const body = (req.body ?? {}) as {
    reviewLink?: unknown;
    businessName?: unknown;
    businessPhone?: unknown;
  };
  const patch: {
    reviewLink?: string;
    businessName?: string;
    businessPhone?: string;
    updatedAt: Date;
  } = { updatedAt: new Date() };
  if (typeof body.reviewLink === "string") patch.reviewLink = body.reviewLink.trim();
  if (typeof body.businessName === "string" && body.businessName.trim()) {
    patch.businessName = body.businessName.trim();
  }
  if (typeof body.businessPhone === "string" && body.businessPhone.trim()) {
    patch.businessPhone = body.businessPhone.trim();
  }
  await seedNotificationDefaults();
  const [updated] = await db
    .update(shopSettingsTable)
    .set(patch)
    .where(eq(shopSettingsTable.id, 1))
    .returning();
  res.json(updated);
});

router.get("/admin/notification-templates", requireAdmin, async (_req, res) => {
  const rows = await getTemplates();
  res.json(rows);
});

router.patch("/admin/notification-templates/:key", requireAdmin, async (req, res) => {
  const key = String(req.params.key ?? "");
  if (key !== "vehicle_ready" && key !== "review_request") {
    res.status(404).json({ message: "Unknown template" });
    return;
  }
  const body = (req.body ?? {}) as {
    smsBody?: unknown;
    emailSubject?: unknown;
    emailBody?: unknown;
  };
  const patch: Record<string, unknown> = { updatedAt: new Date() };
  if (typeof body.smsBody === "string") patch.smsBody = body.smsBody;
  if (typeof body.emailSubject === "string") patch.emailSubject = body.emailSubject;
  if (typeof body.emailBody === "string") patch.emailBody = body.emailBody;
  await seedNotificationDefaults();
  const [updated] = await db
    .update(notificationTemplatesTable)
    .set(patch)
    .where(eq(notificationTemplatesTable.key, key))
    .returning();
  if (!updated) {
    res.status(404).json({ message: "Template not found" });
    return;
  }
  res.json(updated);
});

router.get("/admin/review-requests", requireAdmin, async (_req, res) => {
  res.json(await listReviewQueue());
});

router.get("/admin/communications", requireAdmin, async (req, res) => {
  const email = typeof req.query.email === "string" ? req.query.email : "";
  const bookingId = Number(req.query.bookingId);
  if (email) {
    res.json(await listCustomerCommunications(email));
    return;
  }
  if (Number.isFinite(bookingId) && bookingId > 0) {
    res.json(await listBookingCommunications(bookingId));
    return;
  }
  res.status(400).json({ message: "email or bookingId is required" });
});

router.get("/admin/bookings/:id/timeline", requireAdmin, async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) {
    res.status(400).json({ message: "Invalid id" });
    return;
  }
  const events = await listBookingTimeline(id);
  const communications = await listBookingCommunications(id);
  res.json({ events, communications });
});

router.get("/admin/bookings/:id/ready-preview", requireAdmin, async (req, res) => {
  const id = Number(req.params.id);
  const date = typeof req.query.pickupDate === "string" ? req.query.pickupDate : "";
  const time = typeof req.query.pickupTime === "string" ? req.query.pickupTime : "";
  if (!Number.isFinite(id) || !parseDateString(date) || !/^\d{2}:\d{2}$/.test(time)) {
    res.status(400).json({ message: "Invalid id, pickupDate, or pickupTime" });
    return;
  }
  const pickupAt = buildScheduledAt(date, time);
  if (!pickupAt) {
    res.status(400).json({ message: "Invalid pickup datetime" });
    return;
  }
  const [booking] = await db.select().from(bookingsTable).where(eq(bookingsTable.id, id));
  if (!booking) {
    res.status(404).json({ message: "Booking not found" });
    return;
  }
  const settings = await getShopSettings();
  const templates = await getTemplates();
  const tpl = templates.find((t) => t.key === "vehicle_ready");
  const preview = renderVehicleReadyPreview({
    booking,
    pickupAt,
    settings,
    smsBody: tpl?.smsBody ?? DEFAULT_VEHICLE_READY_SMS,
    emailSubject: tpl?.emailSubject ?? "Your vehicle is ready for pickup",
    emailBody: tpl?.emailBody ?? DEFAULT_VEHICLE_READY_EMAIL,
  });
  res.json({
    ...preview,
    smsConsent: booking.smsConsent,
    vars: bookingTemplateVars(booking, pickupAt, settings),
  });
});

router.post("/admin/bookings/:id/in-progress", requireAdmin, async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) {
    res.status(400).json({ message: "Invalid id" });
    return;
  }
  const updated = await markInProgress(id);
  if (!updated) {
    res.status(404).json({ message: "Booking not found" });
    return;
  }
  res.json(updated);
});

router.post("/admin/bookings/:id/stop-timer", requireAdmin, async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) {
    res.status(400).json({ message: "Invalid id" });
    return;
  }
  const updated = await stopDetailingTimer(id);
  if (!updated) {
    const [existing] = await db.select().from(bookingsTable).where(eq(bookingsTable.id, id));
    if (!existing) {
      res.status(404).json({ message: "Booking not found" });
      return;
    }
    res.status(400).json({ message: "Only in-progress jobs can stop the timer." });
    return;
  }
  res.json(updated);
});

router.post("/admin/bookings/:id/ready-for-pickup", requireAdmin, async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) {
    res.status(400).json({ message: "Invalid id" });
    return;
  }
  const body = (req.body ?? {}) as {
    pickupDate?: unknown;
    pickupTime?: unknown;
    sendSms?: unknown;
    sendEmail?: unknown;
    resend?: unknown;
    smsBody?: unknown;
    emailSubject?: unknown;
    emailBody?: unknown;
  };
  const date = typeof body.pickupDate === "string" ? body.pickupDate : "";
  const time = typeof body.pickupTime === "string" ? body.pickupTime : "";
  if (!parseDateString(date) || !/^\d{2}:\d{2}$/.test(time)) {
    res.status(400).json({ message: "pickupDate and pickupTime are required" });
    return;
  }
  const pickupAt = buildScheduledAt(date, time);
  if (!pickupAt) {
    res.status(400).json({ message: "Invalid pickup datetime" });
    return;
  }
  const result = await markReadyAndNotify({
    bookingId: id,
    pickupAt,
    sendSms: body.sendSms !== false,
    sendEmail: body.sendEmail !== false,
    resend: body.resend === true,
    smsBody: typeof body.smsBody === "string" ? body.smsBody : null,
    emailSubject: typeof body.emailSubject === "string" ? body.emailSubject : null,
    emailBody: typeof body.emailBody === "string" ? body.emailBody : null,
  });
  if ("error" in result) {
    if (result.error === "not_found") {
      res.status(404).json({ message: "Booking not found" });
      return;
    }
    if (result.error === "cancelled") {
      res.status(400).json({ message: "Cannot mark a cancelled booking ready." });
      return;
    }
    res.status(409).json({ message: "This booking was just changed. Refresh and try again." });
    return;
  }
  res.json(result);
});

router.post("/admin/bookings/:id/complete", requireAdmin, async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) {
    res.status(400).json({ message: "Invalid id" });
    return;
  }
  const updated = await markCompleted(id);
  if (!updated) {
    res.status(404).json({ message: "Booking not found" });
    return;
  }
  if (updated.status !== "completed") {
    res.status(400).json({ message: "Only ready-for-pickup jobs can be marked completed." });
    return;
  }
  res.json(updated);
});

router.post("/admin/bookings/:id/review-request", requireAdmin, async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) {
    res.status(400).json({ message: "Invalid id" });
    return;
  }
  const result = await sendReviewRequestNow(id);
  if ("error" in result) {
    if (result.error === "not_found") {
      res.status(404).json({ message: "Booking not found" });
      return;
    }
    if (result.error === "cancelled") {
      res.status(400).json({ message: "Appointment is cancelled." });
      return;
    }
    if (result.error === "no_channel") {
      res.status(400).json({ message: "No phone or email to send the review link." });
      return;
    }
    if (result.error === "skipped") {
      res.status(400).json({
        message: "Review is skipped for this client. Allow the review first if you want to send it.",
      });
      return;
    }
    res.status(400).json({ message: "Could not send review request." });
    return;
  }
  res.json(result);
});

router.post("/admin/bookings/:id/review-request/skip", requireAdmin, async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) {
    res.status(400).json({ message: "Invalid id" });
    return;
  }
  const result = await skipReviewRequest(id);
  if ("error" in result) {
    if (result.error === "not_found") {
      res.status(404).json({ message: "Booking not found" });
      return;
    }
    if (result.error === "cancelled") {
      res.status(400).json({ message: "Appointment is cancelled." });
      return;
    }
    if (result.error === "already_sent") {
      res.status(400).json({ message: "Review link already sent. It cannot be skipped." });
      return;
    }
    res.status(400).json({ message: "Could not skip review request." });
    return;
  }
  res.json(result);
});

router.post("/admin/bookings/:id/review-request/unskip", requireAdmin, async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) {
    res.status(400).json({ message: "Invalid id" });
    return;
  }
  const result = await unskipReviewRequest(id);
  if ("error" in result) {
    if (result.error === "not_found") {
      res.status(404).json({ message: "Booking not found" });
      return;
    }
    res.status(400).json({ message: "Could not re-enable review request." });
    return;
  }
  res.json(result);
});

router.post("/admin/bookings/:id/review-request/retry", requireAdmin, async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) {
    res.status(400).json({ message: "Invalid id" });
    return;
  }
  const result = await retryReviewRequest(id);
  if ("error" in result) {
    if (result.error === "not_found") {
      res.status(404).json({ message: "Booking not found" });
      return;
    }
    if (result.error === "cancelled") {
      res.status(400).json({ message: "Appointment is cancelled." });
      return;
    }
    if (result.error === "sms_opt_out") {
      res.status(400).json({ message: "Customer opted out of SMS." });
      return;
    }
    res.status(400).json({ message: "No failed review request to retry." });
    return;
  }
  res.json(result);
});

export { cancelScheduledReviews };
export default router;
