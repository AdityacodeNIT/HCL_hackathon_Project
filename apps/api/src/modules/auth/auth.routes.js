import { Router } from "express";
import { authenticate } from "../../middleware/auth.js";
import asyncHandler from "../../utils/async-handler.js";
import * as authController from "./auth.controller.js";

const router = Router();

router.post("/register", asyncHandler(authController.register));
router.post("/login", asyncHandler(authController.login));
router.get("/me", authenticate, asyncHandler(authController.me));
router.post("/logout", authenticate, asyncHandler(authController.logout));

export default router;
