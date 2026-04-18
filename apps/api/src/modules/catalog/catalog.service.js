import HttpError from "../../utils/http-error.js";
import * as catalogRepo from "./catalog.repo.js";
import { seedAnganwadisForDate } from "../../db/anganwadi-seed.js";
import {
  validateHospitalPayload,
  validateOfferingPayload,
  validateOfferingPricePayload,
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
    priceInr: row.price_inr,
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

export async function searchPublicHospitals(query = {}) {
  const filters = {
    name: String(query.name || "").trim(),
    city: String(query.city || "").trim(),
    pincode: String(query.pincode || "").trim(),
    vaccineId: String(query.vaccineId || "").trim(),
    minPrice: query.minPrice ? Number(query.minPrice) : undefined,
    maxPrice: query.maxPrice ? Number(query.maxPrice) : undefined,
    slotDate: query.slotDate ? String(query.slotDate).trim() : undefined,
  };

  // Check if searching for Polio vaccine
  let isPolioSearch = false;
  if (filters.vaccineId) {
    const vaccine = await catalogRepo.findVaccineById(filters.vaccineId);
    if (vaccine && vaccine.name.toLowerCase() === 'polio') {
      isPolioSearch = true;
    }
  }

  // If Polio, search Anganwadis instead of hospitals
  if (isPolioSearch) {
    const rows = await catalogRepo.searchPublicAnganwadiOfferings(filters);
    const anganwadisById = new Map();

    rows.forEach((row) => {
      const anganwadiId = row.id;

      if (!anganwadisById.has(anganwadiId)) {
        anganwadisById.set(anganwadiId, {
          id: row.id,
          name: row.name,
          city: row.city,
          pincode: row.pincode,
          address: row.address,
          type: 'anganwadi',
          createdAt: row.created_at,
          updatedAt: row.updated_at,
          offerings: [],
        });
      }

      anganwadisById.get(anganwadiId).offerings.push({
        id: row.offering_id,
        isActive: row.is_active,
        priceInr: row.price_inr,
        createdAt: row.offering_created_at,
        updatedAt: row.offering_updated_at,
        vaccine: {
          id: row.vaccine_id,
          name: row.vaccine_name,
          description: row.vaccine_description,
          dosesRequired: row.doses_required,
        },
      });
    });

    return {
      filters,
      count: anganwadisById.size,
      hospitals: Array.from(anganwadisById.values()),
      type: 'anganwadi',
    };
  }

  // Regular hospital search
  const rows = await catalogRepo.searchPublicHospitalOfferings(filters);
  const hospitalsById = new Map();

  rows.forEach((row) => {
    const hospitalId = row.id;

    if (!hospitalsById.has(hospitalId)) {
      hospitalsById.set(hospitalId, {
        ...mapHospital(row),
        type: 'hospital',
        offerings: [],
      });
    }

    hospitalsById.get(hospitalId).offerings.push({
      id: row.offering_id,
      isActive: row.is_active,
      priceInr: row.price_inr,
      createdAt: row.offering_created_at,
      updatedAt: row.offering_updated_at,
      vaccine: {
        id: row.vaccine_id,
        name: row.vaccine_name,
        description: row.vaccine_description,
        dosesRequired: row.doses_required,
      },
    });
  });

  return {
    filters,
    count: hospitalsById.size,
    hospitals: Array.from(hospitalsById.values()),
    type: 'hospital',
  };
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

export async function updateOfferingPrice(offeringId, body) {
  const { isValid, payload, errors } = validateOfferingPricePayload(body);

  if (!isValid) {
    throw new HttpError(400, "VALIDATION_ERROR", errors[0], errors);
  }

  const existingOffering = await catalogRepo.findOfferingById(offeringId);

  if (!existingOffering) {
    throw new HttpError(404, "OFFERING_NOT_FOUND", "Offering could not be found.");
  }

  const offering = await catalogRepo.updateOfferingPrice(offeringId, payload.priceInr);
  return mapOffering(offering);
}

export async function seedAnganwadiData(body) {
  const { date } = body;

  if (!date) {
    throw new HttpError(400, "VALIDATION_ERROR", "Date is required.");
  }

  try {
    const result = await seedAnganwadisForDate(date);
    return result;
  } catch (error) {
    throw new HttpError(500, "SEED_ERROR", error.message);
  }
}
