import React, { useState, useEffect } from 'react';

interface EventOption {
  id: string;
  title: string;
  date: string;
  location: string;
  poster: string;
  totalTickets: number;
  scannedTickets: number;
}

interface Props {
  initialEventId?: string;
}

export default function ScannerApp({ initialEventId }: Props) {
  const [events, setEvents] = useState<EventOption[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<EventOption | null>(null);
  const [loading, setLoading] = useState(true);

  const [ticketId, setTicketId] = useState('');
  const [ticketInfo, setTicketInfo] = useState<{
    id: string;
    buyerName: string;
    ticketType: string;
    event: string;
    status: string;
  } | null>(null);
  const [lookupError, setLookupError] = useState<string | null>(null);
  const [actionResult, setActionResult] = useState<{
    status: 'success' | 'error';
    message: string;
  } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [scanHistory, setScanHistory] = useState<{ id: string; name: string; action: string; time: string }[]>([]);

  useEffect(() => {
    fetch('/api/events')
      .then(r => r.json())
      .then(data => {
        if (data.events) {
          const list: EventOption[] = data.events.map((e: any) => ({
            id: e.id,
            title: e.title,
            date: e.date,
            location: e.location,
            poster: e.poster,
            totalTickets: e.quota ?? 0,
            scannedTickets: e.sold ?? 0,
          }));
          setEvents(list);
          if (initialEventId) {
            const match = list.find(e => e.id === initialEventId);
            if (match) setSelectedEvent(match);
          }
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [initialEventId]);

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketId.trim()) return;

    setLookupError(null);
    setTicketInfo(null);
    setIsProcessing(true);

    try {
      const res = await fetch('/api/tickets/lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticketId: ticketId.trim() }),
      });
      const data = await res.json();

      if (data.ok && data.ticket) {
        setTicketInfo({
          id: data.ticket.id,
          buyerName: data.ticket.buyerName,
          ticketType: data.ticket.ticketType,
          event: data.ticket.eventTitle,
          status: data.ticket.status,
        });
      } else {
        setLookupError(data.message ?? 'Tiket tidak ditemukan');
      }
    } catch {
      setLookupError('Gagal terhubung ke server');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAction = async (action: 'valid' | 'invalid' | 'used') => {
    if (!ticketInfo) return;
    setIsProcessing(true);

    const labels = { valid: 'Tiket Valid', invalid: 'Tiket Tidak Valid', used: 'Sudah Digunakan' };
    const time = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

    try {
      const res = await fetch('/api/tickets/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticketId: ticketInfo.id, action }),
      });
      const data = await res.json();

      setActionResult({
        status: data.ok ? 'success' : 'error',
        message: data.ok ? `${labels[action]} — ${ticketInfo.buyerName}` : (data.message ?? 'Gagal memproses'),
      });

      if (data.ok) {
        setScanHistory(prev => [{
          id: ticketInfo.id,
          name: ticketInfo.buyerName,
          action: labels[action],
          time,
        }, ...prev].slice(0, 50));
      }
    } catch {
      setActionResult({ status: 'error', message: 'Gagal terhubung ke server' });
    }

    setTimeout(() => {
      setActionResult(null);
      setTicketInfo(null);
      setTicketId('');
      setIsProcessing(false);
    }, 3000);
  };

  const totalScans = scanHistory.length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  if (!selectedEvent) {
    return (
      <div className="max-w-2xl mx-auto">
        <h2 className="text-xl font-bold text-base-content mb-2">Pilih Event</h2>
        <p className="text-base-content/60 mb-6">Pilih event mana yang ingin di-scan tiketnya.</p>
        {events.length === 0 ? (
          <div className="text-center py-12"><p className="text-base-content/50">Belum ada event tersedia.</p></div>
        ) : (
          <div className="grid gap-3">
            {events.map(ev => (
              <button key={ev.id} onClick={() => setSelectedEvent(ev)}
                className="card card-side bg-base-100 shadow-sm border border-base-200 hover:border-primary hover:shadow-md transition-all text-left">
                <figure className="w-24 h-24 flex-shrink-0">
                  <img src={ev.poster} alt={ev.title} className="w-full h-full object-cover" />
                </figure>
                <div className="card-body p-4">
                  <h3 className="card-title text-sm font-bold text-base-content line-clamp-1">{ev.title}</h3>
                  <p className="text-xs text-base-content/60">{formatDate(ev.date)} — {ev.location}</p>
                  <div className="flex gap-4 mt-1">
                    <span className="text-xs text-base-content/50">Kuota: {ev.totalTickets}</span>
                    <span className="text-xs text-primary font-medium">Terjual: {ev.scannedTickets}</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto">
      {/* Event Header */}
      <div className="flex items-center gap-3 mb-6 bg-base-100 p-4 rounded-xl border border-base-200">
        <button onClick={() => { setSelectedEvent(null); setScanHistory([]); setTicketInfo(null); }} className="btn btn-ghost btn-sm btn-circle">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
        </button>
        <img src={selectedEvent.poster} alt="" className="w-12 h-12 rounded-lg object-cover" />
        <div className="min-w-0 flex-1">
          <p className="font-bold text-base-content truncate">{selectedEvent.title}</p>
          <p className="text-xs text-base-content/60">{formatDate(selectedEvent.date)} — {selectedEvent.location}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="stats stats-vertical sm:stats-horizontal shadow w-full mb-6 bg-base-100">
        <div className="stat py-3 px-4">
          <div className="stat-title text-xs">Session Scans</div>
          <div className="stat-value text-2xl text-primary">{totalScans}</div>
        </div>
        <div className="stat py-3 px-4">
          <div className="stat-title text-xs">Terjual</div>
          <div className="stat-value text-2xl">{selectedEvent.scannedTickets}</div>
        </div>
        <div className="stat py-3 px-4">
          <div className="stat-title text-xs">Kuota</div>
          <div className="stat-value text-2xl">{selectedEvent.totalTickets}</div>
        </div>
      </div>

      {/* Action Result Overlay */}
      {actionResult && (
        <div className={`alert mb-4 ${actionResult.status === 'success' ? 'alert-success' : 'alert-error'}`}>
          <span className="font-semibold">{actionResult.message}</span>
        </div>
      )}

      {/* Lookup Form */}
      {!ticketInfo && !actionResult && (
        <div className="bg-base-100 p-6 rounded-xl shadow-sm border border-base-200 mb-6">
          <h3 className="text-lg font-semibold text-base-content mb-4">Cek Tiket</h3>
          <form onSubmit={handleLookup} className="flex gap-2">
            <input type="text" placeholder="Masukkan ID Tiket..." className="input input-bordered flex-1" value={ticketId} onChange={(e) => setTicketId(e.target.value)} disabled={isProcessing} />
            <button type="submit" className="btn btn-primary" disabled={isProcessing || !ticketId.trim()}>
              {isProcessing ? <span className="loading loading-spinner loading-sm"></span> : 'Cek'}
            </button>
          </form>
          {lookupError && (
            <div className="alert alert-error mt-3 text-sm">
              <span>{lookupError}</span>
            </div>
          )}
        </div>
      )}

      {/* Ticket Info + Action Buttons */}
      {ticketInfo && !actionResult && (
        <div className="bg-base-100 p-6 rounded-xl shadow-sm border border-base-200 mb-6">
          <div className="text-center mb-6">
            <div className={`badge badge-lg mb-3 ${
              ticketInfo.status === 'valid' ? 'badge-success' : ticketInfo.status === 'used' ? 'badge-warning' : 'badge-error'
            }`}>
              Status: {ticketInfo.status === 'valid' ? 'Valid' : ticketInfo.status === 'used' ? 'Sudah Digunakan' : 'Tidak Valid'}
            </div>
            <h3 className="text-xl font-bold text-base-content">{ticketInfo.buyerName}</h3>
            <p className="text-sm text-base-content/60">{ticketInfo.ticketType} — {ticketInfo.event}</p>
            <p className="text-xs text-base-content/40 font-mono mt-1">{ticketInfo.id}</p>
          </div>

          <div className="grid grid-cols-1 gap-3">
            <button onClick={() => handleAction('valid')} className="btn btn-success text-white" disabled={isProcessing}>
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              Tiket Valid
            </button>
            <button onClick={() => handleAction('used')} className="btn btn-warning text-white" disabled={isProcessing}>
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              Sudah Digunakan
            </button>
            <button onClick={() => handleAction('invalid')} className="btn btn-error text-white" disabled={isProcessing}>
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              Tiket Tidak Valid
            </button>
          </div>

          <button onClick={() => { setTicketInfo(null); setLookupError(null); }} className="btn btn-ghost w-full mt-3" disabled={isProcessing}>
            Cek Tiket Lain
          </button>
        </div>
      )}

      {/* Scan History */}
      {scanHistory.length > 0 && (
        <div className="bg-base-100 p-6 rounded-xl shadow-sm border border-base-200">
          <h3 className="text-lg font-semibold text-base-content mb-4">Riwayat Scan</h3>
          <div className="space-y-2">
            {scanHistory.map((item, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-base-200 last:border-0">
                <div>
                  <p className="text-sm font-medium text-base-content">{item.name}</p>
                  <p className="text-xs text-base-content/50">{item.id}</p>
                </div>
                <div className="text-right">
                  <span className={`badge badge-sm ${
                    item.action === 'Tiket Valid' ? 'badge-success' : item.action === 'Sudah Digunakan' ? 'badge-warning' : 'badge-error'
                  }`}>{item.action}</span>
                  <p className="text-xs text-base-content/50 mt-1">{item.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
