import { Router } from "express";
import { USER_ROLES } from "../../config/constants.js";
import { authenticate, authorize } from "../../middleware/auth.js";
import asyncHandler from "../../utils/async-handler.js";
import * as catalogController from "./catalog.controller.js";

const router = Router();
const adminGuard = [authenticate, authorize([USER_ROLES.ADMIN])];

router.get("/vaccines", asyncHandler(catalogController.getPublicVaccineCatalog));
router.get("/hospitals/search", asyncHandler(catalogController.searchPublicHospitals));

router.get("/admin/master-data", ...adminGuard, asyncHandler(catalogController.getAdminMasterData));
router.post("/admin/hospitals", ...adminGuard, asyncHandler(catalogController.createHospital));
router.put("/admin/hospitals/:hospitalId", ...adminGuard, asyncHandler(catalogController.updateHospital));
router.post("/admin/vaccines", ...adminGuard, asyncHandler(catalogController.createVaccine));
router.post("/admin/offerings", ...adminGuard, asyncHandler(catalogController.createOrUpdateOffering));
router.put(
  "/admin/offerings/:offeringId/price",
  ...adminGuard,
  asyncHandler(catalogController.updateOfferingPrice)
);
router.patch(
  "/admin/offerings/:offeringId",
  ...adminGuard,
  asyncHandler(catalogController.updateOfferingStatus)
);

export default router;
