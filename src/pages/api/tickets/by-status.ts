import type { APIRoute } from 'astro';
import { db, initDb } from '../../../lib/db';
import { tickets } from '../../../lib/schema';
import { eq } from 'drizzle-orm';

export const GET: APIRoute = async ({ request }) => {
  try {
    await initDb();
    const url = new URL(request.url);
    const status = url.searchParams.get('status') ?? 'valid';

    const rows = await db
      .select()
      .from(tickets)
      .where(eq(tickets.status, status))
      .limit(1);

    const ticket = rows[0] ?? null;

    return new Response(JSON.stringify({ ok: true, ticket }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ ok: false, ticket: null, error: String(err) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
