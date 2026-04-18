import * as catalogService from "./catalog.service.js";

export async function getAdminMasterData(_req, res) {
  const data = await catalogService.getAdminMasterData();

  res.json({
    success: true,
    data,
  });
}

export async function getPublicVaccineCatalog(_req, res) {
  const data = await catalogService.getPublicVaccineCatalog();

  res.json({
    success: true,
    data,
  });
}

export async function searchPublicHospitals(req, res) {
  const data = await catalogService.searchPublicHospitals(req.query);

  res.json({
    success: true,
    data,
  });
}

export async function createHospital(req, res) {
  const data = await catalogService.createHospital(req.body);

  res.status(201).json({
    success: true,
    data,
  });
}

export async function updateHospital(req, res) {
  const data = await catalogService.updateHospital(req.params.hospitalId, req.body);

  res.json({
    success: true,
    data,
  });
}

export async function createVaccine(req, res) {
  const data = await catalogService.createVaccine(req.body);

  res.status(201).json({
    success: true,
    data,
  });
}

export async function createOrUpdateOffering(req, res) {
  const data = await catalogService.createOrUpdateOffering(req.body);

  res.status(201).json({
    success: true,
    data,
  });
}

export async function updateOfferingStatus(req, res) {
  const data = await catalogService.updateOfferingStatus(req.params.offeringId, req.body);

  res.json({
    success: true,
    data,
  });
}
