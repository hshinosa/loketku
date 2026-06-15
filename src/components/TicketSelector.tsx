import { useState } from 'react';

interface TicketOption {
  id: string;
  name: string;
  price: number;
  quota: number;
  description: string | null;
}

interface TicketSelectorProps {
  tickets: TicketOption[];
  eventId: string;
}

export default function TicketSelector({ tickets, eventId }: TicketSelectorProps) {
  const [selectedTicket, setSelectedTicket] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price);

  const handleBuy = () => {
    if (!selectedTicket) return;
    const params = new URLSearchParams({ quantity: String(quantity) });
    window.location.href = `/checkout/${selectedTicket}?${params.toString()}`;
  };

  if (tickets.length === 0) {
    return (
      <div className="card bg-base-200 border border-base-300 p-6 text-center">
        <p className="text-base-content/60">Tiket belum tersedia untuk event ini.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-base-content">Pilih Tiket</h3>

      {tickets.map((ticket) => {
        const isSelected = selectedTicket === ticket.id;
        const isSoldOut = ticket.quota <= 0;

        return (
          <button
            type="button"
            key={ticket.id}
            disabled={isSoldOut}
            onClick={() => {
              setSelectedTicket(ticket.id);
              setQuantity(1);
            }}
            className={`card w-full border-2 p-4 text-left transition-all ${
              isSoldOut
                ? 'border-base-300 bg-base-200 opacity-60 cursor-not-allowed'
                : isSelected
                  ? 'border-primary bg-primary/5 shadow-md'
                  : 'border-base-300 bg-base-100 hover:border-primary/50'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-base-content">{ticket.name}</p>
                {ticket.description && (
                  <p className="text-sm text-base-content/60 mt-1">{ticket.description}</p>
                )}
              </div>
              <div className="text-right">
                <p className="font-bold text-primary">{formatPrice(ticket.price)}</p>
                <p className="text-xs text-base-content/50 mt-1">
                  {isSoldOut ? 'Habis' : `Sisa ${ticket.quota}`}
                </p>
              </div>
            </div>
          </button>
        );
      })}

      {selectedTicket && (
        <div className="card bg-base-200 border border-base-300 p-4 space-y-4">
          <div className="flex items-center justify-between">
            <span className="font-medium text-base-content">Jumlah Tiket</span>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="btn btn-sm btn-outline"
              >
                −
              </button>
              <span className="w-8 text-center font-bold text-base-content">{quantity}</span>
              <button
                type="button"
                onClick={() => {
                  const t = tickets.find((tk) => tk.id === selectedTicket);
                  const max = t ? Math.min(t.quota, 10) : 10;
                  setQuantity((q) => Math.min(max, q + 1));
                }}
                className="btn btn-sm btn-outline"
              >
                +
              </button>
            </div>
          </div>

          {(() => {
            const t = tickets.find((tk) => tk.id === selectedTicket);
            if (!t) return null;
            return (
              <div className="flex items-center justify-between pt-2 border-t border-base-300">
                <span className="text-base-content/70">Total</span>
                <span className="text-xl font-bold text-primary">{formatPrice(t.price * quantity)}</span>
              </div>
            );
          })()}

          <button
            type="button"
            onClick={handleBuy}
            className="btn btn-primary w-full"
          >
            Beli Tiket
          </button>
        </div>
      )}
    </div>
  );
}
