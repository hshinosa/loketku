import React, { useState } from 'react';

interface CheckoutFormProps {
  ticketId: string;
  eventId: string;
  quantity: number;
  totalAmount: number;
}

export default function CheckoutForm({ ticketId, eventId, quantity, totalAmount }: CheckoutFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    whatsapp: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'Nama lengkap wajib diisi';
    if (!formData.email.trim()) {
      newErrors.email = 'Email wajib diisi';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Format email tidak valid';
    }
    if (!formData.whatsapp.trim()) {
      newErrors.whatsapp = 'Nomor WhatsApp wajib diisi';
    } else if (!/^(0|62|\+62)[0-9]{8,15}$/.test(formData.whatsapp)) {
      newErrors.whatsapp = 'Format nomor WhatsApp tidak valid (contoh: 081234567890)';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    if (!validate()) return;

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ticketId,
          eventId,
          name: formData.name,
          email: formData.email,
          whatsapp: formData.whatsapp,
          quantity,
          paymentMethod: 'QRIS',
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setSubmitError(data.error ?? 'Gagal membuat transaksi');
        setIsSubmitting(false);
        return;
      }
      window.location.href = `/payment/${data.transactionId}`;
    } catch (err) {
      setSubmitError('Gagal terhubung ke server: ' + String(err));
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="form-control w-full">
        <label className="label">
          <span className="label-text font-medium text-gray-700">Nama Lengkap</span>
        </label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Sesuai KTP/Identitas"
          className={`input input-bordered w-full ${errors.name ? 'input-error' : 'focus:border-primary focus:ring-1 focus:ring-primary'}`}
        />
        {errors.name && (
          <label className="label">
            <span className="label-text-alt text-error">{errors.name}</span>
          </label>
        )}
      </div>

      <div className="form-control w-full">
        <label className="label">
          <span className="label-text font-medium text-gray-700">Alamat Email</span>
        </label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="E-ticket akan dikirim ke email ini"
          className={`input input-bordered w-full ${errors.email ? 'input-error' : 'focus:border-primary focus:ring-1 focus:ring-primary'}`}
        />
        {errors.email && (
          <label className="label">
            <span className="label-text-alt text-error">{errors.email}</span>
          </label>
        )}
      </div>

      <div className="form-control w-full">
        <label className="label">
          <span className="label-text font-medium text-gray-700">Nomor WhatsApp</span>
        </label>
        <input
          type="tel"
          name="whatsapp"
          value={formData.whatsapp}
          onChange={handleChange}
          placeholder="Contoh: 081234567890"
          className={`input input-bordered w-full ${errors.whatsapp ? 'input-error' : 'focus:border-primary focus:ring-1 focus:ring-primary'}`}
        />
        {errors.whatsapp && (
          <label className="label">
            <span className="label-text-alt text-error">{errors.whatsapp}</span>
          </label>
        )}
        <label className="label">
          <span className="label-text-alt text-gray-500">Pastikan nomor aktif untuk menerima notifikasi.</span>
        </label>
      </div>

      {submitError && (
        <div className="alert alert-error">
          <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{submitError}</span>
        </div>
      )}

      <div className="pt-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="btn btn-primary w-full text-white text-lg h-14"
        >
          {isSubmitting ? (
            <>
              <span className="loading loading-spinner"></span>
              Memproses...
            </>
          ) : (
            'Lanjut Pembayaran'
          )}
        </button>
      </div>
    </form>
  );
}