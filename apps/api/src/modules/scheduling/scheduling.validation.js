function normalizeText(value) {
  return String(value || "").trim();
}

function isDateString(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function isTimeString(value) {
  return /^\d{2}:\d{2}(:\d{2})?$/.test(value);
}

export function validateAvailabilityQuery(query = {}) {
  const payload = {
    date: normalizeText(query.date),
    vaccineId: normalizeText(query.vaccineId),
  };
  const errors = [];

  if (payload.date && !isDateString(payload.date)) {
    errors.push("Date must be in YYYY-MM-DD format.");
  }

  return {
    isValid: errors.length === 0,
    payload,
    errors,
  };
}

export function validateSlotPayload(body = {}) {
  const payload = {
    offeringId: normalizeText(body.offeringId),
    date: normalizeText(body.date),
    startTime: normalizeText(body.startTime),
    endTime: normalizeText(body.endTime),
    capacity: Number(body.capacity),
  };
  const errors = [];

  if (!payload.offeringId) {
    errors.push("Offering is required.");
  }

  if (!payload.date || !isDateString(payload.date)) {
    errors.push("Slot date must be in YYYY-MM-DD format.");
  }

  if (!payload.startTime || !isTimeString(payload.startTime)) {
    errors.push("Start time must be in HH:MM format.");
  }

  if (!payload.endTime || !isTimeString(payload.endTime)) {
    errors.push("End time must be in HH:MM format.");
  }

  if (!Number.isInteger(payload.capacity) || payload.capacity < 1) {
    errors.push("Capacity must be at least 1.");
  }

  return {
    isValid: errors.length === 0,
    payload,
    errors,
  };
}

export function validateBookingPayload(body = {}) {
  const payload = {
    timeSlotId: normalizeText(body.timeSlotId),
  };
  const errors = [];

  if (!payload.timeSlotId) {
    errors.push("Time slot is required.");
  }

  return {
    isValid: errors.length === 0,
    payload,
    errors,
  };
}

export function validateAdminFilters(query = {}) {
  const payload = {
    date: normalizeText(query.date),
    hospitalId: normalizeText(query.hospitalId),
    vaccineId: normalizeText(query.vaccineId),
  };
  const errors = [];

  if (payload.date && !isDateString(payload.date)) {
    errors.push("Date must be in YYYY-MM-DD format.");
  }

  return {
    isValid: errors.length === 0,
    payload,
    errors,
  };
}
