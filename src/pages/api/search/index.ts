import type { APIRoute } from 'astro';
import { db, initDb } from '../../../lib/db';
import { events } from '../../../lib/schema';
import { like } from 'drizzle-orm';
import { or } from 'drizzle-orm';

export const GET: APIRoute = async ({ request }) => {
  try {
    await initDb();
    const url = new URL(request.url);
    const q = url.searchParams.get('q')?.trim() ?? '';

    if (!q || q.length < 2) {
      return new Response(JSON.stringify({ events: [] }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const pattern = `%${q}%`;
    const rows = await db
      .select({
        id: events.id,
        title: events.title,
        date: events.date,
        location: events.location,
        poster: events.poster,
        price: events.price,
      })
      .from(events)
      .where(or(like(events.title, pattern), like(events.location, pattern)))
      .limit(5);

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
