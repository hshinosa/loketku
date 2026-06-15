import type { APIRoute } from 'astro';
import { db, initDb } from '../../../lib/db';
import { tickets } from '../../../lib/schema';
import { eq } from 'drizzle-orm';

export const POST: APIRoute = async ({ request }) => {
  try {
    await initDb();
    const { ticketId } = await request.json();

    if (!ticketId) {
      return new Response(JSON.stringify({ ok: false, message: 'ID tiket wajib diisi' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const rows = await db.select().from(tickets).where(eq(tickets.id, ticketId));
    const ticket = rows[0];

    if (!ticket) {
      return new Response(JSON.stringify({ ok: false, message: 'Tiket tidak ditemukan' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ ok: true, ticket }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ ok: false, message: String(err) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
