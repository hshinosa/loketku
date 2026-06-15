import type { APIRoute } from 'astro';
import { db, initDb } from '../../../lib/db';
import { events, tickets, transactions } from '../../../lib/schema';
import { eq } from 'drizzle-orm';

export const DELETE: APIRoute = async ({ params }) => {
  try {
    await initDb();
    const id = params.id;
    if (!id) {
      return new Response(JSON.stringify({ error: 'ID event wajib diisi' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Delete related tickets and transactions first
    const tixRows = await db.select({ id: tickets.id }).from(tickets).where(eq(tickets.eventId, id));
    for (const t of tixRows) {
      await db.delete(transactions).where(eq(transactions.ticketId, t.id));
      await db.delete(tickets).where(eq(tickets.id, t.id));
    }
    await db.delete(events).where(eq(events.id, id));

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

export const PUT: APIRoute = async ({ request, params }) => {
  try {
    await initDb();
    const id = params.id;
    if (!id) {
      return new Response(JSON.stringify({ error: 'ID event wajib diisi' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const body = await request.json();
    const firstCategory = Array.isArray(body.categories) && body.categories.length > 0 ? body.categories[0] : null;

    const updateData: Record<string, unknown> = {};
    if (body.title) updateData.title = String(body.title).trim();
    if (body.description) updateData.description = String(body.description).trim();
    if (body.date) updateData.date = String(body.date);
    if (body.location) updateData.location = String(body.location).trim();
    if (firstCategory?.price != null) updateData.price = Number(firstCategory.price);
    if (firstCategory?.quota != null) updateData.quota = Number(firstCategory.quota);
    if (body.imageUrl || body.poster) updateData.poster = String(body.imageUrl ?? body.poster).trim();
    if (body.organizer) updateData.organizer = String(body.organizer).trim();

    if (Object.keys(updateData).length === 0) {
      return new Response(JSON.stringify({ error: 'Tidak ada data untuk diupdate' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    await db.update(events).set(updateData).where(eq(events.id, id));

    const updated = await db.select().from(events).where(eq(events.id, id));
    return new Response(JSON.stringify({ ok: true, event: updated[0] }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
