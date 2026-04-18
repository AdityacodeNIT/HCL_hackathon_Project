function normalizeText(value) {
  return String(value || "").trim();
}

export function validateHospitalPayload(body = {}) {
  const payload = {
    name: normalizeText(body.name),
    city: normalizeText(body.city),
    pincode: normalizeText(body.pincode),
    address: normalizeText(body.address),
  };
  const errors = [];

  if (!payload.name) {
    errors.push("Hospital name is required.");
  }

  if (!payload.city) {
    errors.push("City is required.");
  }

  if (!payload.pincode) {
    errors.push("Pincode is required.");
  } else if (!/^\d{6}$/.test(payload.pincode)) {
    errors.push("Pincode must be a 6-digit number.");
  }

  if (!payload.address) {
    errors.push("Address is required.");
  }

  return {
    isValid: errors.length === 0,
    payload,
    errors,
  };
}

export function validateVaccinePayload(body = {}) {
  const payload = {
    name: normalizeText(body.name),
    description: normalizeText(body.description),
    dosesRequired: Number(body.dosesRequired || 1),
  };
  const errors = [];

  if (!payload.name) {
    errors.push("Vaccine name is required.");
  }

  if (!Number.isInteger(payload.dosesRequired) || payload.dosesRequired < 1) {
    errors.push("Doses required must be at least 1.");
  }

  return {
    isValid: errors.length === 0,
    payload,
    errors,
  };
}

export function validateOfferingPayload(body = {}) {
  const payload = {
    hospitalId: normalizeText(body.hospitalId),
    vaccineId: normalizeText(body.vaccineId),
    isActive: body.isActive !== false,
  };
  const errors = [];

  if (!payload.hospitalId) {
    errors.push("Hospital is required.");
  }

  if (!payload.vaccineId) {
    errors.push("Vaccine is required.");
  }

  return {
    isValid: errors.length === 0,
    payload,
    errors,
  };
}

export function validateOfferingStatusPayload(body = {}) {
  return {
    isValid: typeof body.isActive === "boolean",
    payload: {
      isActive: body.isActive,
    },
    errors:
      typeof body.isActive === "boolean"
        ? []
        : ["Offering status must include a boolean isActive value."],
  };
}
