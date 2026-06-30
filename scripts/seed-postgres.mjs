import fs from 'node:fs';
import pg from 'pg';

const { Pool } = pg;
if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is required to seed the database.');
}
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

const files = [
  'db/migrations/001_init.sql',
  'db/seed_item_bank.sql',
  'db/seed_course_and_activity_library.sql',
  'db/seed_lessons_and_downloadables.sql'
];

const client = await pool.connect();
try {
  for (const file of files) {
    const sql = fs.readFileSync(file, 'utf8');
    console.log(`Running ${file}`);
    await client.query(sql);
  }
  console.log('Database seeded successfully.');
} finally {
  client.release();
  await pool.end();
}
