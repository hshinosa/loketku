import type { APIRoute } from 'astro';
import { db } from '../../lib/db';
import { events, transactions, tickets } from '../../lib/schema';
import { eq } from 'drizzle-orm';

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const eventId = String(body.eventId ?? '');
    const buyerName = String(body.name ?? '').trim();
    const buyerEmail = String(body.email ?? '').trim();
    const buyerWhatsapp = String(body.whatsapp ?? '').trim();
    const ticketType = String(body.ticketType ?? 'Regular');
    const quantity = Number(body.quantity ?? 1);
    const paymentMethod = String(body.paymentMethod ?? 'QRIS');

    if (!eventId || !buyerName || !buyerEmail || !buyerWhatsapp) {
      return new Response(JSON.stringify({ error: 'Data pembeli tidak lengkap' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const eventRows = await db.select().from(events).where(eq(events.id, eventId));
    const event = eventRows[0];
    if (!event) {
      return new Response(JSON.stringify({ error: 'Event tidak ditemukan' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const remaining = event.quota - event.sold;
    if (quantity > remaining) {
      return new Response(JSON.stringify({ error: `Sisa kuota hanya ${remaining}` }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const total = event.price * quantity;
    const txnId = `txn-${Date.now().toString(36)}`;
    const ticketId = `tkt-${Date.now().toString(36)}`;

    await db.insert(transactions).values({
      id: txnId,
      eventId,
      eventTitle: event.title,
      buyerName,
      buyerEmail,
      buyerWhatsapp,
      ticketType,
      quantity,
      total,
      status: 'pending',
      paymentMethod,
      timestamp: new Date().toISOString(),
      ticketId,
    });

    await db.insert(tickets).values({
      id: ticketId,
      transactionId: txnId,
      eventId,
      eventTitle: event.title,
      buyerName,
      ticketType,
      qrCode: `LOKETKU-${ticketId.toUpperCase()}`,
      status: 'valid',
      date: event.date,
    });

    return new Response(JSON.stringify({ ok: true, transactionId: txnId, ticketId, total }), {
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
