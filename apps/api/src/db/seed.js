import bcrypt from "bcryptjs";
import pool from "./pool.js";
import { USER_ROLES } from "../config/constants.js";

const demoUsers = [
  {
    fullName: "Admin Demo",
    email: "admin@DevNexus.local",
    password: "Admin123!",
    role: USER_ROLES.ADMIN,
  },
  {
    fullName: "Patient Demo",
    email: "patient@DevNexus.local",
    password: "Patient123!",
    role: USER_ROLES.PATIENT,
  },
];

const demoVaccines = [
  {
    name: "Covaxin",
    description: "Inactivated virus vaccine commonly used for primary doses.",
    dosesRequired: 2,
  },
  {
    name: "Covishield",
    description: "Viral vector vaccine used for primary and booster coverage.",
    dosesRequired: 2,
  },
];

const demoHospitals = [
  {
    name: "City Care Hospital",
    city: "Bengaluru",
    pincode: "560001",
    address: "MG Road, Bengaluru",
  },
  {
    name: "Green Valley Medical Center",
    city: "Bengaluru",
    pincode: "560078",
    address: "JP Nagar, Bengaluru",
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

async function seedVaccines() {
  for (const vaccine of demoVaccines) {
    await pool.query(
      `
        INSERT INTO vaccines (name, description, doses_required)
        VALUES ($1, $2, $3)
        ON CONFLICT (name) DO NOTHING
      `,
      [vaccine.name, vaccine.description, vaccine.dosesRequired]
    );
  }
}

async function seedHospitals() {
  for (const hospital of demoHospitals) {
    await pool.query(
      `
        INSERT INTO hospitals (name, city, pincode, address)
        SELECT
          $1::varchar(160),
          $2::varchar(120),
          $3::varchar(10),
          $4::text
        WHERE NOT EXISTS (
          SELECT 1
          FROM hospitals
          WHERE name = $1::varchar(160) AND pincode = $3::varchar(10)
        )
      `,
      [hospital.name, hospital.city, hospital.pincode, hospital.address]
    );
  }
}

async function seedOfferings() {
  const hospitalsResult = await pool.query(
    `
      SELECT id, name
      FROM hospitals
      WHERE name = ANY($1::text[])
    `,
    [demoHospitals.map((hospital) => hospital.name)]
  );

  const vaccinesResult = await pool.query(
    `
      SELECT id, name
      FROM vaccines
      WHERE name = ANY($1::text[])
    `,
    [demoVaccines.map((vaccine) => vaccine.name)]
  );

  const hospitalByName = new Map(hospitalsResult.rows.map((row) => [row.name, row.id]));
  const vaccineByName = new Map(vaccinesResult.rows.map((row) => [row.name, row.id]));

  const offerings = [
    {
      hospitalName: "City Care Hospital",
      vaccineName: "Covaxin",
    },
    {
      hospitalName: "City Care Hospital",
      vaccineName: "Covishield",
    },
    {
      hospitalName: "Green Valley Medical Center",
      vaccineName: "Covishield",
    },
  ];

  for (const offering of offerings) {
    const hospitalId = hospitalByName.get(offering.hospitalName);
    const vaccineId = vaccineByName.get(offering.vaccineName);

    if (!hospitalId || !vaccineId) {
      continue;
    }

    await pool.query(
      `
        INSERT INTO hospital_vaccines (hospital_id, vaccine_id, is_active)
        VALUES ($1, $2, TRUE)
        ON CONFLICT (hospital_id, vaccine_id)
        DO UPDATE
        SET
          is_active = TRUE,
          updated_at = NOW()
      `,
      [hospitalId, vaccineId]
    );
  }
}

Promise.resolve()
  .then(seedUsers)
  .then(seedVaccines)
  .then(seedHospitals)
  .then(seedOfferings)
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
