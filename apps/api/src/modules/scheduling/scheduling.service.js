import crypto from "node:crypto";
import pool from "../../db/pool.js";
import { BOOKING_STATUSES } from "../../config/constants.js";
import * as catalogRepo from "../catalog/catalog.repo.js";
import HttpError from "../../utils/http-error.js";
import * as schedulingRepo from "./scheduling.repo.js";
import {
  validateAdminFilters,
  validateAvailabilityQuery,
  validateBookingPayload,
  validateSlotPayload,
} from "./scheduling.validation.js";

function getTodayInIndia() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(new Date());
}

function mapSlot(row) {
  return {
    id: row.id || row.slot_id,
    offeringId: row.hospital_vaccine_id || row.offering_id,
    date: row.slot_date,
    startTime: String(row.start_time).slice(0, 5),
    endTime: String(row.end_time).slice(0, 5),
    capacity: row.capacity,
    bookedCount: row.booked_count,
    remainingCapacity: row.capacity - row.booked_count,
    priceInr: row.price_inr,
    isActive: row.is_active,
    createdAt: row.created_at || row.slot_created_at,
    updatedAt: row.updated_at || row.slot_updated_at,
    hospital: row.hospital_id
      ? {
          id: row.hospital_id,
          name: row.hospital_name,
          city: row.city,
          pincode: row.pincode,
          address: row.address,
        }
      : null,
    vaccine: row.vaccine_id
      ? {
          id: row.vaccine_id,
          name: row.vaccine_name,
          description: row.vaccine_description,
          dosesRequired: row.doses_required,
        }
      : null,
  };
}

function mapBooking(row) {
  return {
    id: row.id,
    status: row.status,
    confirmationCode: row.confirmation_code,
    lockedPriceInr: row.locked_price_inr,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    user: row.full_name
      ? {
          id: row.user_id,
          fullName: row.full_name,
          email: row.email,
        }
      : null,
    hospital: {
      id: row.hospital_id,
      name: row.hospital_name,
      city: row.city,
      pincode: row.pincode,
      address: row.address,
    },
    vaccine: {
      id: row.vaccine_id,
      name: row.vaccine_name,
      description: row.vaccine_description,
      dosesRequired: row.doses_required,
    },
    slot: {
      id: row.time_slot_id,
      date: row.slot_date,
      startTime: String(row.start_time).slice(0, 5),
      endTime: String(row.end_time).slice(0, 5),
      capacity: row.capacity,
      bookedCount: row.booked_count,
      remainingCapacity: row.capacity - row.booked_count,
    },
  };
}

function ensureFutureOrToday(date) {
  if (date < getTodayInIndia()) {
    throw new HttpError(400, "INVALID_DATE", "Bookings are only allowed for today or future dates.");
  }
}

