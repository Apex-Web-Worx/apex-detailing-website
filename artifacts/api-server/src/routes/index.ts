import { Router, type IRouter } from "express";
import healthRouter from "./health";
import bookingRouter from "./booking";
import adminRouter from "./admin";

const router: IRouter = Router();

router.use(healthRouter);
router.use(bookingRouter);
router.use(adminRouter);

export default router;
