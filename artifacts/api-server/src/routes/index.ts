import { Router, type IRouter } from "express";
import healthRouter from "./health";
import bookingRouter from "./booking";
import adminRouter from "./admin";
import twilioWebhookRouter from "./twilio-webhook";

const router: IRouter = Router();

router.use(healthRouter);
router.use(bookingRouter);
router.use(adminRouter);
router.use(twilioWebhookRouter);

export default router;
