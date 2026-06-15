import React, { useState, useEffect } from 'react';

interface TicketCategory {
  id: string;
  name: string;
  price: number;
  quota: number;
}

const STEPS = [
  { id: 1, label: 'Info Dasar', icon: '📝' },
  { id: 2, label: 'Gambar', icon: '🖼️' },
  { id: 3, label: 'Tiket', icon: '🎫' },
  { id: 4, label: 'Review', icon: '✅' },
];

export default function CreateEventForm() {
  const [currentStep, setCurrentStep] = useState(1);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [location, setLocation] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [categories, setCategories] = useState<TicketCategory[]>([
    { id: '1', name: 'Regular', price: 50000, quota: 100 }
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);

  // Ticket category handlers
  const handleAddCategory = () => {
    setCategories([
      ...categories,
      { id: Date.now().toString(), name: '', price: 0, quota: 50 }
    ]);
  };

  const handleCategoryChange = (id: string, field: keyof TicketCategory, value: string | number) => {
    setCategories(categories.map(cat =>
      cat.id === id ? { ...cat, [field]: value } : cat
    ));
  };

  const handleRemoveCategory = (id: string) => {
    if (categories.length > 1) {
      setCategories(categories.filter(cat => cat.id !== id));
    }
  };

  // Validation per step
  const isStepValid = (step: number): boolean => {
    switch (step) {
      case 1: return title.trim().length > 0 && date.length > 0 && time.length > 0 && location.trim().length > 0;
      case 2: return imageUrl.trim().length > 0;
      case 3: return categories.every(c => c.name.trim().length > 0 && c.quota > 0);
      case 4: return true;
      default: return false;
    }
  };

  const canGoNext = () => isStepValid(currentStep);
  const canGoBack = () => currentStep > 1;

  const goNext = () => { if (canGoNext() && currentStep < 4) setCurrentStep(currentStep + 1); };
  const goBack = () => { if (canGoBack()) setCurrentStep(currentStep - 1); };

  // Format helpers
  const formatRupiah = (n: number) => 'Rp ' + new Intl.NumberFormat('id-ID').format(n);
  const formatDate = (iso: string) => {
    try { return new Date(iso).toLocaleDateString('id-ID', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }); } catch { return iso; }
  };

  const totalQuota = categories.reduce((s, c) => s + c.quota, 0);
  const minPrice = categories.length > 0 ? Math.min(...categories.map(c => c.price)) : 0;
  const maxPrice = categories.length > 0 ? Math.max(...categories.map(c => c.price)) : 0;

  // Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setIsSubmitting(true);

    const payload = {
      title,
      description: description || title,
      date: (date && time) ? new Date(`${date}T${time}`).toISOString() : new Date().toISOString(),
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
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Stepper */}
      <div className="bg-base-100 rounded-2xl border border-base-200 shadow-sm p-6">
        <div className="flex items-center justify-between">
          {STEPS.map((step, i) => (
            <React.Fragment key={step.id}>
              <button
                type="button"
                onClick={() => { if (step.id < currentStep) setCurrentStep(step.id); }}
                className={`flex flex-col items-center gap-1 transition-all ${
                  step.id === currentStep ? 'scale-110' : step.id < currentStep ? 'opacity-60 cursor-pointer hover:opacity-100' : 'opacity-40 cursor-not-allowed'
                }`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg transition-all ${
                  step.id === currentStep
                    ? 'bg-primary text-primary-content shadow-lg shadow-primary/30'
                    : step.id < currentStep
                    ? 'bg-success text-success-content'
                    : 'bg-base-200 text-base-content/40'
                }`}>
                  {step.id < currentStep ? '✓' : step.icon}
                </div>
                <span className={`text-xs font-medium hidden sm:block ${
                  step.id === currentStep ? 'text-primary' : 'text-base-content/50'
                }`}>{step.label}</span>
              </button>
              {i < STEPS.length - 1 && (
                <div className={`flex-1 h-0.5 mx-2 rounded transition-all ${
                  step.id < currentStep ? 'bg-success' : 'bg-base-200'
                }`} />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div className="bg-base-100 rounded-2xl border border-base-200 shadow-sm overflow-hidden">

        {/* ===== STEP 1: Info Dasar ===== */}
        {currentStep === 1 && (
          <div className="p-6 space-y-5 animate-in">
            <div>
              <h2 className="text-xl font-bold text-base-content">Informasi Dasar</h2>
              <p className="text-sm text-base-content/50 mt-1">Ceritakan tentang event Anda</p>
            </div>

            {/* Nama Event + Lokasi sebaris */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-control w-full">
                <label className="label"><span className="label-text font-medium">Nama Event *</span></label>
                <input
                  type="text"
                  placeholder="Contoh: Seminar Nasional Teknologi 2026"
                  className="input input-bordered w-full"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>
              <div className="form-control w-full">
                <label className="label"><span className="label-text font-medium">Lokasi *</span></label>
                <input
                  type="text"
                  placeholder="Contoh: Auditorium Kampus A"
                  className="input input-bordered w-full"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Tanggal + Jam sebaris */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="form-control w-full">
                <label className="label"><span className="label-text font-medium">Tanggal *</span></label>
                <input
                  type="date"
                  className="input input-bordered w-full"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                />
              </div>
              <div className="form-control w-full">
                <label className="label"><span className="label-text font-medium">Jam *</span></label>
                <input
                  type="time"
                  className="input input-bordered w-full"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Deskripsi full width, textarea panjang */}
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text font-medium">Deskripsi</span>
                <span className="label-text-alt text-base-content/40">{description.length}/500</span>
              </label>
              <textarea
                className="textarea textarea-bordered w-full h-36 resize-none"
                placeholder="Jelaskan detail event, pembicara, agenda, syarat pendaftaran, dan informasi penting lainnya..."
                maxLength={500}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>
        )}

        {/* ===== STEP 2: Gambar ===== */}
        {currentStep === 2 && (
          <div className="p-6 space-y-5 animate-in">
            <div>
              <h2 className="text-xl font-bold text-base-content">Gambar Event</h2>
              <p className="text-sm text-base-content/50 mt-1">Upload gambar poster atau banner event Anda</p>
            </div>

            <div className="form-control w-full">
              <label className="label"><span className="label-text font-medium">URL Gambar *</span></label>
              <input
                type="url"
                placeholder="https://images.unsplash.com/..."
                className="input input-bordered w-full"
                value={imageUrl}
                onChange={(e) => { setImageUrl(e.target.value); setImageError(false); }}
                required
              />
              <label className="label">
                <span className="label-text-alt text-base-content/40">Gunakan URL dari Unsplash, Imgur, atau hosting gambar lainnya</span>
              </label>
            </div>

            {/* Live Preview */}
            {imageUrl && !imageError && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-base-content/60">Preview</p>
                <div className="relative rounded-xl overflow-hidden border border-base-200 bg-base-200 aspect-video">
                  <img
                    src={imageUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                    onError={() => setImageError(true)}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <p className="text-white font-bold text-lg drop-shadow">{title || 'Nama Event'}</p>
                    <p className="text-white/80 text-sm drop-shadow">{location || 'Lokasi'}</p>
                  </div>
                </div>
              </div>
            )}

            {imageError && (
              <div className="alert alert-warning">
                <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-5 w-5" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                <span>Gambar tidak bisa dimuat. Periksa URL-nya.</span>
              </div>
            )}

            {!imageUrl && (
              <div className="border-2 border-dashed border-base-300 rounded-xl p-12 text-center">
                <div className="text-4xl mb-3">🖼️</div>
                <p className="text-base-content/50 text-sm">Masukkan URL gambar untuk melihat preview</p>
              </div>
            )}
          </div>
        )}

        {/* ===== STEP 3: Tiket ===== */}
        {currentStep === 3 && (
          <div className="p-6 space-y-5 animate-in">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-base-content">Kategori Tiket</h2>
                <p className="text-sm text-base-content/50 mt-1">Atur jenis tiket dan harganya</p>
              </div>
              <button type="button" onClick={handleAddCategory} className="btn btn-primary btn-sm">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4 h-4 mr-1"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
                Tambah
              </button>
            </div>

            <div className="space-y-3">
              {categories.map((cat, i) => (
                <div key={cat.id} className="bg-base-200 rounded-xl border border-base-300 overflow-hidden transition-all hover:border-primary/30">
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-primary text-primary-content text-xs flex items-center justify-center font-bold">{i + 1}</span>
                        <span className="font-medium text-sm text-base-content">{cat.name || 'Kategori Baru'}</span>
                      </div>
                      {categories.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveCategory(cat.id)}
                          className="btn btn-ghost btn-xs text-error hover:bg-error/10"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" /></svg>
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="form-control">
                        <label className="label py-1"><span className="label-text text-xs text-base-content/50">Nama</span></label>
                        <input
                          type="text"
                          placeholder="VIP, Regular, dll"
                          className="input input-bordered input-sm w-full"
                          value={cat.name}
                          onChange={(e) => handleCategoryChange(cat.id, 'name', e.target.value)}
                          required
                        />
                      </div>
                      <div className="form-control">
                        <label className="label py-1"><span className="label-text text-xs text-base-content/50">Harga</span></label>
                        <div className="join">
                          <span className="join-item btn btn-sm btn-disabled bg-base-300 border-base-300 text-base-content/50">Rp</span>
                          <input
                            type="number"
                            placeholder="0"
                            className="input input-bordered input-sm join-item w-full"
                            value={cat.price}
                            onChange={(e) => handleCategoryChange(cat.id, 'price', parseInt(e.target.value) || 0)}
                            min="0"
                            required
                          />
                        </div>
                      </div>
                      <div className="form-control">
                        <label className="label py-1"><span className="label-text text-xs text-base-content/50">Kuota</span></label>
                        <input
                          type="number"
                          placeholder="Jumlah tiket"
                          className="input input-bordered input-sm w-full"
                          value={cat.quota}
                          onChange={(e) => handleCategoryChange(cat.id, 'quota', parseInt(e.target.value) || 0)}
                          min="1"
                          required
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Summary */}
            <div className="bg-primary/5 rounded-xl p-4 border border-primary/10 flex flex-wrap gap-4 text-sm">
              <div>
                <span className="text-base-content/50">Total Kuota:</span>{' '}
                <span className="font-bold text-primary">{totalQuota} tiket</span>
              </div>
              <div>
                <span className="text-base-content/50">Range Harga:</span>{' '}
                <span className="font-bold text-primary">
                  {minPrice === 0 ? 'Gratis' : formatRupiah(minPrice)}
                  {maxPrice > minPrice ? ` — ${formatRupiah(maxPrice)}` : ''}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ===== STEP 4: Review ===== */}
        {currentStep === 4 && (
          <div className="p-6 space-y-5 animate-in">
            <div>
              <h2 className="text-xl font-bold text-base-content">Review & Publish</h2>
              <p className="text-sm text-base-content/50 mt-1">Periksa kembali sebelum mempublikasikan event Anda</p>
            </div>

            {/* Event Preview Card */}
            <div className="rounded-xl overflow-hidden border border-base-200 shadow-sm">
              <div className="relative aspect-video bg-base-200">
                {imageUrl && !imageError ? (
                  <img src={imageUrl} alt={title} className="w-full h-full object-cover" onError={() => setImageError(true)} />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl">🖼️</div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <h3 className="text-white font-bold text-xl drop-shadow-lg">{title}</h3>
                </div>
              </div>

              <div className="p-5 bg-base-100 space-y-4">
                {/* Info Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex items-start gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5 text-primary mt-0.5 shrink-0"><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" /></svg>
                    <div>
                      <p className="text-xs text-base-content/50">Tanggal & Waktu</p>
                      <p className="text-sm font-medium text-base-content">{date ? formatDate(date) + (time ? `, ${time}` : '') : '-'}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5 text-primary mt-0.5 shrink-0"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" /></svg>
                    <div>
                      <p className="text-xs text-base-content/50">Lokasi</p>
                      <p className="text-sm font-medium text-base-content">{location || '-'}</p>
                    </div>
                  </div>
                </div>

                {description && (
                  <div>
                    <p className="text-xs text-base-content/50 mb-1">Deskripsi</p>
                    <p className="text-sm text-base-content/70 line-clamp-3">{description}</p>
                  </div>
                )}

                {/* Ticket Categories */}
                <div className="border-t border-base-200 pt-4">
                  <p className="text-xs text-base-content/50 mb-2">Kategori Tiket</p>
                  <div className="space-y-2">
                    {categories.map((cat, i) => (
                      <div key={cat.id} className="flex items-center justify-between bg-base-200 rounded-lg px-3 py-2">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-primary text-primary-content text-xs flex items-center justify-center font-bold">{i + 1}</span>
                          <span className="text-sm font-medium">{cat.name}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-bold text-primary">{cat.price === 0 ? 'Gratis' : formatRupiah(cat.price)}</span>
                          <span className="text-xs text-base-content/40 ml-2">× {cat.quota}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Totals */}
                <div className="bg-primary/5 rounded-lg p-3 border border-primary/10">
                  <div className="flex justify-between text-sm">
                    <span className="text-base-content/60">Total Tiket</span>
                    <span className="font-bold text-base-content">{totalQuota}</span>
                  </div>
                  <div className="flex justify-between text-sm mt-1">
                    <span className="text-base-content/60">Potensi Pendapatan</span>
                    <span className="font-bold text-primary">
                      {formatRupiah(categories.reduce((s, c) => s + c.price * c.quota, 0))}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Error */}
      {submitError && (
        <div className="alert alert-error">
          <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-5 w-5" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          <span>{submitError}</span>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={goBack}
          disabled={!canGoBack()}
          className={`btn btn-ghost gap-1 ${!canGoBack() ? 'invisible' : ''}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" /></svg>
          Kembali
        </button>

        <div className="flex gap-2">
          <a href="/dashboard/events" className="btn btn-outline">Batal</a>

          {currentStep < 4 ? (
            <button
              type="button"
              onClick={goNext}
              disabled={!canGoNext()}
              className="btn btn-primary gap-1"
            >
              Selanjutnya
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" /></svg>
            </button>
          ) : (
            <button type="submit" disabled={isSubmitting} className="btn btn-primary gap-1">
              {isSubmitting ? (
                <><span className="loading loading-spinner"></span>Memproses...</>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>
                  Publish Event
                </>
              )}
            </button>
          )}
        </div>
      </div>

      <style>{`
        .animate-in {
          animation: fadeSlideIn 0.3s ease-out;
        }
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </form>
  );
}
