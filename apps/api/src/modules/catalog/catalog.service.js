import HttpError from "../../utils/http-error.js";
import * as catalogRepo from "./catalog.repo.js";
import {
  validateHospitalPayload,
  validateOfferingPayload,
  validateOfferingStatusPayload,
  validateVaccinePayload,
} from "./catalog.validation.js";

function mapHospital(row) {
  return {
    id: row.id,
    name: row.name,
    city: row.city,
    pincode: row.pincode,
    address: row.address,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapVaccine(row) {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    dosesRequired: row.doses_required,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapOffering(row) {
  return {
    id: row.id,
    hospitalId: row.hospital_id,
    vaccineId: row.vaccine_id,
    isActive: row.is_active,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    vaccine: row.vaccine_name
      ? {
          id: row.vaccine_id,
          name: row.vaccine_name,
          description: row.vaccine_description,
          dosesRequired: row.doses_required,
        }
      : null,
  };
}

export async function getAdminMasterData() {
  const [hospitalRows, vaccineRows, offeringRows] = await Promise.all([
    catalogRepo.listHospitals(),
    catalogRepo.listVaccines(),
    catalogRepo.listOfferings(),
  ]);

  const hospitalsById = new Map(
    hospitalRows.map((row) => [
      row.id,
      {
        ...mapHospital(row),
        offerings: [],
      },
    ])
  );

  offeringRows.forEach((row) => {
    const hospital = hospitalsById.get(row.hospital_id);

    if (hospital) {
      hospital.offerings.push(mapOffering(row));
    }
  });

  return {
    hospitals: Array.from(hospitalsById.values()),
    vaccines: vaccineRows.map(mapVaccine),
    counts: {
      hospitals: hospitalRows.length,
      vaccines: vaccineRows.length,
      offerings: offeringRows.length,
    },
  };
}

export async function getPublicVaccineCatalog() {
  const vaccineRows = await catalogRepo.listVaccines();
  return vaccineRows.map(mapVaccine);
}

export async function createHospital(body) {
  const { isValid, payload, errors } = validateHospitalPayload(body);

  if (!isValid) {
    throw new HttpError(400, "VALIDATION_ERROR", errors[0], errors);
  }

  const hospital = await catalogRepo.createHospital(payload);
  return mapHospital(hospital);
}

export async function updateHospital(hospitalId, body) {
  const { isValid, payload, errors } = validateHospitalPayload(body);

  if (!isValid) {
    throw new HttpError(400, "VALIDATION_ERROR", errors[0], errors);
  }

  const existingHospital = await catalogRepo.findHospitalById(hospitalId);

  if (!existingHospital) {
    throw new HttpError(404, "HOSPITAL_NOT_FOUND", "Hospital could not be found.");
  }

  const hospital = await catalogRepo.updateHospital(hospitalId, payload);
  return mapHospital(hospital);
}

export async function createVaccine(body) {
  const { isValid, payload, errors } = validateVaccinePayload(body);

  if (!isValid) {
    throw new HttpError(400, "VALIDATION_ERROR", errors[0], errors);
  }

  const existingVaccine = await catalogRepo.findVaccineByName(payload.name);

  if (existingVaccine) {
    throw new HttpError(409, "VACCINE_EXISTS", "A vaccine with this name already exists.");
  }

  const vaccine = await catalogRepo.createVaccine(payload);
  return mapVaccine(vaccine);
}

export async function createOrUpdateOffering(body) {
  const { isValid, payload, errors } = validateOfferingPayload(body);

  if (!isValid) {
    throw new HttpError(400, "VALIDATION_ERROR", errors[0], errors);
  }

  const [hospital, vaccine] = await Promise.all([
    catalogRepo.findHospitalById(payload.hospitalId),
    catalogRepo.findVaccineById(payload.vaccineId),
  ]);

  if (!hospital) {
    throw new HttpError(404, "HOSPITAL_NOT_FOUND", "Hospital could not be found.");
  }

  if (!vaccine) {
    throw new HttpError(404, "VACCINE_NOT_FOUND", "Vaccine could not be found.");
  }

  const offering = await catalogRepo.upsertOffering(payload);

  return {
    ...mapOffering({
      ...offering,
      vaccine_name: vaccine.name,
      vaccine_description: vaccine.description,
      doses_required: vaccine.doses_required,
    }),
    hospital: mapHospital(hospital),
  };
}

export async function updateOfferingStatus(offeringId, body) {
  const { isValid, payload, errors } = validateOfferingStatusPayload(body);

  if (!isValid) {
    throw new HttpError(400, "VALIDATION_ERROR", errors[0], errors);
  }

  const existingOffering = await catalogRepo.findOfferingById(offeringId);

  if (!existingOffering) {
    throw new HttpError(404, "OFFERING_NOT_FOUND", "Offering could not be found.");
  }

  const offering = await catalogRepo.updateOfferingStatus(offeringId, payload.isActive);
  return mapOffering(offering);
}
