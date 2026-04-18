import pool from "../../db/pool.js";

export async function listHospitals() {
  const result = await pool.query(
    `
      SELECT id, name, city, pincode, address, created_at, updated_at
      FROM hospitals
      ORDER BY name ASC
    `
  );

  return result.rows;
}

export async function findHospitalById(id) {
  const result = await pool.query(
    `
      SELECT id, name, city, pincode, address, created_at, updated_at
      FROM hospitals
      WHERE id = $1
      LIMIT 1
    `,
    [id]
  );

  return result.rows[0] || null;
}

export async function createHospital({ name, city, pincode, address }) {
  const result = await pool.query(
    `
      INSERT INTO hospitals (name, city, pincode, address)
      VALUES ($1, $2, $3, $4)
      RETURNING id, name, city, pincode, address, created_at, updated_at
    `,
    [name, city, pincode, address]
  );

  return result.rows[0];
}

export async function updateHospital(id, { name, city, pincode, address }) {
  const result = await pool.query(
    `
      UPDATE hospitals
      SET
        name = $2,
        city = $3,
        pincode = $4,
        address = $5,
        updated_at = NOW()
      WHERE id = $1
      RETURNING id, name, city, pincode, address, created_at, updated_at
    `,
    [id, name, city, pincode, address]
  );

  return result.rows[0] || null;
}

export async function listVaccines() {
  const result = await pool.query(
    `
      SELECT id, name, description, doses_required, created_at, updated_at
      FROM vaccines
      ORDER BY name ASC
    `
  );

  return result.rows;
}

export async function findVaccineById(id) {
  const result = await pool.query(
    `
      SELECT id, name, description, doses_required, created_at, updated_at
      FROM vaccines
      WHERE id = $1
      LIMIT 1
    `,
    [id]
  );

  return result.rows[0] || null;
}

export async function findVaccineByName(name) {
  const result = await pool.query(
    `
      SELECT id, name, description, doses_required, created_at, updated_at
      FROM vaccines
      WHERE name = $1
      LIMIT 1
    `,
    [name]
  );

  return result.rows[0] || null;
}

export async function createVaccine({ name, description, dosesRequired }) {
  const result = await pool.query(
    `
      INSERT INTO vaccines (name, description, doses_required)
      VALUES ($1, $2, $3)
      RETURNING id, name, description, doses_required, created_at, updated_at
    `,
    [name, description, dosesRequired]
  );

  return result.rows[0];
}

export async function listOfferings() {
  const result = await pool.query(
    `
      SELECT
        hv.id,
        hv.hospital_id,
        hv.vaccine_id,
        hv.is_active,
        hv.price_inr,
        hv.created_at,
        hv.updated_at,
        v.name AS vaccine_name,
        v.description AS vaccine_description,
        v.doses_required
      FROM hospital_vaccines hv
      INNER JOIN vaccines v ON v.id = hv.vaccine_id
      ORDER BY v.name ASC
    `
  );

  return result.rows;
}

