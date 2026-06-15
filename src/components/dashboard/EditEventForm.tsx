import React, { useState } from 'react';

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

export default function EditEventForm({ event }: Props) {
  const [title, setTitle] = useState(event.title);
  const [description, setDescription] = useState(event.description);
  const [date, setDate] = useState(event.date ? event.date.slice(0, 16) : '');
  const [location, setLocation] = useState(event.location);
  const [imageUrl, setImageUrl] = useState(event.poster);
  const [price, setPrice] = useState(event.price);
  const [quota, setQuota] = useState(event.quota);
  const [organizer, setOrganizer] = useState(event.organizer);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setSubmitSuccess(false);
    setIsSubmitting(true);

    const payload = {
      title,
      description,
      date: date ? new Date(date).toISOString() : undefined,
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
            <label className="label"><span className="label-text font-medium">Nama Event</span></label>
            <input type="text" className="input input-bordered w-full focus:outline-none focus:border-primary" value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>

          <div className="form-control w-full">
            <label className="label"><span className="label-text font-medium">Deskripsi</span></label>
            <textarea className="textarea textarea-bordered h-24 focus:outline-none focus:border-primary" value={description} onChange={(e) => setDescription(e.target.value)} required />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-control w-full">
              <label className="label"><span className="label-text font-medium">Tanggal & Waktu</span></label>
              <input type="datetime-local" className="input input-bordered w-full focus:outline-none focus:border-primary" value={date} onChange={(e) => setDate(e.target.value)} required />
            </div>
            <div className="form-control w-full">
              <label className="label"><span className="label-text font-medium">Lokasi</span></label>
              <input type="text" className="input input-bordered w-full focus:outline-none focus:border-primary" value={location} onChange={(e) => setLocation(e.target.value)} required />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-control w-full">
              <label className="label"><span className="label-text font-medium">Harga Tiket (Rp)</span></label>
              <input type="number" className="input input-bordered w-full focus:outline-none focus:border-primary" value={price} onChange={(e) => setPrice(parseInt(e.target.value) || 0)} min="0" required />
            </div>
            <div className="form-control w-full">
              <label className="label"><span className="label-text font-medium">Kuota Tiket</span></label>
              <input type="number" className="input input-bordered w-full focus:outline-none focus:border-primary" value={quota} onChange={(e) => setQuota(parseInt(e.target.value) || 0)} min="1" required />
            </div>
          </div>

          <div className="form-control w-full">
            <label className="label"><span className="label-text font-medium">URL Gambar Poster</span></label>
            <input type="url" className="input input-bordered w-full focus:outline-none focus:border-primary" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} required />
            {imageUrl && (
              <div className="mt-2">
                <img src={imageUrl} alt="Preview" className="w-32 h-20 object-cover rounded-lg border border-base-300" />
              </div>
            )}
          </div>

          <div className="form-control w-full">
            <label className="label"><span className="label-text font-medium">Nama Organizer</span></label>
            <input type="text" className="input input-bordered w-full focus:outline-none focus:border-primary" value={organizer} onChange={(e) => setOrganizer(e.target.value)} required />
          </div>
        </div>
      </div>

      {submitError && (
        <div className="alert alert-error">
          <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          <span>{submitError}</span>
        </div>
      )}

      {submitSuccess && (
        <div className="alert alert-success">
          <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          <span>Event berhasil diperbarui!</span>
        </div>
      )}

      <div className="flex justify-end gap-4">
        <a href="/dashboard/events" className="btn btn-ghost">Kembali</a>
        <button type="submit" disabled={isSubmitting} className="btn btn-primary">
          {isSubmitting ? (<><span className="loading loading-spinner"></span>Menyimpan...</>) : 'Simpan Perubahan'}
        </button>
      </div>
    </form>
  );
}
