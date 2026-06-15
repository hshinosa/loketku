import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';

const eventId = (window as any).eventId;
const eventTitle = (window as any).eventTitle;
const eventQuota = (window as any).eventQuota ?? 0;
const eventSold = (window as any).eventSold ?? 0;

function StaffScanner() {
  const [ticketId, setTicketId] = useState('');
  const [isScanning, setIsScanning] = useState(true);
  const [scanResult, setScanResult] = useState<{
    status: 'idle' | 'success' | 'error';
    message: string;
    details?: { buyerName: string; ticketType: string; event: string };
  }>({ status: 'idle', message: '' });
  const [scanHistory, setScanHistory] = useState<{ id: string; name: string; status: string; time: string }[]>([]);

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
        setScanHistory(prev => [{ id, name: data.ticket?.buyerName ?? id, status: 'success', time }, ...prev].slice(0, 50));
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
        setScanHistory(prev => [{ id, name: data.ticket?.buyerName ?? id, status: 'used', time }, ...prev].slice(0, 50));
      } else {
        setScanResult({ status: 'error', message: data.message ?? 'Tiket Tidak Valid!' });
        setScanHistory(prev => [{ id, name: id, status: 'invalid', time }, ...prev].slice(0, 50));
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

  return (
    <div className="py-4 space-y-4">
      {/* Stats */}
      <div className="stats stats-horizontal shadow w-full bg-base-100 rounded-xl">
        <div className="stat py-3 px-4">
          <div className="stat-title text-xs">Scanned</div>
          <div className="stat-value text-xl text-success">{totalScans}</div>
        </div>
        <div className="stat py-3 px-4">
          <div className="stat-title text-xs">Terjual</div>
          <div className="stat-value text-xl">{eventSold}</div>
        </div>
        <div className="stat py-3 px-4">
          <div className="stat-title text-xs">Kuota</div>
          <div className="stat-value text-xl">{eventQuota}</div>
        </div>
      </div>

      {/* Scanner Viewfinder */}
      <div className="relative bg-gray-900 rounded-2xl overflow-hidden aspect-square shadow-lg border-4 border-gray-800">
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="text-gray-500 text-sm">Kamera Scanner</p>
        </div>
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-black/40"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-56 h-56 border-2 border-white/50 rounded-xl shadow-[0_0_0_9999px_rgba(0,0,0,0.4)]">
            <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-green-400 rounded-tl-lg"></div>
            <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-green-400 rounded-tr-lg"></div>
            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-green-400 rounded-bl-lg"></div>
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-green-400 rounded-br-lg"></div>
            {isScanning && (
              <div className="absolute top-0 left-0 w-full h-1 bg-green-400 shadow-[0_0_8px_2px_rgba(74,222,128,0.5)] animate-[scan_2s_ease-in-out_infinite]"></div>
            )}
          </div>
        </div>

        {scanResult.status !== 'idle' && (
          <div className={`absolute inset-0 flex flex-col items-center justify-center p-6 text-center z-10 ${
            scanResult.status === 'success' ? 'bg-success/90' : 'bg-error/90'
          }`}>
            <div className="bg-white p-4 rounded-full mb-3 shadow-lg">
              {scanResult.status === 'success' ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-error" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
              )}
            </div>
            <h3 className="text-xl font-bold text-white mb-2">{scanResult.message}</h3>
            {scanResult.details && (
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 w-full text-left border border-white/30">
                <p className="text-white font-semibold">{scanResult.details.buyerName}</p>
                <p className="text-white/80 text-sm">{scanResult.details.ticketType}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Manual Input */}
      <form onSubmit={handleManualSubmit} className="flex gap-2">
        <input type="text" placeholder="Masukkan ID Tiket..." className="input input-bordered flex-1 bg-base-100" value={ticketId} onChange={(e) => setTicketId(e.target.value)} disabled={!isScanning} />
        <button type="submit" className="btn btn-primary" disabled={!isScanning || !ticketId.trim()}>Cek</button>
      </form>

      {/* Scan History */}
      {scanHistory.length > 0 && (
        <div className="bg-base-100 rounded-xl p-4 shadow-sm">
          <h3 className="font-semibold text-base-content mb-3">Riwayat Scan ({scanHistory.length})</h3>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {scanHistory.map((item, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-base-200 last:border-0">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${item.status === 'success' ? 'bg-success' : item.status === 'used' ? 'bg-warning' : 'bg-error'}`}></div>
                  <div>
                    <p className="text-sm font-medium text-base-content">{item.name}</p>
                    <p className="text-xs text-base-content/50">{item.id}</p>
                  </div>
                </div>
                <span className={`badge badge-sm ${item.status === 'success' ? 'badge-success' : item.status === 'used' ? 'badge-warning' : 'badge-error'}`}>
                  {item.status === 'success' ? 'Valid' : item.status === 'used' ? 'Pakai' : 'Invalid'}
                </span>
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

const root = document.getElementById('scanner-root');
if (root) {
  createRoot(root).render(<StaffScanner />);
}
