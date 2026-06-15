import React, { useState } from 'react';

export default function RegisterForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'buyer' | 'organizer'>('buyer');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim() || !email.trim() || !password.trim()) {
      setError('Semua field wajib diisi');
      return;
    }
    if (password.length < 6) {
      setError('Password minimal 6 karakter');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      let users: any[] = [];
      try {
        users = JSON.parse(localStorage.getItem('loketku_users') ?? '[]');
      } catch {}
      users.push({ name, email, password, phone: '', role });
      localStorage.setItem('loketku_users', JSON.stringify(users));

      localStorage.setItem('loketku_user', JSON.stringify({
        role,
        email,
        name,
        phone: '',
        isLoggedIn: true,
      }));

      if (role === 'organizer') {
        window.location.href = '/dashboard';
      } else {
        window.location.href = '/';
      }
    }, 800);
  };

  return (
    <div className="card bg-base-100 shadow-xl w-full">
      <div className="card-body">
        <h2 className="card-title text-2xl font-bold justify-center mb-6">Daftar Akun Baru</h2>

        <form onSubmit={handleRegister} className="space-y-4">
          <div className="form-control w-full">
            <label className="label">
              <span className="label-text font-medium">Nama Lengkap</span>
            </label>
            <input
              type="text"
              placeholder="Nama lengkap Anda"
              className="input input-bordered w-full"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="form-control w-full">
            <label className="label">
              <span className="label-text font-medium">Email</span>
            </label>
            <input
              type="email"
              placeholder="nama@email.com"
              className="input input-bordered w-full"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-control w-full">
            <label className="label">
              <span className="label-text font-medium">Password</span>
            </label>
            <input
              type="password"
              placeholder="Minimal 6 karakter"
              className="input input-bordered w-full"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="form-control w-full">
            <label className="label">
              <span className="label-text font-medium">Daftar Sebagai</span>
            </label>
            <div className="flex gap-3">
              <button
                type="button"
                className={`btn flex-1 ${role === 'buyer' ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => setRole('buyer')}
              >
                Pembeli Tiket
              </button>
              <button
                type="button"
                className={`btn flex-1 ${role === 'organizer' ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => setRole('organizer')}
              >
                Organizer
              </button>
            </div>
          </div>

          {error && (
            <div className="alert alert-error text-sm">
              <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-5 w-5" fill="none" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          <button type="submit" className="btn btn-primary w-full mt-4" disabled={isLoading}>
            {isLoading ? <span className="loading loading-spinner"></span> : null}
            Daftar Sekarang
          </button>
        </form>

        <div className="text-center mt-6 text-sm text-base-content/60">
          Sudah punya akun? <a href="/login" className="link link-primary font-medium">Masuk di sini</a>
        </div>
      </div>
    </div>
  );
}
