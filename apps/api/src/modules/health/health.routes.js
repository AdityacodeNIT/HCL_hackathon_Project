import { Router } from "express";

const router = Router();

router.get("/", (_req, res) => {
  res.json({
    success: true,
    data: {
      status: "ok",
      service: "hospital-vaccine-api",
      timestamp: new Date().toISOString(),
    },
  });
});

export default router;