export async function searchPublicHospitalOfferings(filters = {}) {
  const conditions = ["hv.is_active = TRUE"];
  const params = [];

  if (filters.name) {
    params.push(`%${filters.name}%`);
    conditions.push(`(h.name ILIKE $${params.length} OR h.address ILIKE $${params.length})`);
  }

  if (filters.city) {
    params.push(`%${filters.city}%`);
    conditions.push(`h.city ILIKE $${params.length}`);
  }

  if (filters.pincode) {
    params.push(filters.pincode);
    conditions.push(`h.pincode = $${params.length}`);
  }

  if (filters.vaccineId) {
    params.push(filters.vaccineId);
    conditions.push(`v.id = $${params.length}`);
  }

  if (Number.isFinite(filters.minPrice)) {
    params.push(filters.minPrice);
    conditions.push(`hv.price_inr >= $${params.length}`);
  }

  if (Number.isFinite(filters.maxPrice)) {
    params.push(filters.maxPrice);
    conditions.push(`hv.price_inr <= $${params.length}`);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  const result = await pool.query(
    `
      SELECT
        h.id,
        h.name,
        h.city,
        h.pincode,
        h.address,
        h.created_at,
        h.updated_at,
        hv.id AS offering_id,
        hv.is_active,
        hv.price_inr,
        hv.created_at AS offering_created_at,
        hv.updated_at AS offering_updated_at,
        v.id AS vaccine_id,
        v.name AS vaccine_name,
        v.description AS vaccine_description,
        v.doses_required
      FROM hospitals h
      INNER JOIN hospital_vaccines hv ON hv.hospital_id = h.id
      INNER JOIN vaccines v ON v.id = hv.vaccine_id
      ${whereClause}
      ORDER BY h.name ASC, v.name ASC
    `,
    params
  );

  return result.rows;
}

export async function upsertOffering({ hospitalId, vaccineId, isActive }) {
  const result = await pool.query(
    `
      INSERT INTO hospital_vaccines (hospital_id, vaccine_id, is_active)
      VALUES ($1, $2, $3)
      ON CONFLICT (hospital_id, vaccine_id)
      DO UPDATE
      SET
        is_active = EXCLUDED.is_active,
        updated_at = NOW()
      RETURNING id, hospital_id, vaccine_id, is_active, price_inr, created_at, updated_at
    `,
    [hospitalId, vaccineId, isActive]
  );

  return result.rows[0];
}

export async function updateOfferingPrice(id, priceInr) {
  const result = await pool.query(
    `
      UPDATE hospital_vaccines
      SET
        price_inr = $2,
        updated_at = NOW()
      WHERE id = $1
      RETURNING id, hospital_id, vaccine_id, is_active, price_inr, created_at, updated_at
    `,
    [id, priceInr]
  );

  return result.rows[0] || null;
}

export async function findOfferingById(id) {
  const result = await pool.query(
    `
      SELECT id, hospital_id, vaccine_id, is_active, price_inr, created_at, updated_at
      FROM hospital_vaccines
      WHERE id = $1
      LIMIT 1
    `,
    [id]
  );

  return result.rows[0] || null;
}

export async function updateOfferingStatus(id, isActive) {
  const result = await pool.query(
    `
      UPDATE hospital_vaccines
      SET
        is_active = $2,
        updated_at = NOW()
      WHERE id = $1
      RETURNING id, hospital_id, vaccine_id, is_active, price_inr, created_at, updated_at
    `,
    [id, isActive]
  );

  return result.rows[0] || null;
}


export async function searchPublicAnganwadiOfferings(filters = {}) {
  const conditions = ["av.is_active = TRUE"];
  const params = [];

  // IMPORTANT: For Anganwadis, slot_date is REQUIRED
  // If no date is provided, return empty results
  if (!filters.slotDate) {
    return [];
  }

  params.push(filters.slotDate);
  conditions.push(`ats.slot_date = $${params.length}`);

  if (filters.city) {
    params.push(`%${filters.city}%`);
    conditions.push(`a.city ILIKE $${params.length}`);
  }

  if (filters.pincode) {
    params.push(filters.pincode);
    conditions.push(`a.pincode = $${params.length}`);
  }

  if (filters.vaccineId) {
    params.push(filters.vaccineId);
    conditions.push(`v.id = $${params.length}`);
  }

  if (filters.slotDate) {
    params.push(filters.slotDate);
    conditions.push(`ats.slot_date = $${params.length}`);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  const result = await pool.query(
    `
      SELECT DISTINCT
        a.id,
        a.name,
        a.city,
        a.pincode,
        a.address,
        a.created_at,
        a.updated_at,
        av.id AS offering_id,
        av.is_active,
        av.price_inr,
        av.created_at AS offering_created_at,
        av.updated_at AS offering_updated_at,
        v.id AS vaccine_id,
        v.name AS vaccine_name,
        v.description AS vaccine_description,
        v.doses_required
      FROM anganwadis a
      INNER JOIN anganwadi_vaccines av ON av.anganwadi_id = a.id
      INNER JOIN vaccines v ON v.id = av.vaccine_id
      INNER JOIN anganwadi_time_slots ats ON ats.anganwadi_vaccine_id = av.id
      ${whereClause}
      ORDER BY a.name ASC, v.name ASC
    `,
    params
  );

  return result.rows;
}
