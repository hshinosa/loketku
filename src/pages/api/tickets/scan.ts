import type { APIRoute } from 'astro';
import { db } from '../../../lib/db';
import { tickets, transactions } from '../../../lib/schema';
import { eq } from 'drizzle-orm';

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const ticketId = String(body.ticketId ?? '').trim();

    if (!ticketId) {
      return new Response(JSON.stringify({ error: 'ticketId wajib diisi' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const rows = await db.select().from(tickets).where(eq(tickets.id, ticketId));
    const ticket = rows[0];

    if (!ticket) {
      return new Response(
        JSON.stringify({ ok: false, status: 'invalid', message: 'Tiket tidak ditemukan' }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (ticket.status === 'used') {
      return new Response(
        JSON.stringify({
          ok: false,
          status: 'used',
          message: 'Tiket sudah digunakan',
          ticket,
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (ticket.status === 'invalid') {
      return new Response(
        JSON.stringify({ ok: false, status: 'invalid', message: 'Tiket tidak valid', ticket }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    await db.update(tickets).set({ status: 'used' }).where(eq(tickets.id, ticketId));
    await db
      .update(transactions)
      .set({ status: 'used' })
      .where(eq(transactions.id, ticket.transactionId));

    return new Response(
      JSON.stringify({
        ok: true,
        status: 'valid',
        message: 'Check-in berhasil',
        ticket: { ...ticket, status: 'used' },
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
