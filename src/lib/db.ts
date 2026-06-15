import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import * as schema from './schema';

const url = process.env.DATABASE_URL ?? 'file:./data.db';

const client = createClient({ url });

export const db = drizzle(client, { schema });
export { schema };

export async function initDb() {
  await client.execute(`
    CREATE TABLE IF NOT EXISTS events (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      date TEXT NOT NULL,
      location TEXT NOT NULL,
      price INTEGER NOT NULL,
      quota INTEGER NOT NULL,
      sold INTEGER NOT NULL DEFAULT 0,
      poster TEXT NOT NULL,
      organizer TEXT NOT NULL,
      scanner_token TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);
  await client.execute(`ALTER TABLE events ADD COLUMN scanner_token TEXT`).catch(() => {});
  await client.execute(`
    CREATE TABLE IF NOT EXISTS transactions (
      id TEXT PRIMARY KEY,
      event_id TEXT NOT NULL REFERENCES events(id),
      event_title TEXT NOT NULL,
      buyer_name TEXT NOT NULL,
      buyer_email TEXT NOT NULL,
      buyer_whatsapp TEXT NOT NULL,
      ticket_type TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      total INTEGER NOT NULL,
      status TEXT NOT NULL,
      payment_method TEXT NOT NULL,
      timestamp TEXT NOT NULL DEFAULT (datetime('now')),
      ticket_id TEXT
    )
  `);
  await client.execute(`
    CREATE TABLE IF NOT EXISTS tickets (
      id TEXT PRIMARY KEY,
      transaction_id TEXT NOT NULL REFERENCES transactions(id),
      event_id TEXT NOT NULL REFERENCES events(id),
      event_title TEXT NOT NULL,
      buyer_name TEXT NOT NULL,
      ticket_type TEXT NOT NULL,
      qr_code TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'valid',
      date TEXT NOT NULL
    )
  `);
}
