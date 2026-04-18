import pool from "../../db/pool.js";

function runQuery(db, sql, params = []) {
  return db.query(sql, params);
}

export async function findOfferingByIdWithDetails(offeringId, db = pool) {
  const result = await runQuery(
    db,
    `
      SELECT
        hv.id,
        hv.hospital_id,
        hv.vaccine_id,
        hv.is_active,
        hv.price_inr,
        hv.created_at,
        hv.updated_at,
        h.name AS hospital_name,
        h.city,
        h.pincode,
        h.address,
        v.name AS vaccine_name,
        v.description AS vaccine_description,
        v.doses_required
      FROM hospital_vaccines hv
      INNER JOIN hospitals h ON h.id = hv.hospital_id
      INNER JOIN vaccines v ON v.id = hv.vaccine_id
      WHERE hv.id = $1
      LIMIT 1
    `,
    [offeringId]
  );

  return result.rows[0] || null;
}

export async function createTimeSlot(payload, db = pool) {
  const result = await runQuery(
    db,
    `
      INSERT INTO time_slots (hospital_vaccine_id, slot_date, start_time, end_time, capacity)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, hospital_vaccine_id, slot_date, start_time, end_time, capacity, booked_count, created_at, updated_at
    `,
    [payload.offeringId, payload.date, payload.startTime, payload.endTime, payload.capacity]
  );

  return result.rows[0];
}

export async function updateTimeSlot(slotId, payload, db = pool) {
  const result = await runQuery(
    db,
    `
      UPDATE time_slots
      SET
        hospital_vaccine_id = $2,
        slot_date = $3,
        start_time = $4,
        end_time = $5,
        capacity = $6,
        updated_at = NOW()
      WHERE id = $1
        AND booked_count <= $6
      RETURNING id, hospital_vaccine_id, slot_date, start_time, end_time, capacity, booked_count, created_at, updated_at
    `,
    [slotId, payload.offeringId, payload.date, payload.startTime, payload.endTime, payload.capacity]
  );

  return result.rows[0] || null;
}

export async function findSlotById(slotId, db = pool, { forUpdate = false } = {}) {
  const result = await runQuery(
    db,
    `
      SELECT
        ts.id,
        ts.hospital_vaccine_id,
        ts.slot_date,
        ts.start_time,
        ts.end_time,
        ts.capacity,
        ts.booked_count,
        ts.created_at,
        ts.updated_at,
        hv.is_active,
        hv.price_inr,
        hv.hospital_id,
        hv.vaccine_id,
        h.name AS hospital_name,
        h.city,
        h.pincode,
        h.address,
        v.name AS vaccine_name,
        v.description AS vaccine_description,
        v.doses_required
      FROM time_slots ts
      INNER JOIN hospital_vaccines hv ON hv.id = ts.hospital_vaccine_id
      INNER JOIN hospitals h ON h.id = hv.hospital_id
      INNER JOIN vaccines v ON v.id = hv.vaccine_id
      WHERE ts.id = $1
      LIMIT 1
      ${forUpdate ? "FOR UPDATE OF ts" : ""}
    `,
    [slotId]
  );

  return result.rows[0] || null;
}

export async function listAvailabilityByHospital(filters, db = pool) {
  const params = [filters.hospitalId];
  const conditions = ["h.id = $1", "hv.is_active = TRUE"];

  if (filters.date) {
    params.push(filters.date);
    conditions.push(`ts.slot_date = $${params.length}`);
  } else {
    conditions.push("ts.slot_date >= CURRENT_DATE");
  }

  if (filters.vaccineId) {
    params.push(filters.vaccineId);
    conditions.push(`v.id = $${params.length}`);
  }

  const result = await runQuery(
    db,
    `
      SELECT
        h.id AS hospital_id,
        h.name AS hospital_name,
        h.city,
        h.pincode,
        h.address,
        hv.id AS offering_id,
        hv.price_inr,
        v.id AS vaccine_id,
        v.name AS vaccine_name,
        v.description AS vaccine_description,
        v.doses_required,
        ts.id AS slot_id,
        ts.slot_date,
        ts.start_time,
        ts.end_time,
        ts.capacity,
        ts.booked_count,
        ts.created_at AS slot_created_at,
        ts.updated_at AS slot_updated_at
      FROM hospitals h
      INNER JOIN hospital_vaccines hv ON hv.hospital_id = h.id
      INNER JOIN vaccines v ON v.id = hv.vaccine_id
      INNER JOIN time_slots ts ON ts.hospital_vaccine_id = hv.id
      WHERE ${conditions.join(" AND ")}
      ORDER BY ts.slot_date ASC, ts.start_time ASC, v.name ASC
    `,
    params
  );

  return result.rows;
}

