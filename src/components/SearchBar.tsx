import { useState, useEffect, useRef } from 'react';

interface SearchResult {
  id: string;
  title: string;
  date: string;
  location: string;
  poster: string;
  price: number;
}

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price);

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });

  useEffect(() => {
    // Close dropdown when clicking outside
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (query.trim().length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    setIsLoading(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query.trim())}`);
        const data = await res.json();
        setResults(data.events ?? []);
        setIsOpen(true);
      } catch {
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="join w-full">
        <div className="relative flex-1">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-base-content/40 pointer-events-none">
            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
          </svg>
          <input
            type="text"
            placeholder="Cari event..."
            className="input input-bordered input-sm join-item w-full pl-9"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => results.length > 0 && setIsOpen(true)}
          />
        </div>
        <button className="btn btn-primary btn-sm join-item">Cari</button>
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-base-100 rounded-lg shadow-lg border border-base-200 z-50 max-h-80 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center p-4 gap-2">
              <span className="loading loading-spinner loading-sm text-primary"></span>
              <span className="text-sm text-base-content/60">Mencari...</span>
            </div>
          ) : results.length > 0 ? (
            results.map((event) => (
              <a
                key={event.id}
                href={`/event/${event.id}`}
                className="flex gap-3 p-3 hover:bg-base-200 transition-colors border-b border-base-200 last:border-0"
                onClick={() => setIsOpen(false)}
              >
                <img
                  src={event.poster}
                  alt={event.title}
                  className="w-14 h-14 rounded-lg object-cover flex-shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-sm text-base-content truncate">{event.title}</p>
                  <p className="text-xs text-base-content/60 truncate">{event.location}</p>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs text-base-content/50">{formatDate(event.date)}</span>
                    <span className="text-xs font-bold text-primary">{formatPrice(event.price)}</span>
                  </div>
                </div>
              </a>
            ))
          ) : query.trim().length >= 2 ? (
            <div className="p-4 text-center">
              <p className="text-sm text-base-content/50">Tidak ada event yang cocok</p>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
