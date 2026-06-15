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
  const [isProcessing, setIsProcessing] = useState(false);
  const [actionResult, setActionResult] = useState<{
    status: 'success' | 'error';
    message: string;
    details?: { buyerName: string; ticketType: string; event: string };
  } | null>(null);
  const [isScanning, setIsScanning] = useState(true);
  const [scanHistory, setScanHistory] = useState<{ id: string; name: string; action: string; time: string }[]>([]);

  useEffect(() => {
    fetch('/api/events').then(r => r.json()).then(data => {
      if (data.events) {
        const list: EventOption[] = data.events.map((e: any) => ({
          id: e.id, title: e.title, date: e.date, location: e.location, poster: e.poster,
          totalTickets: e.quota ?? 0, scannedTickets: e.sold ?? 0,
        }));
        setEvents(list);
        if (initialEventId) {
          const match = list.find(e => e.id === initialEventId);
          if (match) setSelectedEvent(match);
        }
      }
    }).catch(() => {}).finally(() => setLoading(false));
  }, [initialEventId]);

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });

  const handleFillByStatus = async (status: 'valid' | 'used' | 'invalid') => {
    try {
      const res = await fetch(`/api/tickets/by-status?status=${status}`);
      const data = await res.json();
      if (data.ok && data.ticket) {
        setTicketId(data.ticket.id);
      } else {
        setTicketId(`NO_${status.toUpperCase()}_TICKET`);
      }
    } catch {
      setTicketId(`ERROR_FETCH`);
    }
  };

  const handleAction = async (action: 'valid' | 'invalid' | 'used') => {
    if (!ticketId.trim()) return;
    setIsProcessing(true);
    setIsScanning(false);

    const labels: Record<string, string> = { valid: 'Tiket Valid', invalid: 'Tiket Tidak Valid', used: 'Sudah Digunakan' };
    const time = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

    try {
      const res = await fetch('/api/tickets/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticketId: ticketId.trim(), action }),
      });
      const data = await res.json();
      const ticket = data.ticket;

      if (data.ok) {
        setActionResult({
          status: 'success',
          message: labels[action],
          details: ticket ? { buyerName: ticket.buyerName, ticketType: ticket.ticketType, event: ticket.eventTitle } : undefined,
        });
        setScanHistory(prev => [{
          id: ticketId.trim(),
          name: ticket?.buyerName ?? ticketId.trim(),
          action: labels[action],
          time,
        }, ...prev].slice(0, 50));
      } else {
        setActionResult({
          status: 'error',
          message: data.message ?? 'Tiket tidak ditemukan',
          details: ticket ? { buyerName: ticket.buyerName, ticketType: ticket.ticketType, event: ticket.eventTitle } : undefined,
        });
        setScanHistory(prev => [{
          id: ticketId.trim(),
          name: ticket?.buyerName ?? ticketId.trim(),
          action: data.message ?? 'Error',
          time,
        }, ...prev].slice(0, 50));
      }
    } catch {
      setActionResult({ status: 'error', message: 'Gagal terhubung ke server' });
    }

    setTimeout(() => {
      setActionResult(null);
      setTicketId('');
      setIsProcessing(false);
      setIsScanning(true);
    }, 3000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketId.trim()) return;
    handleAction('valid');
  };

  const totalScans = scanHistory.filter(h => h.action === 'Tiket Valid').length;

  if (loading) {
    return <div className="flex items-center justify-center py-20"><span className="loading loading-spinner loading-lg text-primary"></span></div>;
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
                <figure className="w-24 h-24 flex-shrink-0"><img src={ev.poster} alt={ev.title} className="w-full h-full object-cover" /></figure>
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
      <div className="flex items-center gap-3 mb-4 bg-base-100 p-3 rounded-xl border border-base-200">
        <button onClick={() => { setSelectedEvent(null); setScanHistory([]); }} className="btn btn-ghost btn-sm btn-circle">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" /></svg>
        </button>
        <img src={selectedEvent.poster} alt="" className="w-10 h-10 rounded-lg object-cover" />
        <div className="min-w-0 flex-1">
          <p className="font-bold text-sm text-base-content truncate">{selectedEvent.title}</p>
          <p className="text-xs text-base-content/60">{formatDate(selectedEvent.date)}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="stats stats-horizontal shadow w-full mb-4 bg-base-100 rounded-xl">
        <div className="stat py-2 px-4"><div className="stat-title text-xs">Scans</div><div className="stat-value text-lg text-primary">{totalScans}</div></div>
        <div className="stat py-2 px-4"><div className="stat-title text-xs">Terjual</div><div className="stat-value text-lg">{selectedEvent.scannedTickets}</div></div>
        <div className="stat py-2 px-4"><div className="stat-title text-xs">Kuota</div><div className="stat-value text-lg">{selectedEvent.totalTickets}</div></div>
      </div>

      {/* Scanner Viewfinder */}
      <div className="relative bg-gray-900 rounded-2xl overflow-hidden aspect-square mb-4 shadow-lg border-4 border-gray-800">
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="text-gray-500 text-sm">Kamera Scanner</p>
        </div>
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-black/40"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-56 h-56 border-2 border-white/50 rounded-xl shadow-[0_0_0_9999px_rgba(0,0,0,0.4)]">
            <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-primary rounded-tl-lg"></div>
            <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-primary rounded-tr-lg"></div>
            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-primary rounded-bl-lg"></div>
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-primary rounded-br-lg"></div>
            {isScanning && (
              <div className="absolute top-0 left-0 w-full h-1 bg-primary shadow-[0_0_8px_2px_rgba(var(--p),0.5)] animate-[scan_2s_ease-in-out_infinite]"></div>
            )}
          </div>
        </div>

        {/* Result Overlay */}
        {actionResult && (
          <div className={`absolute inset-0 flex flex-col items-center justify-center p-6 text-center z-10 ${actionResult.status === 'success' ? 'bg-success/90' : 'bg-error/90'}`}>
            <div className="bg-white p-4 rounded-full mb-3 shadow-lg">
              {actionResult.status === 'success' ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-error" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
              )}
            </div>
            <h3 className="text-xl font-bold text-white mb-2">{actionResult.message}</h3>
            {actionResult.details && (
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 w-full text-left border border-white/30">
                <p className="text-white font-semibold">{actionResult.details.buyerName}</p>
                <p className="text-white/80 text-sm">{actionResult.details.ticketType} — {actionResult.details.event}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Input Tiket */}
      <form onSubmit={handleSubmit} className="flex gap-2 mb-4">
        <input
          type="text"
          placeholder="Masukkan ID Tiket atau scan QR..."
          className="input input-bordered flex-1 bg-base-100"
          value={ticketId}
          onChange={(e) => setTicketId(e.target.value)}
          disabled={isProcessing}
          autoFocus
        />
      </form>

      {/* 3 Placeholder Buttons — klik untuk auto-fill tiket by status */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <button
          onClick={() => handleFillByStatus('valid')}
          className="btn btn-outline btn-success btn-sm h-auto py-3 flex-col gap-1"
          disabled={isProcessing}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
          <span className="text-xs">Ambil Valid</span>
        </button>
        <button
          onClick={() => handleFillByStatus('used')}
          className="btn btn-outline btn-warning btn-sm h-auto py-3 flex-col gap-1"
          disabled={isProcessing}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          <span className="text-xs">Ambil Used</span>
        </button>
        <button
          onClick={() => handleFillByStatus('invalid')}
          className="btn btn-outline btn-error btn-sm h-auto py-3 flex-col gap-1"
          disabled={isProcessing}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          <span className="text-xs">Ambil Invalid</span>
        </button>
      </div>

      {/* Scan Button */}
      <button
        onClick={() => handleAction('valid')}
        className="btn btn-primary w-full mb-4"
        disabled={isProcessing || !ticketId.trim()}
      >
        {isProcessing ? <span className="loading loading-spinner loading-sm"></span> : null}
        Scan Tiket
      </button>

      {/* Scan History */}
      {scanHistory.length > 0 && (
        <div className="bg-base-100 p-4 rounded-xl shadow-sm border border-base-200">
          <h3 className="font-semibold text-base-content mb-3 text-sm">Riwayat ({scanHistory.length})</h3>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {scanHistory.map((item, i) => (
              <div key={i} className="flex items-center justify-between py-1.5 border-b border-base-200 last:border-0">
                <div>
                  <p className="text-sm font-medium text-base-content">{item.name}</p>
                  <p className="text-xs text-base-content/50">{item.id}</p>
                </div>
                <div className="text-right">
                  <span className={`badge badge-sm ${
                    item.action === 'Tiket Valid' ? 'badge-success' : item.action.includes('Digunakan') ? 'badge-warning' : 'badge-error'
                  }`}>{item.action}</span>
                  <p className="text-xs text-base-content/50 mt-0.5">{item.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <style>{`
        @keyframes scan {
          0% { top: 0; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
      `}</style>
    </div>
  );
}
