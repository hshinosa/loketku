import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const events = sqliteTable('events', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  date: text('date').notNull(),
  location: text('location').notNull(),
  price: integer('price').notNull(),
  quota: integer('quota').notNull(),
  sold: integer('sold').notNull().default(0),
  poster: text('poster').notNull(),
  organizer: text('organizer').notNull(),
  createdAt: text('created_at').notNull().default(new Date().toISOString()),
});

export const transactions = sqliteTable('transactions', {
  id: text('id').primaryKey(),
  eventId: text('event_id').notNull().references(() => events.id),
  eventTitle: text('event_title').notNull(),
  buyerName: text('buyer_name').notNull(),
  buyerEmail: text('buyer_email').notNull(),
  buyerWhatsapp: text('buyer_whatsapp').notNull(),
  ticketType: text('ticket_type').notNull(),
  quantity: integer('quantity').notNull(),
  total: integer('total').notNull(),
  status: text('status').notNull(),
  paymentMethod: text('payment_method').notNull(),
  timestamp: text('timestamp').notNull().default(new Date().toISOString()),
  ticketId: text('ticket_id'),
});

export const tickets = sqliteTable('tickets', {
  id: text('id').primaryKey(),
  transactionId: text('transaction_id').notNull().references(() => transactions.id),
  eventId: text('event_id').notNull().references(() => events.id),
  eventTitle: text('event_title').notNull(),
  buyerName: text('buyer_name').notNull(),
  ticketType: text('ticket_type').notNull(),
  qrCode: text('qr_code').notNull(),
  status: text('status').notNull().default('valid'),
  date: text('date').notNull(),
});

export type Event = typeof events.$inferSelect;
export type Transaction = typeof transactions.$inferSelect;
export type Ticket = typeof tickets.$inferSelect;
