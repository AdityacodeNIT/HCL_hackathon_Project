import fs from "node:fs/promises";
import path from "node:path";
import pool from "./pool.js";

async function runMigrations() {
  const migrationsDir = path.join(process.cwd(), "src", "db", "migrations");
  const files = (await fs.readdir(migrationsDir))
    .filter((file) => file.endsWith(".sql"))
    .sort();

  for (const file of files) {
    const fullPath = path.join(migrationsDir, file);
    const sql = await fs.readFile(fullPath, "utf8");
    await pool.query(sql);
    console.log(`Applied migration: ${file}`);
  }
}

runMigrations()
  .then(async () => {
    console.log("Database migrations completed.");
    await pool.end();
  })
  .catch(async (error) => {
    console.error("Migration failed.");
    console.error(error);
    await pool.end();
    process.exit(1);
  });