export async function listAdminSlots(filters, db = pool) {
  const params = [];
  const conditions = ["1 = 1"];

  if (filters.date) {
    params.push(filters.date);
    conditions.push(`ts.slot_date = $${params.length}`);
  }

  if (filters.hospitalId) {
    params.push(filters.hospitalId);
    conditions.push(`h.id = $${params.length}`);
  }

  if (filters.vaccineId) {
    params.push(filters.vaccineId);
    conditions.push(`v.id = $${params.length}`);
  }

  const result = await runQuery(
    db,
    `
      SELECT
        ts.id,
        ts.hospital_vaccine_id,
        ts.slot_date,
        ts.start_time,
        ts.end_time,
        ts.capacity,
        ts.booked_count,
        ts.created_at,
        ts.updated_at,
        hv.is_active,
        hv.price_inr,
        h.id AS hospital_id,
        h.name AS hospital_name,
        h.city,
        v.id AS vaccine_id,
        v.name AS vaccine_name
      FROM time_slots ts
      INNER JOIN hospital_vaccines hv ON hv.id = ts.hospital_vaccine_id
      INNER JOIN hospitals h ON h.id = hv.hospital_id
      INNER JOIN vaccines v ON v.id = hv.vaccine_id
      WHERE ${conditions.join(" AND ")}
      ORDER BY ts.slot_date ASC, ts.start_time ASC, h.name ASC, v.name ASC
    `,
    params
  );

  return result.rows;
}

export async function adjustSlotBookedCount(slotId, delta, db = pool) {
  const result = await runQuery(
    db,
    `
      UPDATE time_slots
      SET
        booked_count = booked_count + $2,
        updated_at = NOW()
      WHERE id = $1
        AND booked_count + $2 >= 0
        AND booked_count + $2 <= capacity
      RETURNING id, hospital_vaccine_id, slot_date, start_time, end_time, capacity, booked_count, created_at, updated_at
    `,
    [slotId, delta]
  );

  return result.rows[0] || null;
}

export async function insertBooking(payload, db = pool) {
  const result = await runQuery(
    db,
    `
      INSERT INTO bookings (user_id, hospital_vaccine_id, time_slot_id, status, locked_price_inr, confirmation_code)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, user_id, hospital_vaccine_id, time_slot_id, status, locked_price_inr, confirmation_code, created_at, updated_at
    `,
    [
      payload.userId,
      payload.hospitalVaccineId,
      payload.timeSlotId,
      payload.status,
      payload.lockedPriceInr,
      payload.confirmationCode,
    ]
  );

  return result.rows[0];
}

export async function updateBooking(bookingId, payload, db = pool) {
  const result = await runQuery(
    db,
    `
      UPDATE bookings
      SET
        hospital_vaccine_id = $2,
        time_slot_id = $3,
        locked_price_inr = $4,
        updated_at = NOW()
      WHERE id = $1
      RETURNING id, user_id, hospital_vaccine_id, time_slot_id, status, locked_price_inr, confirmation_code, created_at, updated_at
    `,
    [bookingId, payload.hospitalVaccineId, payload.timeSlotId, payload.lockedPriceInr]
  );

  return result.rows[0] || null;
}

export async function updateBookingStatus(bookingId, status, db = pool) {
  const result = await runQuery(
    db,
    `
      UPDATE bookings
      SET
        status = $2,
        updated_at = NOW()
      WHERE id = $1
      RETURNING id, user_id, hospital_vaccine_id, time_slot_id, status, locked_price_inr, confirmation_code, created_at, updated_at
    `,
    [bookingId, status]
  );

  return result.rows[0] || null;
}

export async function findDuplicateActiveBooking(
  userId,
  hospitalVaccineId,
  slotDate,
  db = pool,
  excludeBookingId = null
) {
  const result = await runQuery(
    db,
    `
      SELECT b.id
      FROM bookings b
      INNER JOIN time_slots ts ON ts.id = b.time_slot_id
      WHERE b.user_id = $1
        AND b.hospital_vaccine_id = $2
        AND b.status = 'booked'
        AND ts.slot_date = $3
        AND ($4::uuid IS NULL OR b.id <> $4::uuid)
      LIMIT 1
    `,
    [userId, hospitalVaccineId, slotDate, excludeBookingId]
  );

  return result.rows[0] || null;
}

