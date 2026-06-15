import React, { useState } from 'react';

// Seeded accounts for demo purposes
const ACCOUNTS = [
  { email: 'admin@loketku.com', password: 'admin123', name: 'Admin Loketku', role: 'organizer' as const },
  { email: 'budi@example.com', password: 'budi123', name: 'Budi Santoso', role: 'buyer' as const },
];

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password.trim()) {
      setError('Email dan password wajib diisi');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      // Check seeded accounts
      const account = ACCOUNTS.find(
        (a) => a.email.toLowerCase() === email.toLowerCase() && a.password === password
      );

      // Also check registered users from localStorage
      const registeredStr = localStorage.getItem('loketku_users');
      let registeredUser = null;
      if (registeredStr) {
        try {
          const users = JSON.parse(registeredStr);
          registeredUser = users.find(
            (u: any) => u.email?.toLowerCase() === email.toLowerCase() && u.password === password
          );
        } catch {}
      }

      const matchedUser = account ?? registeredUser;

      if (!matchedUser) {
        setError('Email atau password salah');
        setIsLoading(false);
        return;
      }

      localStorage.setItem('loketku_user', JSON.stringify({
        name: matchedUser.name,
        email: matchedUser.email,
        role: matchedUser.role,
        phone: (matchedUser as any).phone ?? '',
        isLoggedIn: true,
      }));

      if (matchedUser.role === 'organizer') {
        window.location.href = '/dashboard';
      } else {
        window.location.href = '/';
      }
    }, 600);
  };

  return (
    <div className="card bg-base-100 shadow-xl w-full">
      <div className="card-body">
        <h2 className="card-title text-2xl font-bold justify-center mb-6">Masuk ke Akun</h2>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="form-control w-full">
            <label className="label"><span className="label-text font-medium">Email</span></label>
            <input type="email" placeholder="nama@email.com" className="input input-bordered w-full" value={email} onChange={(e) => { setEmail(e.target.value); setError(null); }} required />
          </div>

          <div className="form-control w-full">
            <label className="label"><span className="label-text font-medium">Password</span></label>
            <input type="password" placeholder="Masukkan password" className="input input-bordered w-full" value={password} onChange={(e) => { setPassword(e.target.value); setError(null); }} required />
            <label className="label justify-end">
              <span className="label-text-alt text-base-content/50">Lupa password? Hubungi admin.</span>
            </label>
          </div>

          {error && (
            <div className="alert alert-error text-sm">
              <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-5 w-5" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              <span>{error}</span>
            </div>
          )}

          <button type="submit" className="btn btn-primary w-full mt-4" disabled={isLoading}>
            {isLoading ? <span className="loading loading-spinner"></span> : null}
            Masuk
          </button>
        </form>

        {/* Demo credentials hint */}
        <div className="bg-base-200 rounded-lg p-3 mt-4 text-xs text-base-content/60">
          <p className="font-semibold mb-1">Akun Demo:</p>
          <p>Organizer: <code className="font-mono">admin@loketku.com</code> / <code className="font-mono">admin123</code></p>
          <p>Pembeli: <code className="font-mono">budi@example.com</code> / <code className="font-mono">budi123</code></p>
        </div>

        <div className="text-center mt-6 text-sm text-base-content/60">
          Belum punya akun? <a href="/register" className="link link-primary font-medium">Daftar sekarang</a>
        </div>
      </div>
    </div>
  );
}
