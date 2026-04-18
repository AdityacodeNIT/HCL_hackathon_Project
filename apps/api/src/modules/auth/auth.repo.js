import pool from "../../db/pool.js";

export async function findUserByEmail(email) {
  const result = await pool.query(
    `
      SELECT id, full_name, email, password_hash, role, created_at, updated_at
      FROM users
      WHERE email = $1
      LIMIT 1
    `,
    [email]
  );

  return result.rows[0] || null;
}

export async function findUserById(id) {
  const result = await pool.query(
    `
      SELECT id, full_name, email, password_hash, role, created_at, updated_at
      FROM users
      WHERE id = $1
      LIMIT 1
    `,
    [id]
  );

  return result.rows[0] || null;
}

export async function createUser({ fullName, email, passwordHash, role }) {
  const result = await pool.query(
    `
      INSERT INTO users (full_name, email, password_hash, role)
      VALUES ($1, $2, $3, $4)
      RETURNING id, full_name, email, password_hash, role, created_at, updated_at
    `,
    [fullName, email, passwordHash, role]
  );

  return result.rows[0];
}

export function sanitizeUser(user) {
  return {
    id: user.id,
    fullName: user.full_name,
    email: user.email,
    role: user.role,
    createdAt: user.created_at,
    updatedAt: user.updated_at,
  };
}