function createConfirmationCode() {
  return `VBK-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;
}

function normalizeDatabaseError(error, duplicateMessage) {
  if (error.code === "23505") {
    throw new HttpError(409, "DUPLICATE_RECORD", duplicateMessage);
  }

  throw error;
}

export async function getHospitalAvailability(hospitalId, query) {
  const { isValid, payload, errors } = validateAvailabilityQuery(query);

  if (!isValid) {
    throw new HttpError(400, "VALIDATION_ERROR", errors[0], errors);
  }

  const hospital = await catalogRepo.findHospitalById(hospitalId);

  if (!hospital) {
    throw new HttpError(404, "HOSPITAL_NOT_FOUND", "Hospital could not be found.");
  }

  const rows = await schedulingRepo.listAvailabilityByHospital({
    hospitalId,
    date: payload.date,
    vaccineId: payload.vaccineId,
  });

  const offeringsById = new Map();

  rows.forEach((row) => {
    if (!offeringsById.has(row.offering_id)) {
      offeringsById.set(row.offering_id, {
        id: row.offering_id,
        priceInr: row.price_inr,
        vaccine: {
          id: row.vaccine_id,
          name: row.vaccine_name,
          description: row.vaccine_description,
          dosesRequired: row.doses_required,
        },
        slots: [],
      });
    }

    offeringsById.get(row.offering_id).slots.push(mapSlot(row));
  });

  return {
    hospital: {
      id: hospital.id,
      name: hospital.name,
      city: hospital.city,
      pincode: hospital.pincode,
      address: hospital.address,
    },
    date: payload.date || null,
    offerings: Array.from(offeringsById.values()),
  };
}

export async function createSlot(body) {
  const { isValid, payload, errors } = validateSlotPayload(body);

  if (!isValid) {
    throw new HttpError(400, "VALIDATION_ERROR", errors[0], errors);
  }

  const offering = await schedulingRepo.findOfferingByIdWithDetails(payload.offeringId);

  if (!offering) {
    throw new HttpError(404, "OFFERING_NOT_FOUND", "Offering could not be found.");
  }

  try {
    const slot = await schedulingRepo.createTimeSlot(payload);
    const slotWithDetails = await schedulingRepo.findSlotById(slot.id);
    return mapSlot(slotWithDetails);
  } catch (error) {
    normalizeDatabaseError(error, "A slot with the same date and time already exists for this offering.");
  }
}

export async function updateSlot(slotId, body) {
  const { isValid, payload, errors } = validateSlotPayload(body);

  if (!isValid) {
    throw new HttpError(400, "VALIDATION_ERROR", errors[0], errors);
  }

  const existingSlot = await schedulingRepo.findSlotById(slotId);

  if (!existingSlot) {
    throw new HttpError(404, "SLOT_NOT_FOUND", "Time slot could not be found.");
  }

  if (
    existingSlot.booked_count > 0 &&
    existingSlot.hospital_vaccine_id !== payload.offeringId
  ) {
    throw new HttpError(
      400,
      "SLOT_LOCKED",
      "Slots with active bookings cannot be moved to a different offering."
    );
  }

  try {
    const slot = await schedulingRepo.updateTimeSlot(slotId, payload);

    if (!slot) {
      throw new HttpError(
        400,
        "INVALID_CAPACITY",
        "Capacity cannot be reduced below the number of already booked seats."
      );
    }

    const slotWithDetails = await schedulingRepo.findSlotById(slot.id);
    return mapSlot(slotWithDetails);
  } catch (error) {
    normalizeDatabaseError(error, "A slot with the same date and time already exists for this offering.");
  }
}

export async function listSlots(query) {
  const { isValid, payload, errors } = validateAdminFilters(query);

  if (!isValid) {
    throw new HttpError(400, "VALIDATION_ERROR", errors[0], errors);
  }

  const rows = await schedulingRepo.listAdminSlots(payload);
  return rows.map(mapSlot);
}

export async function listAdminBookings(query) {
  const { isValid, payload, errors } = validateAdminFilters(query);

  if (!isValid) {
    throw new HttpError(400, "VALIDATION_ERROR", errors[0], errors);
  }

  const filters = {
    ...payload,
    date: payload.date || getTodayInIndia(),
  };

  const rows = await schedulingRepo.listAdminBookings(filters);
  return {
    date: filters.date,
    bookings: rows.map(mapBooking),
  };
}

export async function createBooking(userId, body) {
  const { isValid, payload, errors } = validateBookingPayload(body);

  if (!isValid) {
    throw new HttpError(400, "VALIDATION_ERROR", errors[0], errors);
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const slot = await schedulingRepo.findSlotById(payload.timeSlotId, client, { forUpdate: true });

    if (!slot || !slot.is_active) {
      throw new HttpError(404, "SLOT_NOT_FOUND", "The selected slot is not available.");
    }

    ensureFutureOrToday(slot.slot_date);

    const duplicateBooking = await schedulingRepo.findDuplicateActiveBooking(
      userId,
      slot.hospital_vaccine_id,
      slot.slot_date,
      client
    );

    if (duplicateBooking) {
      throw new HttpError(
        409,
        "DUPLICATE_BOOKING",
        "You already have an active booking for this vaccine on the selected date."
      );
    }

    const updatedSlot = await schedulingRepo.adjustSlotBookedCount(slot.id, 1, client);

    if (!updatedSlot) {
      throw new HttpError(409, "SLOT_UNAVAILABLE", "No seats remain for the selected slot.");
    }

    const booking = await schedulingRepo.insertBooking(
      {
        userId,
        hospitalVaccineId: slot.hospital_vaccine_id,
        timeSlotId: slot.id,
        status: BOOKING_STATUSES.BOOKED,
        lockedPriceInr: slot.price_inr,
        confirmationCode: createConfirmationCode(),
      },
      client
    );

    await client.query("COMMIT");

    const savedBooking = await schedulingRepo.findBookingById(booking.id);
    return mapBooking(savedBooking);
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function listMyBookings(userId) {
  const rows = await schedulingRepo.listMyBookings(userId);
  return rows.map(mapBooking);
}

export async function rescheduleBooking(userId, bookingId, body) {
  const { isValid, payload, errors } = validateBookingPayload(body);

  if (!isValid) {
    throw new HttpError(400, "VALIDATION_ERROR", errors[0], errors);
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const booking = await schedulingRepo.findBookingById(bookingId, client, { forUpdate: true });

    if (!booking || booking.user_id !== userId) {
      throw new HttpError(404, "BOOKING_NOT_FOUND", "Booking could not be found.");
    }

    if (booking.status !== BOOKING_STATUSES.BOOKED) {
      throw new HttpError(400, "BOOKING_CANCELLED", "Cancelled bookings cannot be modified.");
    }

    const newSlot = await schedulingRepo.findSlotById(payload.timeSlotId, client, { forUpdate: true });

    if (!newSlot || !newSlot.is_active) {
      throw new HttpError(404, "SLOT_NOT_FOUND", "The selected slot is not available.");
    }

    ensureFutureOrToday(newSlot.slot_date);

    const duplicateBooking = await schedulingRepo.findDuplicateActiveBooking(
      userId,
      newSlot.hospital_vaccine_id,
      newSlot.slot_date,
      client,
      bookingId
    );

    if (duplicateBooking) {
      throw new HttpError(
        409,
        "DUPLICATE_BOOKING",
        "You already have an active booking for this vaccine on the selected date."
      );
    }

    if (booking.time_slot_id !== newSlot.id) {
      const incrementedSlot = await schedulingRepo.adjustSlotBookedCount(newSlot.id, 1, client);

      if (!incrementedSlot) {
        throw new HttpError(409, "SLOT_UNAVAILABLE", "No seats remain for the selected slot.");
      }

      const decrementedOldSlot = await schedulingRepo.adjustSlotBookedCount(booking.time_slot_id, -1, client);

      if (!decrementedOldSlot) {
        throw new HttpError(409, "SLOT_UPDATE_FAILED", "Could not release the previous slot.");
      }
    }

    await schedulingRepo.updateBooking(
      bookingId,
      {
        hospitalVaccineId: newSlot.hospital_vaccine_id,
        timeSlotId: newSlot.id,
        lockedPriceInr: newSlot.price_inr,
      },
      client
    );

    await client.query("COMMIT");

    const updatedBooking = await schedulingRepo.findBookingById(bookingId);
    return mapBooking(updatedBooking);
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function cancelBooking(userId, bookingId) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const booking = await schedulingRepo.findBookingById(bookingId, client, { forUpdate: true });

    if (!booking || booking.user_id !== userId) {
      throw new HttpError(404, "BOOKING_NOT_FOUND", "Booking could not be found.");
    }

    if (booking.status !== BOOKING_STATUSES.BOOKED) {
      throw new HttpError(400, "BOOKING_ALREADY_CANCELLED", "This booking is already cancelled.");
    }

    const updatedSlot = await schedulingRepo.adjustSlotBookedCount(booking.time_slot_id, -1, client);

    if (!updatedSlot) {
      throw new HttpError(409, "SLOT_UPDATE_FAILED", "Could not release the booked slot.");
    }

    await schedulingRepo.updateBookingStatus(bookingId, BOOKING_STATUSES.CANCELLED, client);

    await client.query("COMMIT");

    const cancelledBooking = await schedulingRepo.findBookingById(bookingId);
    return mapBooking(cancelledBooking);
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}
