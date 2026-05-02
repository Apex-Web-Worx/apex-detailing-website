import { Router, type IRouter, type Request, type Response, type NextFunction } from "express";
import { db, bookingsTable, blockedDatesTable } from "@workspace/db";
import { asc, eq } from "drizzle-orm";
import { parseDateString, todayInShopLocal } from "../lib/availability";

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

router.get("/admin/bookings", requireAdmin, async (_req, res) => {
  const rows = await db
    .select()
    .from(bookingsTable)
    .orderBy(asc(bookingsTable.scheduledAt));
  res.json(rows);
});

router.delete("/admin/bookings/:id", requireAdmin, async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) {
    res.status(400).json({ message: "Invalid id" });
    return;
  }
  await db
    .update(bookingsTable)
    .set({ status: "cancelled" })
    .where(eq(bookingsTable.id, id));
  res.status(204).send();
});

router.get("/admin/blocked-dates", requireAdmin, async (_req, res) => {
  const rows = await db
    .select()
    .from(blockedDatesTable)
    .orderBy(asc(blockedDatesTable.date));
  res.json(rows);
});

router.post("/admin/blocked-dates", requireAdmin, async (req, res) => {
  const { date, reason } = (req.body ?? {}) as {
    date?: unknown;
    reason?: unknown;
  };
  if (typeof date !== "string" || !parseDateString(date)) {
    res.status(400).json({ message: "Invalid date. Use YYYY-MM-DD." });
    return;
  }
  if (date < todayInShopLocal()) {
    res.status(400).json({ message: "Cannot block a date in the past." });
    return;
  }
  const reasonStr =
    typeof reason === "string" ? reason.slice(0, 200) : "";
  try {
    const [created] = await db
      .insert(blockedDatesTable)
      .values({ date, reason: reasonStr })
      .returning();
    res.status(201).json(created);
  } catch (err) {
    let cur: unknown = err;
    let pgCode: unknown;
    for (let i = 0; i < 5 && cur; i++) {
      if (typeof cur === "object" && cur !== null && "code" in cur) {
        pgCode = (cur as { code?: unknown }).code;
        if (pgCode) break;
      }
      cur =
        typeof cur === "object" && cur !== null && "cause" in cur
          ? (cur as { cause?: unknown }).cause
          : undefined;
    }
    if (pgCode === "23505") {
      res.status(409).json({ message: "That date is already blocked." });
      return;
    }
    throw err;
  }
});

router.delete("/admin/blocked-dates/:date", requireAdmin, async (req, res) => {
  const raw = req.params.date;
  const date = typeof raw === "string" ? raw : "";
  if (!date || !parseDateString(date)) {
    res.status(400).json({ message: "Invalid date. Use YYYY-MM-DD." });
    return;
  }
  await db.delete(blockedDatesTable).where(eq(blockedDatesTable.date, date));
  res.status(204).send();
});

export default router;
