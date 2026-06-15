import React, { useState } from 'react';

interface TicketCategory {
  id: string;
  name: string;
  price: number;
  quota: number;
}

export default function CreateEventForm() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [location, setLocation] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [categories, setCategories] = useState<TicketCategory[]>([
    { id: '1', name: 'Regular', price: 50000, quota: 100 }
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleAddCategory = () => {
    setCategories([
      ...categories,
      { id: Date.now().toString(), name: '', price: 0, quota: 0 }
    ]);
  };

  const handleCategoryChange = (id: string, field: keyof TicketCategory, value: string | number) => {
    setCategories(categories.map(cat => 
      cat.id === id ? { ...cat, [field]: value } : cat
    ));
  };

  const handleRemoveCategory = (id: string) => {
    setCategories(categories.filter(cat => cat.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setIsSubmitting(true);

    const payload = {
      title,
      description,
      date: date ? new Date(date).toISOString() : new Date().toISOString(),
      location,
      imageUrl,
      categories,
    };

    try {
      const res = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setSubmitError(data.error ?? 'Gagal menyimpan event');
        setIsSubmitting(false);
        return;
      }
      window.location.href = '/dashboard/events';
    } catch (err) {
      setSubmitError('Gagal terhubung ke server: ' + String(err));
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="bg-base-100 p-6 rounded-xl shadow-sm border border-base-200">
        <h2 className="text-xl font-semibold mb-6 text-base-content border-b border-base-200 pb-4">Informasi Dasar</h2>
        
        <div className="space-y-4">
          <div className="form-control w-full">
            <label className="label">
              <span className="label-text font-medium">Nama Event</span>
            </label>
            <input 
              type="text" 
              placeholder="Contoh: Seminar Nasional Teknologi 2026" 
              className="input input-bordered w-full focus:outline-none focus:border-primary" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="form-control w-full">
            <label className="label">
              <span className="label-text font-medium">Deskripsi Event</span>
            </label>
            <textarea 
              className="textarea textarea-bordered h-24 focus:outline-none focus:border-primary" 
              placeholder="Jelaskan detail event Anda..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            ></textarea>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text font-medium">Tanggal & Waktu</span>
              </label>
              <input 
                type="datetime-local" 
                className="input input-bordered w-full focus:outline-none focus:border-primary" 
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>

            <div className="form-control w-full">
              <label className="label">
                <span className="label-text font-medium">Lokasi</span>
              </label>
              <input 
                type="text" 
                placeholder="Contoh: Auditorium Kampus A" 
                className="input input-bordered w-full focus:outline-none focus:border-primary" 
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-control w-full">
            <label className="label">
              <span className="label-text font-medium">URL Gambar Poster</span>
            </label>
            <input 
              type="url" 
              placeholder="https://example.com/image.jpg" 
              className="input input-bordered w-full focus:outline-none focus:border-primary" 
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              required
            />
          </div>
        </div>
      </div>

      <div className="bg-base-100 p-6 rounded-xl shadow-sm border border-base-200">
        <div className="flex justify-between items-center mb-6 border-b border-base-200 pb-4">
          <h2 className="text-xl font-semibold text-base-content">Kategori Tiket</h2>
          <button 
            type="button" 
            onClick={handleAddCategory}
            className="btn btn-outline btn-primary btn-sm"
          >
            + Tambah Kategori
          </button>
        </div>

        <div className="space-y-4">
          {categories.map((category, index) => (
            <div key={category.id} className="flex flex-col md:flex-row gap-4 p-4 bg-base-200 rounded-lg border border-base-300 relative">
              {categories.length > 1 && (
                <button 
                  type="button"
                  onClick={() => handleRemoveCategory(category.id)}
                  aria-label={`Hapus kategori ${category.name || index + 1}`}
                  className="absolute -top-2 -right-2 btn btn-circle btn-xs bg-error hover:bg-error/90 border-none text-error-content"
                >
                  ✕
                </button>
              )}
              
              <div className="form-control flex-1">
                <label className="label">
                  <span className="label-text text-xs font-medium">Nama Kategori</span>
                </label>
                <input 
                  type="text" 
                  placeholder="Contoh: VIP" 
                  className="input input-bordered input-sm w-full focus:outline-none focus:border-primary" 
                  value={category.name}
                  onChange={(e) => handleCategoryChange(category.id, 'name', e.target.value)}
                  required
                />
              </div>
              
              <div className="form-control flex-1">
                <label className="label">
                  <span className="label-text text-xs font-medium">Harga (Rp)</span>
                </label>
                <input 
                  type="number" 
                  placeholder="0 untuk gratis" 
                  className="input input-bordered input-sm w-full focus:outline-none focus:border-primary" 
                  value={category.price}
                  onChange={(e) => handleCategoryChange(category.id, 'price', parseInt(e.target.value) || 0)}
                  min="0"
                  required
                />
              </div>
              
              <div className="form-control flex-1">
                <label className="label">
                  <span className="label-text text-xs font-medium">Kuota</span>
                </label>
                <input 
                  type="number" 
                  placeholder="Jumlah tiket" 
                  className="input input-bordered input-sm w-full focus:outline-none focus:border-primary" 
                  value={category.quota}
                  onChange={(e) => handleCategoryChange(category.id, 'quota', parseInt(e.target.value) || 0)}
                  min="1"
                  required
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {submitError && (
        <div className="alert alert-error">
          <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{submitError}</span>
        </div>
      )}

      <div className="flex justify-end gap-4">
        <a href="/dashboard/events" className="btn btn-ghost">Batal</a>
        <button type="submit" disabled={isSubmitting} className="btn btn-primary">
          {isSubmitting ? (
            <>
              <span className="loading loading-spinner"></span>
              Menyimpan...
            </>
          ) : (
            'Simpan Event'
          )}
        </button>
      </div>
    </form>
  );
}