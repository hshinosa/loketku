import React, { useState, useEffect } from 'react';

export default function ScannerApp() {
  const [ticketId, setTicketId] = useState('');
  const [scanResult, setScanResult] = useState<{
    status: 'idle' | 'success' | 'error';
    message: string;
    details?: {
      buyerName: string;
      ticketType: string;
      event: string;
    };
  }>({ status: 'idle', message: '' });
  const [isScanning, setIsScanning] = useState(true);

  // Simulate scanning animation
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;
    if (isScanning) {
      interval = setInterval(() => {
        // Just to keep the animation running
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isScanning]);

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
      } else if (data.status === 'used') {
        setScanResult({
          status: 'error',
          message: 'Tiket Sudah Digunakan!',
          details: data.ticket
            ? {
                buyerName: data.ticket.buyerName,
                ticketType: data.ticket.ticketType,
                event: data.ticket.eventTitle,
              }
            : undefined,
        });
      } else {
        setScanResult({
          status: 'error',
          message: data.message ?? 'Tiket Tidak Ditemukan atau Tidak Valid!',
        });
      }
    } catch (err) {
      setScanResult({
        status: 'error',
        message: 'Gagal terhubung ke server: ' + String(err),
      });
    }

    setTimeout(() => {
      setScanResult({ status: 'idle', message: '' });
      setTicketId('');
      setIsScanning(true);
    }, 3000);
  };

  return (
    <div className="max-w-md mx-auto">
      {/* Scanner Viewfinder */}
      <div className="relative bg-black rounded-2xl overflow-hidden aspect-[3/4] mb-6 shadow-lg border-4 border-gray-800">
        {/* Camera placeholder */}
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="text-gray-500 text-sm">Kamera Aktif</p>
        </div>

        {/* Scanning Overlay */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Darkened edges */}
          <div className="absolute inset-0 bg-black/40"></div>
          
          {/* Clear center square */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 border-2 border-white/50 rounded-xl shadow-[0_0_0_9999px_rgba(0,0,0,0.4)]">
            {/* Corner markers */}
            <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-[#1932B9] rounded-tl-lg"></div>
            <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-[#1932B9] rounded-tr-lg"></div>
            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-[#1932B9] rounded-bl-lg"></div>
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-[#1932B9] rounded-br-lg"></div>
            
            {/* Scanning line animation */}
            {isScanning && (
              <div className="absolute top-0 left-0 w-full h-1 bg-[#1932B9] shadow-[0_0_8px_2px_rgba(25,50,185,0.5)] animate-[scan_2s_ease-in-out_infinite]"></div>
            )}
          </div>
        </div>

        {/* Result Overlay */}
        {scanResult.status !== 'idle' && (
          <div className={`absolute inset-0 flex flex-col items-center justify-center p-6 text-center z-10 ${
            scanResult.status === 'success' ? 'bg-success/90' : 'bg-[#BF0000]/90'
          }`}>
            <div className="bg-white p-4 rounded-full mb-4 shadow-lg">
              {scanResult.status === 'success' ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-[#BF0000]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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

      {/* Manual Input Form */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Input Manual</h3>
        <form onSubmit={handleManualSubmit} className="flex gap-2 mb-6">
          <input 
            type="text" 
            placeholder="Masukkan ID Tiket..." 
            className="input input-bordered flex-1 focus:outline-none focus:border-[#1932B9]"
            value={ticketId}
            onChange={(e) => setTicketId(e.target.value)}
            disabled={!isScanning}
          />
          <button 
            type="submit" 
            className="btn bg-[#1932B9] hover:bg-[#1932B9]/90 text-white border-none"
            disabled={!isScanning || !ticketId.trim()}
          >
            Cek
          </button>
        </form>

        <div className="divider text-xs text-gray-400">SIMULASI SCANNER</div>
        
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => scanTicket('tkt-001')}
            className="btn btn-outline text-success hover:bg-success hover:text-white hover:border-success btn-sm"
            disabled={!isScanning}
          >
            Scan Seed Ticket
          </button>
          <button
            type="button"
            onClick={() => scanTicket('INVALID-XYZ')}
            className="btn btn-outline text-[#BF0000] hover:bg-[#BF0000] hover:text-white hover:border-[#BF0000] btn-sm"
            disabled={!isScanning}
          >
            Scan Invalid
          </button>
        </div>
      </div>

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
