import type { APIRoute } from 'astro';
import { db, initDb } from '../../../lib/db';
import { transactions } from '../../../lib/schema';

export const GET: APIRoute = async () => {
  try {
    await initDb();
    const trxRows = await db.select().from(transactions);
    const totalRevenue = trxRows
      .filter((t) => t.status === 'paid')
      .reduce((sum, t) => sum + t.total, 0);

    return new Response(JSON.stringify({ totalRevenue }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e) {
    return new Response(JSON.stringify({ totalRevenue: 0 }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
