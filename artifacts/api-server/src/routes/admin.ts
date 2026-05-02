import { Router, type IRouter, type Request, type Response, type NextFunction } from "express";
import { db, bookingsTable } from "@workspace/db";
import { asc, eq } from "drizzle-orm";

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

export default router;
