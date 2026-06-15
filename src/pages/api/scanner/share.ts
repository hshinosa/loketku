import type { APIRoute } from 'astro';
import { db, initDb } from '../../../lib/db';
import { events } from '../../../lib/schema';
import { eq } from 'drizzle-orm';
import crypto from 'crypto';

export const POST: APIRoute = async ({ request }) => {
  try {
    await initDb();
    const { eventId } = await request.json();

    if (!eventId) {
      return new Response(JSON.stringify({ error: 'eventId wajib diisi' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const token = crypto.randomBytes(16).toString('hex');

    await db.update(events).set({ scannerToken: token }).where(eq(events.id, eventId));

    const updated = await db.select().from(events).where(eq(events.id, eventId));
    const event = updated[0];

    if (!event) {
      return new Response(JSON.stringify({ error: 'Event tidak ditemukan' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const origin = new URL(request.url).origin;
    const shareUrl = `${origin}/scan/${token}`;

    return new Response(JSON.stringify({ ok: true, token, shareUrl, eventTitle: event.title }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
