import type { APIRoute } from 'astro';
import { db } from '../../../lib/db';
import { transactions, tickets, events } from '../../../lib/schema';
import { eq } from 'drizzle-orm';

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const transactionId = String(body.transactionId ?? '');

    if (!transactionId) {
      return new Response(JSON.stringify({ error: 'transactionId wajib diisi' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const rows = await db.select().from(transactions).where(eq(transactions.id, transactionId));
    const trx = rows[0];
    if (!trx) {
      return new Response(JSON.stringify({ error: 'Transaksi tidak ditemukan' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (trx.status === 'paid') {
      return new Response(JSON.stringify({ ok: true, transaction: trx, alreadyPaid: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    await db
      .update(transactions)
      .set({ status: 'paid' })
      .where(eq(transactions.id, transactionId));

    if (trx.ticketId) {
      await db
        .update(tickets)
        .set({ status: 'valid' })
        .where(eq(tickets.id, trx.ticketId));
    }

    if (trx.eventId) {
      const evRows = await db.select().from(events).where(eq(events.id, trx.eventId));
      const ev = evRows[0];
      if (ev) {
        await db
          .update(events)
          .set({ sold: ev.sold + trx.quantity })
          .where(eq(events.id, trx.eventId));
      }
    }

    const updated = await db.select().from(transactions).where(eq(transactions.id, transactionId));

    return new Response(JSON.stringify({ ok: true, transaction: updated[0] }), {
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