export async function findBookingById(bookingId, db = pool, { forUpdate = false } = {}) {
  const result = await runQuery(
    db,
    `
      SELECT
        b.id,
        b.user_id,
        b.hospital_vaccine_id,
        b.time_slot_id,
        b.status,
        b.locked_price_inr,
        b.confirmation_code,
        b.created_at,
        b.updated_at,
        u.full_name,
        u.email,
        ts.slot_date,
        ts.start_time,
        ts.end_time,
        ts.capacity,
        ts.booked_count,
        h.id AS hospital_id,
        h.name AS hospital_name,
        h.city,
        h.pincode,
        h.address,
        v.id AS vaccine_id,
        v.name AS vaccine_name,
        v.description AS vaccine_description,
        v.doses_required
      FROM bookings b
      INNER JOIN users u ON u.id = b.user_id
      INNER JOIN time_slots ts ON ts.id = b.time_slot_id
      INNER JOIN hospital_vaccines hv ON hv.id = b.hospital_vaccine_id
      INNER JOIN hospitals h ON h.id = hv.hospital_id
      INNER JOIN vaccines v ON v.id = hv.vaccine_id
      WHERE b.id = $1
      LIMIT 1
      ${forUpdate ? "FOR UPDATE OF b" : ""}
    `,
    [bookingId]
  );

  return result.rows[0] || null;
}

export async function listMyBookings(userId, db = pool) {
  const result = await runQuery(
    db,
    `
      SELECT
        b.id,
        b.user_id,
        b.hospital_vaccine_id,
        b.time_slot_id,
        b.status,
        b.locked_price_inr,
        b.confirmation_code,
        b.created_at,
        b.updated_at,
        ts.slot_date,
        ts.start_time,
        ts.end_time,
        ts.capacity,
        ts.booked_count,
        h.id AS hospital_id,
        h.name AS hospital_name,
        h.city,
        h.pincode,
        h.address,
        v.id AS vaccine_id,
        v.name AS vaccine_name,
        v.description AS vaccine_description,
        v.doses_required,
        CASE 
          WHEN ts.slot_date < CURRENT_DATE THEN 'past'
          WHEN ts.slot_date = CURRENT_DATE THEN 'today'
          ELSE 'upcoming'
        END AS booking_period
      FROM bookings b
      INNER JOIN time_slots ts ON ts.id = b.time_slot_id
      INNER JOIN hospital_vaccines hv ON hv.id = b.hospital_vaccine_id
      INNER JOIN hospitals h ON h.id = hv.hospital_id
      INNER JOIN vaccines v ON v.id = hv.vaccine_id
      WHERE b.user_id = $1
      ORDER BY
        CASE WHEN b.status = 'booked' THEN 0 ELSE 1 END,
        ts.slot_date DESC,
        ts.start_time DESC
    `,
    [userId]
  );

  return result.rows;
}

export async function listAdminBookings(filters, db = pool) {
  const params = [];
  const conditions = ["1 = 1"];

  if (filters.date) {
    params.push(filters.date);
    conditions.push(`ts.slot_date = $${params.length}`);
  }

  if (filters.hospitalId) {
    params.push(filters.hospitalId);
    conditions.push(`h.id = $${params.length}`);
  }

  if (filters.vaccineId) {
    params.push(filters.vaccineId);
    conditions.push(`v.id = $${params.length}`);
  }

  const result = await runQuery(
    db,
    `
      SELECT
        b.id,
        b.user_id,
        b.hospital_vaccine_id,
        b.time_slot_id,
        b.status,
        b.locked_price_inr,
        b.confirmation_code,
        b.created_at,
        b.updated_at,
        u.full_name,
        u.email,
        ts.slot_date,
        ts.start_time,
        ts.end_time,
        ts.capacity,
        ts.booked_count,
        h.id AS hospital_id,
        h.name AS hospital_name,
        h.city,
        h.pincode,
        v.id AS vaccine_id,
        v.name AS vaccine_name
      FROM bookings b
      INNER JOIN users u ON u.id = b.user_id
      INNER JOIN time_slots ts ON ts.id = b.time_slot_id
      INNER JOIN hospital_vaccines hv ON hv.id = b.hospital_vaccine_id
      INNER JOIN hospitals h ON h.id = hv.hospital_id
      INNER JOIN vaccines v ON v.id = hv.vaccine_id
      WHERE ${conditions.join(" AND ")}
      ORDER BY ts.slot_date ASC, ts.start_time ASC, h.name ASC
    `,
    params
  );

  return result.rows;
}
