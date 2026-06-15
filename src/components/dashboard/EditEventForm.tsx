import React, { useState, useRef } from 'react';

interface EventData {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  price: number;
  quota: number;
  poster: string;
  organizer: string;
}

interface Props {
  event: EventData;
}

const formatRupiah = (n: number) => 'Rp ' + new Intl.NumberFormat('id-ID').format(n);

function parseISODate(iso: string): { date: string; time: string } {
  if (!iso) return { date: '', time: '' };
  try {
    const d = new Date(iso);
    const date = d.toISOString().slice(0, 10);
    const time = d.toISOString().slice(11, 16);
    return { date, time };
  } catch {
    return { date: iso.slice(0, 10), time: iso.slice(11, 16) || '' };
  }
}

export default function EditEventForm({ event }: Props) {
  const parsed = parseISODate(event.date);
  const [title, setTitle] = useState(event.title);
  const [description, setDescription] = useState(event.description);
  const [date, setDate] = useState(parsed.date);
  const [time, setTime] = useState(parsed.time);
  const [location, setLocation] = useState(event.location);
  const [imageUrl, setImageUrl] = useState(event.poster);
  const [price, setPrice] = useState(event.price);
  const [quota, setQuota] = useState(event.quota);
  const [organizer, setOrganizer] = useState(event.organizer);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [imageFileName, setImageFileName] = useState('');
  const [imageError, setImageError] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fileToDataUrl = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleImageFile = async (file: File) => {
    if (!file.type.startsWith('image/')) return;
    setImageFileName(file.name);
    setImageError(false);
    const dataUrl = await fileToDataUrl(file);
    setImageUrl(dataUrl);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleImageFile(file);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleImageFile(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setSubmitSuccess(false);
    setIsSubmitting(true);

    const payload = {
      title,
      description,
      date: (date && time) ? new Date(`${date}T${time}`).toISOString() : undefined,
      location,
      imageUrl,
      organizer,
      categories: [{ name: 'Regular', price, quota }],
    };

    try {
      const res = await fetch(`/api/events/${event.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setSubmitError(data.error ?? 'Gagal mengupdate event');
        setIsSubmitting(false);
        return;
      }
      setSubmitSuccess(true);
      setIsSubmitting(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setSubmitError('Gagal terhubung ke server: ' + String(err));
      setIsSubmitting(false);
    }
  };

  const priceDisplay = imageUrl.startsWith('data:') ? '' : imageUrl;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {submitSuccess && (
        <div className="alert alert-success shadow-sm">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 shrink-0"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>
          <span>Event berhasil diperbarui!</span>
        </div>
      )}

      {submitError && (
        <div className="alert alert-error shadow-sm">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 shrink-0"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" /></svg>
          <span>{submitError}</span>
        </div>
      )}

      <div className="bg-base-100 rounded-2xl border border-base-200 shadow-sm p-6 space-y-5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" /></svg>
          </div>
          <div>
            <h2 className="text-lg font-bold text-base-content">Informasi Dasar</h2>
            <p className="text-xs text-base-content/50">Detail utama event Anda</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="form-control w-full">
            <label className="label"><span className="label-text font-medium">Nama Event</span></label>
            <input type="text" className="input input-bordered w-full" value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>
          <div className="form-control w-full">
            <label className="label"><span className="label-text font-medium">Lokasi</span></label>
            <input type="text" className="input input-bordered w-full" value={location} onChange={(e) => setLocation(e.target.value)} required />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="form-control w-full">
            <label className="label"><span className="label-text font-medium">Tanggal</span></label>
            <input type="date" className="input input-bordered w-full" value={date} onChange={(e) => setDate(e.target.value)} required />
          </div>
          <div className="form-control w-full">
            <label className="label"><span className="label-text font-medium">Jam</span></label>
            <input type="time" className="input input-bordered w-full" value={time} onChange={(e) => setTime(e.target.value)} required />
          </div>
        </div>

        <div className="form-control w-full">
          <label className="label">
            <span className="label-text font-medium">Deskripsi</span>
            <span className="label-text-alt text-base-content/40">{description.length}/500</span>
          </label>
          <textarea
            className="textarea textarea-bordered w-full h-36 resize-none"
            placeholder="Jelaskan detail event, pembicara, agenda, dan informasi penting lainnya..."
            maxLength={500}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className="form-control w-full">
          <label className="label"><span className="label-text font-medium">Nama Organizer</span></label>
          <input type="text" className="input input-bordered w-full" value={organizer} onChange={(e) => setOrganizer(e.target.value)} required />
        </div>
      </div>

      <div className="bg-base-100 rounded-2xl border border-base-200 shadow-sm p-6 space-y-5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-5.25h5.25M7.5 15h3M3.375 5.25c-.621 0-1.125.504-1.125 1.125v3.026a2.999 2.999 0 0 1 0 5.198v3.026c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-3.026a2.999 2.999 0 0 1 0-5.198V6.375c0-.621-.504-1.125-1.125-1.125H3.375Z" /></svg>
          </div>
          <div>
            <h2 className="text-lg font-bold text-base-content">Tiket</h2>
            <p className="text-xs text-base-content/50">Harga dan kuota tiket</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="form-control w-full">
            <label className="label"><span className="label-text font-medium">Harga Tiket</span></label>
            <div className="join w-full">
              <span className="join-item btn btn-sm bg-base-200 border-base-300 text-base-content/60 no-animation">Rp</span>
              <input
                type="text"
                className="input input-bordered join-item w-full text-right font-mono"
                value={new Intl.NumberFormat('id-ID').format(price)}
                onChange={(e) => setPrice(parseInt(e.target.value.replace(/\D/g, '')) || 0)}
                required
              />
            </div>
            <label className="label">
              <span className="label-text-alt text-base-content/40">{price === 0 ? 'Gratis' : formatRupiah(price)}</span>
            </label>
          </div>
          <div className="form-control w-full">
            <label className="label"><span className="label-text font-medium">Kuota Tiket</span></label>
            <input
              type="number"
              className="input input-bordered w-full"
              value={quota}
              onChange={(e) => setQuota(parseInt(e.target.value) || 0)}
              min="1"
              required
            />
            <label className="label">
              <span className="label-text-alt text-base-content/40">{quota} tiket tersedia</span>
            </label>
          </div>
        </div>

        <div className="bg-primary/5 rounded-xl p-4 border border-primary/10">
          <div className="flex justify-between text-sm">
            <span className="text-base-content/60">Potensi Pendapatan</span>
            <span className="font-bold text-primary">{formatRupiah(price * quota)}</span>
          </div>
        </div>
      </div>

      <div className="bg-base-100 rounded-2xl border border-base-200 shadow-sm p-6 space-y-5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0 0 22.5 18.75V5.25A2.25 2.25 0 0 0 20.25 3H3.75A2.25 2.25 0 0 0 1.5 5.25v13.5A2.25 2.25 0 0 0 3.75 21Z" /></svg>
          </div>
          <div>
            <h2 className="text-lg font-bold text-base-content">Gambar Event</h2>
            <p className="text-xs text-base-content/50">Poster atau banner event</p>
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileInput}
        />

        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
            isDragging
              ? 'border-primary bg-primary/5 scale-[1.02]'
              : imageUrl
              ? 'border-base-300 bg-base-200/50 hover:border-primary/50'
              : 'border-base-300 hover:border-primary/50 hover:bg-base-200/30'
          }`}
        >
          {imageUrl && !imageError ? (
            <div className="space-y-3">
              <div className="relative rounded-lg overflow-hidden max-h-64 mx-auto">
                <img
                  src={imageUrl}
                  alt="Preview"
                  className="w-full h-full object-contain max-h-64"
                  onError={() => setImageError(true)}
                />
              </div>
              <div className="flex items-center justify-center gap-2 text-sm text-base-content/60">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0 0 22.5 18.75V5.25A2.25 2.25 0 0 0 20.25 3H3.75A2.25 2.25 0 0 0 1.5 5.25v13.5A2.25 2.25 0 0 0 3.75 21Z" /></svg>
                <span>{imageFileName || 'Gambar saat ini'}</span>
              </div>
              <p className="text-xs text-base-content/40">Klik atau drag untuk mengganti gambar</p>
            </div>
          ) : imageError ? (
            <div className="space-y-2">
              <div className="w-12 h-12 mx-auto rounded-full bg-warning/10 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-warning"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" /></svg>
              </div>
              <p className="text-base-content/50 text-sm">Gambar tidak bisa dimuat</p>
              <p className="text-xs text-base-content/40">Klik atau drag file gambar untuk mencoba lagi</p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center transition-colors ${isDragging ? 'bg-primary/20' : 'bg-base-200'}`}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className={`w-8 h-8 transition-colors ${isDragging ? 'text-primary' : 'text-base-content/40'}`}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-base-content">
                  {isDragging ? 'Lepas gambar di sini' : 'Drag & drop gambar di sini'}
                </p>
                <p className="text-sm text-base-content/50 mt-1">atau <span className="text-primary font-medium">klik untuk pilih file</span></p>
              </div>
              <p className="text-xs text-base-content/40">PNG, JPG, WEBP hingga 5MB</p>
            </div>
          )}
        </div>

        <div className="divider text-xs text-base-content/40">atau pakai URL</div>

        <div className="form-control w-full">
          <label className="label"><span className="label-text font-medium">URL Gambar</span></label>
          <input
            type="url"
            placeholder="https://images.unsplash.com/..."
            className="input input-bordered w-full"
            value={priceDisplay}
            onChange={(e) => { setImageUrl(e.target.value); setImageError(false); setImageFileName(''); }}
          />
        </div>

        {imageUrl && (
          <button
            type="button"
            onClick={() => { setImageUrl(''); setImageFileName(''); setImageError(false); }}
            className="btn btn-outline btn-error btn-sm w-full"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4 h-4 mr-1"><path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" /></svg>
            Hapus Gambar
          </button>
        )}
      </div>

      <div className="flex items-center justify-between">
        <a href="/dashboard/events" className="btn btn-ghost gap-1">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" /></svg>
          Kembali
        </a>
        <button type="submit" disabled={isSubmitting} className="btn btn-primary gap-1">
          {isSubmitting ? (
            <><span className="loading loading-spinner"></span>Menyimpan...</>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>
              Simpan Perubahan
            </>
          )}
        </button>
      </div>
    </form>
  );
}
