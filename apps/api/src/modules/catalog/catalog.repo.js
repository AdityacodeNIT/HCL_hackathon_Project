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
      RETURNING id, hospital_id, vaccine_id, is_active, created_at, updated_at
    `,
    [hospitalId, vaccineId, isActive]
  );

  return result.rows[0];
}

export async function findOfferingById(id) {
  const result = await pool.query(
    `
      SELECT id, hospital_id, vaccine_id, is_active, created_at, updated_at
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
      RETURNING id, hospital_id, vaccine_id, is_active, created_at, updated_at
    `,
    [id, isActive]
  );

  return result.rows[0] || null;
}
