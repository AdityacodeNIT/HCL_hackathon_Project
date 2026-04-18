import { Router } from "express";
import { USER_ROLES } from "../../config/constants.js";
import { authenticate, authorize } from "../../middleware/auth.js";
import asyncHandler from "../../utils/async-handler.js";
import * as schedulingController from "./scheduling.controller.js";

const router = Router();
const adminGuard = [authenticate, authorize([USER_ROLES.ADMIN])];
const patientGuard = [authenticate, authorize([USER_ROLES.PATIENT])];

router.get(
  "/hospitals/:hospitalId/availability",
  authenticate,
  authorize([USER_ROLES.PATIENT, USER_ROLES.ADMIN]),
  asyncHandler(schedulingController.getHospitalAvailability)
);

router.get("/admin/slots", ...adminGuard, asyncHandler(schedulingController.listSlots));
router.post("/admin/slots", ...adminGuard, asyncHandler(schedulingController.createSlot));
router.put("/admin/slots/:slotId", ...adminGuard, asyncHandler(schedulingController.updateSlot));
router.get("/admin/bookings", ...adminGuard, asyncHandler(schedulingController.listAdminBookings));
router.get("/admin/hospitals/:hospitalId/bookings", ...adminGuard, asyncHandler(schedulingController.listHospitalBookings));
router.patch("/admin/bookings/:bookingId/approve", ...adminGuard, asyncHandler(schedulingController.approveBooking));
router.patch("/admin/bookings/:bookingId/complete", ...adminGuard, asyncHandler(schedulingController.completeBooking));
router.delete("/admin/bookings/:bookingId", ...adminGuard, asyncHandler(schedulingController.adminCancelBooking));

router.post("/bookings", ...patientGuard, asyncHandler(schedulingController.createBooking));
router.get("/bookings/me", ...patientGuard, asyncHandler(schedulingController.listMyBookings));
router.patch("/bookings/:bookingId", ...patientGuard, asyncHandler(schedulingController.rescheduleBooking));
router.delete("/bookings/:bookingId", ...patientGuard, asyncHandler(schedulingController.cancelBooking));

export default router;
