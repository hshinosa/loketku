import type { APIRoute } from 'astro';
import { db, initDb } from '../../lib/db';
import { events } from '../../lib/schema';

export const GET: APIRoute = async () => {
  try {
    await initDb();
    const rows = await db.select().from(events);
    return new Response(JSON.stringify({ events: rows }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ events: [], error: String(err) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

export const POST: APIRoute = async ({ request }) => {
  try {
    await initDb();
    const body = await request.json();
    const id = `evt_${Date.now().toString(36)}`;
    const firstCategory = Array.isArray(body.categories) && body.categories.length > 0 ? body.categories[0] : null;

    const row = {
      id,
      title: String(body.title ?? '').trim(),
      description: String(body.description ?? '').trim(),
      date: String(body.date ?? new Date().toISOString()),
      location: String(body.location ?? '').trim(),
      price: Number(firstCategory?.price ?? body.price ?? 0),
      quota: Number(firstCategory?.quota ?? body.quota ?? 0),
      sold: 0,
      poster: String(body.imageUrl ?? body.poster ?? 'https://placehold.co/600x400/1932B9/FFFFFF?text=Event').trim(),
      organizer: String(body.organizer ?? 'Loketku Organizer').trim(),
      createdAt: new Date().toISOString(),
    };

    if (!row.title || !row.location) {
      return new Response(JSON.stringify({ error: 'title dan location wajib diisi' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    await db.insert(events).values(row);

    return new Response(JSON.stringify({ ok: true, id }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
