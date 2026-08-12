import { Router, type IRouter } from "express";
import { lookupVehicleImage, normalizeVehicleQuery } from "../lib/vehicle-image";

const router: IRouter = Router();

router.get("/vehicle-image", async (req, res) => {
  const raw = typeof req.query.q === "string" ? req.query.q : "";
  if (raw.length > 80) {
    res.status(400).json({ message: "Query is too long.", url: null });
    return;
  }
  const query = normalizeVehicleQuery(raw);
  if (!query) {
    res.json({ url: null, title: null, query: "" });
    return;
  }
  try {
    const result = await lookupVehicleImage(raw);
    res.setHeader("Cache-Control", "public, max-age=3600");
    res.json({
      url: result?.url ?? null,
      title: result?.title ?? null,
      query,
    });
  } catch (err) {
    console.error("[vehicle-image] lookup failed:", err);
    res.status(502).json({ message: "Could not look up a vehicle photo.", url: null });
  }
});

export default router;
