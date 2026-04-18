import bcrypt from "bcryptjs";
import pool from "./pool.js";
import { USER_ROLES } from "../config/constants.js";

const demoUsers = [
  {
    fullName: "Admin Demo",
    email: "admin@vaxbook.local",
    password: "Admin123!",
    role: USER_ROLES.ADMIN,
  },
  {
    fullName: "Patient Demo",
    email: "patient@vaxbook.local",
    password: "Patient123!",
    role: USER_ROLES.PATIENT,
  },
];

async function seedUsers() {
  for (const user of demoUsers) {
    const passwordHash = await bcrypt.hash(user.password, 10);

    await pool.query(
      `
        INSERT INTO users (full_name, email, password_hash, role)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (email) DO NOTHING
      `,
      [user.fullName, user.email, passwordHash, user.role]
    );
  }
}

seedUsers()
  .then(async () => {
    console.log("Seed data is ready.");
    await pool.end();
  })
  .catch(async (error) => {
    console.error("Seed failed.");
    console.error(error);
    await pool.end();
    process.exit(1);
  });
