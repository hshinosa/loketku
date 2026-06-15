import { db } from './db';
import { events, transactions, tickets } from './schema';

const seedEvents = [
  {
    id: 'evt_123',
    title: 'Konser Indie Lokal 2024',
    description: 'Konser musik indie dari band-band kampus terbaik.',
    date: '2024-12-20T19:00:00Z',
    location: 'Lapang Basket Kampus',
    price: 50000,
    quota: 500,
    sold: 120,
    poster: 'https://placehold.co/600x400/1932B9/FFFFFF?text=Konser+Indie',
    organizer: 'BEM Fakultas Seni',
  },
  {
    id: 'evt_124',
    title: 'Seminar Nasional Teknologi AI',
    description: 'Seminar membahas tren AI 2024 bersama praktisi industri.',
    date: '2024-11-15T08:00:00Z',
    location: 'Auditorium Utama',
    price: 75000,
    quota: 300,
    sold: 210,
    poster: 'https://placehold.co/600x400/BF0000/FFFFFF?text=Seminar+AI',
    organizer: 'Himpunan Teknik Informatika',
  },
  {
    id: 'evt_125',
    title: 'Workshop UI/UX Design',
    description: 'Workshop intensif UI/UX untuk pemula.',
    date: '2024-10-28T13:00:00Z',
    location: 'Lab Komputer 1',
    price: 150000,
    quota: 50,
    sold: 45,
    poster: 'https://placehold.co/600x400/1932B9/FFFFFF?text=Workshop+UI/UX',
    organizer: 'UKM Design',
  },
  {
    id: 'evt_126',
    title: 'Festival Kuliner Mahasiswa',
    description: 'Festival kuliner dengan 50+ tenant mahasiswa.',
    date: '2024-12-01T10:00:00Z',
    location: 'Plaza Kampus',
    price: 20000,
    quota: 1000,
    sold: 540,
    poster: 'https://placehold.co/600x400/BF0000/FFFFFF?text=Festival+Kuliner',
    organizer: 'BEM Universitas',
  },
];

const seedTransactions = [
  {
    id: 'txn-001',
    eventId: 'evt_123',
    eventTitle: 'Konser Indie Lokal 2024',
    buyerName: 'Ahmad Rizki',
    buyerEmail: 'ahmad@example.com',
    buyerWhatsapp: '081234567890',
    ticketType: 'Regular',
    quantity: 1,
    total: 50000,
    status: 'paid',
    paymentMethod: 'QRIS',
    timestamp: '2025-06-01T10:30:00Z',
    ticketId: 'tkt-001',
  },
];

const seedTickets = [
  {
    id: 'tkt-001',
    transactionId: 'txn-001',
    eventId: 'evt_123',
    eventTitle: 'Konser Indie Lokal 2024',
    buyerName: 'Ahmad Rizki',
    ticketType: 'Regular',
    qrCode: 'LOKETKU-TKT-001',
    status: 'valid',
    date: '2024-12-20T19:00:00Z',
  },
];

export async function seed() {
  await db.delete(tickets);
  await db.delete(transactions);
  await db.delete(events);

  await db.insert(events).values(seedEvents);
  await db.insert(transactions).values(seedTransactions);
  await db.insert(tickets).values(seedTickets);

  console.log('Seed complete:', {
    events: seedEvents.length,
    transactions: seedTransactions.length,
    tickets: seedTickets.length,
  });
}
