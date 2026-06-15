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
  const [scanResult, setScanResult] = useState<{
    status: 'idle' | 'success' | 'error';
    message: string;
    details?: { buyerName: string; ticketType: string; event: string };
  }>({ status: 'idle', message: '' });
  const [isScanning, setIsScanning] = useState(true);
  const [scanHistory, setScanHistory] = useState<{ id: string; name: string; status: string; time: string }[]>([]);

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

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketId.trim()) return;
    await scanTicket(ticketId.trim());
  };

  const scanTicket = async (id: string) => {
    setIsScanning(false);
    try {
      const res = await fetch('/api/tickets/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticketId: id }),
      });
      const data = await res.json();
      const time = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

      if (data.ok && data.status === 'valid') {
        setScanResult({
          status: 'success',
          message: 'Check-in Berhasil!',
          details: {
            buyerName: data.ticket?.buyerName ?? '-',
            ticketType: data.ticket?.ticketType ?? '-',
            event: data.ticket?.eventTitle ?? '-',
          },
        });
        setScanHistory(prev => [{ id, name: data.ticket?.buyerName ?? id, status: 'success', time }, ...prev].slice(0, 20));
      } else if (data.status === 'used') {
        setScanResult({
          status: 'error',
          message: 'Tiket Sudah Digunakan!',
          details: data.ticket ? {
            buyerName: data.ticket.buyerName,
            ticketType: data.ticket.ticketType,
            event: data.ticket.eventTitle,
          } : undefined,
        });
        setScanHistory(prev => [{ id, name: data.ticket?.buyerName ?? id, status: 'used', time }, ...prev].slice(0, 20));
      } else {
        setScanResult({ status: 'error', message: data.message ?? 'Tiket Tidak Valid!' });
        setScanHistory(prev => [{ id, name: id, status: 'invalid', time }, ...prev].slice(0, 20));
      }
    } catch {
      setScanResult({ status: 'error', message: 'Gagal terhubung ke server' });
    }

    setTimeout(() => {
      setScanResult({ status: 'idle', message: '' });
      setTicketId('');
      setIsScanning(true);
    }, 3000);
  };

  const totalScans = scanHistory.filter(h => h.status === 'success').length;

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
          <div className="text-center py-12">
            <p className="text-base-content/50">Belum ada event tersedia.</p>
          </div>
        ) : (
          <div className="grid gap-3">
            {events.map(ev => (
              <button
                key={ev.id}
                onClick={() => setSelectedEvent(ev)}
                className="card card-side bg-base-100 shadow-sm border border-base-200 hover:border-primary hover:shadow-md transition-all text-left"
              >
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
      {/* Selected Event Header */}
      <div className="flex items-center gap-3 mb-6 bg-base-100 p-4 rounded-xl border border-base-200">
        <button onClick={() => { setSelectedEvent(null); setScanHistory([]); }} className="btn btn-ghost btn-sm btn-circle">
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

      {/* Stats Bar */}
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

      {/* Scanner Viewfinder */}
      <div className="relative bg-gray-900 rounded-2xl overflow-hidden aspect-[3/4] mb-6 shadow-lg border-4 border-gray-800">
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="text-gray-500 text-sm">Kamera Scanner</p>
        </div>

        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-black/40"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 border-2 border-white/50 rounded-xl shadow-[0_0_0_9999px_rgba(0,0,0,0.4)]">
            <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-primary rounded-tl-lg"></div>
            <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-primary rounded-tr-lg"></div>
            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-primary rounded-bl-lg"></div>
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-primary rounded-br-lg"></div>
            {isScanning && (
              <div className="absolute top-0 left-0 w-full h-1 bg-primary shadow-[0_0_8px_2px_rgba(var(--p),0.5)] animate-[scan_2s_ease-in-out_infinite]"></div>
            )}
          </div>
        </div>

        {scanResult.status !== 'idle' && (
          <div className={`absolute inset-0 flex flex-col items-center justify-center p-6 text-center z-10 ${
            scanResult.status === 'success' ? 'bg-success/90' : 'bg-error/90'
          }`}>
            <div className="bg-white p-4 rounded-full mb-4 shadow-lg">
              {scanResult.status === 'success' ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-error" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">{scanResult.message}</h3>
            {scanResult.details && (
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 w-full text-left mt-4 border border-white/30">
                <p className="text-white/90 text-sm mb-1">Nama Pembeli</p>
                <p className="text-white font-semibold mb-3">{scanResult.details.buyerName}</p>
                <p className="text-white/90 text-sm mb-1">Kategori Tiket</p>
                <p className="text-white font-semibold mb-3">{scanResult.details.ticketType}</p>
                <p className="text-white/90 text-sm mb-1">Event</p>
                <p className="text-white font-semibold">{scanResult.details.event}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Manual Input */}
      <div className="bg-base-100 p-6 rounded-xl shadow-sm border border-base-200 mb-6">
        <h3 className="text-lg font-semibold text-base-content mb-4">Input Manual</h3>
        <form onSubmit={handleManualSubmit} className="flex gap-2 mb-4">
          <input type="text" placeholder="Masukkan ID Tiket..." className="input input-bordered flex-1" value={ticketId} onChange={(e) => setTicketId(e.target.value)} disabled={!isScanning} />
          <button type="submit" className="btn btn-primary" disabled={!isScanning || !ticketId.trim()}>Cek</button>
        </form>
        <div className="divider text-xs text-base-content/40">SIMULASI</div>
        <div className="grid grid-cols-2 gap-3">
          <button type="button" onClick={() => scanTicket('tkt-001')} className="btn btn-outline btn-success btn-sm" disabled={!isScanning}>Scan Valid</button>
          <button type="button" onClick={() => scanTicket('INVALID-XYZ')} className="btn btn-outline btn-error btn-sm" disabled={!isScanning}>Scan Invalid</button>
        </div>
      </div>

      {/* Scan History */}
      {scanHistory.length > 0 && (
        <div className="bg-base-100 p-6 rounded-xl shadow-sm border border-base-200">
          <h3 className="text-lg font-semibold text-base-content mb-4">Riwayat Scan</h3>
          <div className="space-y-2">
            {scanHistory.map((item, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-base-200 last:border-0">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${item.status === 'success' ? 'bg-success' : item.status === 'used' ? 'bg-warning' : 'bg-error'}`}></div>
                  <div>
                    <p className="text-sm font-medium text-base-content">{item.name}</p>
                    <p className="text-xs text-base-content/50">{item.id}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`badge badge-sm ${item.status === 'success' ? 'badge-success' : item.status === 'used' ? 'badge-warning' : 'badge-error'}`}>
                    {item.status === 'success' ? 'Valid' : item.status === 'used' ? 'Pakai' : 'Invalid'}
                  </span>
                  <p className="text-xs text-base-content/50 mt-1">{item.time}</p>
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
