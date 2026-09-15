// Twilio Messaging webhook for inbound SMS.
//
// Configure in Twilio Console → Phone Numbers → your Apex number →
// Messaging → "A message comes in" webhook:
//   POST https://<your-replit-host>/api/twilio/sms?token=<TWILIO_WEBHOOK_TOKEN>
//
// TWILIO_WEBHOOK_TOKEN is optional but recommended so random POSTs are rejected.

import { Router, type IRouter } from "express";
import { handleInboundSms } from "../lib/inbound-sms";

const router: IRouter = Router();

const EMPTY_TWIML =
  '<?xml version="1.0" encoding="UTF-8"?><Response></Response>';

function webhookAuthorized(req: { query: Record<string, unknown> }): boolean {
  const expected = process.env["TWILIO_WEBHOOK_TOKEN"]?.trim();
  if (!expected) return true;
  const got = typeof req.query.token === "string" ? req.query.token : "";
  return got === expected;
}

router.post("/twilio/sms", async (req, res) => {
  if (!webhookAuthorized(req)) {
    res.status(401).type("text/plain").send("Unauthorized");
    return;
  }

  const body = req.body as Record<string, unknown>;
  const from = typeof body.From === "string" ? body.From : "";
  const to = typeof body.To === "string" ? body.To : "";
  const text = typeof body.Body === "string" ? body.Body : "";
  const messageSid =
    typeof body.MessageSid === "string"
      ? body.MessageSid
      : typeof body.SmsSid === "string"
        ? body.SmsSid
        : undefined;

  try {
    const result = await handleInboundSms({
      from,
      to,
      body: text,
      messageSid,
    });
    console.log(
      `[twilio-webhook] inbound from=${from} forwarded=${result.forwarded} booking=${result.bookingId ?? "-"} skip=${result.skipped ?? "-"}`,
    );
  } catch (err) {
    console.error("[twilio-webhook] handler error:", err);
  }

  // Empty TwiML = no auto-reply to the customer (owner gets the forward).
  res.status(200).type("text/xml").send(EMPTY_TWIML);
});

export default router;
