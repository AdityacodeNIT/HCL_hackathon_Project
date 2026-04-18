import bcrypt from "bcryptjs";
import pool from "./pool.js";
import { USER_ROLES } from "../config/constants.js";

function getDateOffset(offset) {
  const date = new Date();
  date.setDate(date.getDate() + offset);
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(date);
}

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
  {
    name: "Polio",
    description: "Oral polio vaccine administered at Anganwadis for children.",
    dosesRequired: 4,
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
      priceInr: 850,
    },
    {
      hospitalName: "City Care Hospital",
      vaccineName: "Covishield",
      priceInr: 720,
    },
    {
      hospitalName: "Green Valley Medical Center",
      vaccineName: "Covishield",
      priceInr: 690,
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
        INSERT INTO hospital_vaccines (hospital_id, vaccine_id, is_active, price_inr)
        VALUES ($1, $2, TRUE, $3)
        ON CONFLICT (hospital_id, vaccine_id)
        DO UPDATE
        SET
          is_active = TRUE,
          price_inr = EXCLUDED.price_inr,
          updated_at = NOW()
      `,
      [hospitalId, vaccineId, offering.priceInr]
    );
  }
}

async function seedTimeSlots() {
  const offeringsResult = await pool.query(
    `
      SELECT
        hv.id,
        h.name AS hospital_name,
        v.name AS vaccine_name
      FROM hospital_vaccines hv
      INNER JOIN hospitals h ON h.id = hv.hospital_id
      INNER JOIN vaccines v ON v.id = hv.vaccine_id
      WHERE (h.name, v.name) IN (
        ('City Care Hospital', 'Covaxin'),
        ('City Care Hospital', 'Covishield'),
        ('Green Valley Medical Center', 'Covishield')
      )
    `
  );

  const offeringByKey = new Map(
    offeringsResult.rows.map((row) => [`${row.hospital_name}::${row.vaccine_name}`, row.id])
  );

  const slotTemplates = [
    { startTime: "09:00", endTime: "09:30", capacity: 12 },
    { startTime: "10:00", endTime: "10:30", capacity: 12 },
    { startTime: "11:30", endTime: "12:00", capacity: 10 },
    { startTime: "15:00", endTime: "15:30", capacity: 8 },
  ];

  const offerings = [
    "City Care Hospital::Covaxin",
    "City Care Hospital::Covishield",
    "Green Valley Medical Center::Covishield",
  ];

  for (const offeringKey of offerings) {
    const offeringId = offeringByKey.get(offeringKey);

    if (!offeringId) {
      continue;
    }

    for (const dayOffset of [0, 1, 2, 3]) {
      const slotDate = getDateOffset(dayOffset);

      for (const slot of slotTemplates) {
        await pool.query(
          `
            INSERT INTO time_slots (hospital_vaccine_id, slot_date, start_time, end_time, capacity)
            VALUES ($1, $2, $3, $4, $5)
            ON CONFLICT (hospital_vaccine_id, slot_date, start_time, end_time)
            DO UPDATE
            SET
              capacity = GREATEST(EXCLUDED.capacity, time_slots.booked_count),
              updated_at = NOW()
          `,
          [offeringId, slotDate, slot.startTime, slot.endTime, slot.capacity]
        );
      }
    }
  }
}

Promise.resolve()
  .then(seedUsers)
  .then(seedVaccines)
  .then(seedHospitals)
  .then(seedOfferings)
  .then(seedTimeSlots)
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
