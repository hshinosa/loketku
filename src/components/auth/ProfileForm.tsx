import React, { useState, useEffect } from 'react';

export default function ProfileForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'buyer',
  });
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    try {
      const userStr = localStorage.getItem('loketku_user');
      if (userStr) {
        const user = JSON.parse(userStr);
        setFormData({
          name: user.name ?? '',
          email: user.email ?? '',
          phone: user.phone ?? '',
          role: user.role ?? 'buyer',
        });
      }
    } catch {}
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError(null);
    setSuccess(false);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!formData.name.trim()) {
      setError('Nama wajib diisi');
      return;
    }
    if (!formData.email.trim()) {
      setError('Email wajib diisi');
      return;
    }

    if (newPassword && newPassword !== confirmPassword) {
      setError('Password baru dan konfirmasi tidak cocok');
      return;
    }
    if (newPassword && newPassword.length < 6) {
      setError('Password minimal 6 karakter');
      return;
    }

    setIsSaving(true);

    setTimeout(() => {
      const updated = {
        ...formData,
        isLoggedIn: true,
      };
      localStorage.setItem('loketku_user', JSON.stringify(updated));
      setNewPassword('');
      setConfirmPassword('');
      setSuccess(true);
      setIsSaving(false);
    }, 500);
  };

  return (
    <form onSubmit={handleSave} className="space-y-6">
      {/* Profile Info */}
      <div className="bg-base-100 rounded-xl border border-base-200 p-6">
        <h2 className="text-lg font-bold text-base-content mb-4">Informasi Profil</h2>
        
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-primary text-primary-content flex items-center justify-center text-2xl font-bold">
            {formData.name ? formData.name.charAt(0).toUpperCase() : '?'}
          </div>
          <div>
            <p className="font-semibold text-base-content">{formData.name || 'Belum ada nama'}</p>
            <p className="text-sm text-base-content/60 capitalize">{formData.role === 'organizer' ? 'Organizer' : 'Pembeli'}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="form-control w-full">
            <label className="label"><span className="label-text font-medium">Nama Lengkap</span></label>
            <input type="text" name="name" value={formData.name} onChange={handleChange} className="input input-bordered w-full" required />
          </div>

          <div className="form-control w-full">
            <label className="label"><span className="label-text font-medium">Email</span></label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} className="input input-bordered w-full" required />
          </div>

          <div className="form-control w-full">
            <label className="label"><span className="label-text font-medium">Nomor Telepon</span></label>
            <input type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="081234567890" className="input input-bordered w-full" />
          </div>
        </div>
      </div>

      {/* Change Password */}
      <div className="bg-base-100 rounded-xl border border-base-200 p-6">
        <h2 className="text-lg font-bold text-base-content mb-4">Ubah Password</h2>
        <p className="text-sm text-base-content/60 mb-4">Kosongkan jika tidak ingin mengubah password.</p>
        
        <div className="space-y-4">
          <div className="form-control w-full">
            <label className="label"><span className="label-text font-medium">Password Baru</span></label>
            <input type="password" value={newPassword} onChange={(e) => { setNewPassword(e.target.value); setError(null); setSuccess(false); }} placeholder="Minimal 6 karakter" className="input input-bordered w-full" />
          </div>

          <div className="form-control w-full">
            <label className="label"><span className="label-text font-medium">Konfirmasi Password</span></label>
            <input type="password" value={confirmPassword} onChange={(e) => { setConfirmPassword(e.target.value); setError(null); setSuccess(false); }} placeholder="Ulangi password baru" className="input input-bordered w-full" />
          </div>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="alert alert-error">
          <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-5 w-5" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="alert alert-success">
          <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-5 w-5" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          <span>Profil berhasil diperbarui!</span>
        </div>
      )}

      {/* Save Button */}
      <button type="submit" disabled={isSaving} className="btn btn-primary w-full">
        {isSaving ? <><span className="loading loading-spinner"></span>Menyimpan...</> : 'Simpan Perubahan'}
      </button>
    </form>
  );
}
