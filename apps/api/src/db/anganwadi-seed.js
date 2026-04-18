import pool from "./pool.js";

function getDateOffset(offset) {
  const date = new Date();
  date.setDate(date.getDate() + offset);
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(date);
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(date);
}

const demoAnganwadis = [
  {
    name: "Anganwadi Center Jayanagar",
    city: "Bengaluru",
    pincode: "560041",
    address: "4th Block, Jayanagar, Bengaluru",
  },
  {
    name: "Anganwadi Center Koramangala",
    city: "Bengaluru",
    pincode: "560034",
    address: "5th Block, Koramangala, Bengaluru",
  },
  {
    name: "Anganwadi Center Whitefield",
    city: "Bengaluru",
    pincode: "560066",
    address: "EPIP Zone, Whitefield, Bengaluru",
  },
  {
    name: "Anganwadi Center Indiranagar",
    city: "Bengaluru",
    pincode: "560038",
    address: "100 Feet Road, Indiranagar, Bengaluru",
  },
];

export async function seedAnganwadisForDate(targetDate) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // Seed Anganwadis
    for (const anganwadi of demoAnganwadis) {
      await client.query(
        `
          INSERT INTO anganwadis (name, city, pincode, address)
          SELECT
            $1::varchar(160),
            $2::varchar(120),
            $3::varchar(10),
            $4::text
          WHERE NOT EXISTS (
            SELECT 1
            FROM anganwadis
            WHERE name = $1::varchar(160) AND pincode = $3::varchar(10)
          )
        `,
        [anganwadi.name, anganwadi.city, anganwadi.pincode, anganwadi.address]
      );
    }

    // Get Anganwadi IDs
    const anganwadisResult = await client.query(
      `
        SELECT id, name
        FROM anganwadis
        WHERE name = ANY($1::text[])
      `,
      [demoAnganwadis.map((a) => a.name)]
    );

    // Get Polio vaccine ID
    const polioResult = await client.query(
      `
        SELECT id, name
        FROM vaccines
        WHERE name = 'Polio'
        LIMIT 1
      `
    );

    if (polioResult.rows.length === 0) {
      throw new Error("Polio vaccine not found. Please run main seed first.");
    }

    const polioId = polioResult.rows[0].id;
    const anganwadiByName = new Map(anganwadisResult.rows.map((row) => [row.name, row.id]));

    // Create Anganwadi-Polio offerings (free)
    for (const anganwadi of demoAnganwadis) {
      const anganwadiId = anganwadiByName.get(anganwadi.name);

      if (!anganwadiId) {
        continue;
      }

      await client.query(
        `
          INSERT INTO anganwadi_vaccines (anganwadi_id, vaccine_id, is_active, price_inr)
          VALUES ($1, $2, TRUE, 0)
          ON CONFLICT (anganwadi_id, vaccine_id)
          DO UPDATE
          SET
            is_active = TRUE,
            price_inr = 0,
            updated_at = NOW()
        `,
        [anganwadiId, polioId]
      );
    }

    // Get all anganwadi-vaccine offerings
    const offeringsResult = await client.query(
      `
        SELECT
          av.id,
          a.name AS anganwadi_name
        FROM anganwadi_vaccines av
        INNER JOIN anganwadis a ON a.id = av.anganwadi_id
        INNER JOIN vaccines v ON v.id = av.vaccine_id
        WHERE v.name = 'Polio'
      `
    );

    const offeringByName = new Map(
      offeringsResult.rows.map((row) => [row.anganwadi_name, row.id])
    );

    // Time slots for Anganwadis (morning slots only)
    const slotTemplates = [
      { startTime: "09:00", endTime: "10:00", capacity: 20 },
      { startTime: "10:00", endTime: "11:00", capacity: 20 },
      { startTime: "11:00", endTime: "12:00", capacity: 15 },
    ];

    const formattedDate = formatDate(targetDate);

    // Delete all existing Anganwadi time slots before seeding new date
    await client.query(`DELETE FROM anganwadi_time_slots`);

    // Create time slots for the specified date
    for (const anganwadi of demoAnganwadis) {
      const offeringId = offeringByName.get(anganwadi.name);

      if (!offeringId) {
        continue;
      }

      for (const slot of slotTemplates) {
        await client.query(
          `
            INSERT INTO anganwadi_time_slots (anganwadi_vaccine_id, slot_date, start_time, end_time, capacity)
            VALUES ($1, $2, $3, $4, $5)
            ON CONFLICT (anganwadi_vaccine_id, slot_date, start_time, end_time)
            DO UPDATE
            SET
              capacity = GREATEST(EXCLUDED.capacity, anganwadi_time_slots.booked_count),
              updated_at = NOW()
          `,
          [offeringId, formattedDate, slot.startTime, slot.endTime, slot.capacity]
        );
      }
    }

    await client.query("COMMIT");

    return {
      success: true,
      message: `Anganwadi data seeded for date: ${formattedDate}`,
      anganwadiCount: demoAnganwadis.length,
      slotsCreated: demoAnganwadis.length * slotTemplates.length,
      date: formattedDate,
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

// If run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const targetDate = process.argv[2] || getDateOffset(0);

  seedAnganwadisForDate(targetDate)
    .then(async (result) => {
      console.log("Anganwadi seed completed:", result);
      await pool.end();
    })
    .catch(async (error) => {
      console.error("Anganwadi seed failed:", error);
      await pool.end();
      process.exit(1);
    });
}
