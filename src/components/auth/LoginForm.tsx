import React, { useState } from 'react';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (role: 'buyer' | 'organizer') => {
    setIsLoading(true);
    
    setTimeout(() => {
      localStorage.setItem('loketku_user', JSON.stringify({
        role,
        email: email || (role === 'buyer' ? 'budi@example.com' : 'admin@loketku.com'),
        name: role === 'buyer' ? 'Budi Santoso' : 'Admin Event',
        isLoggedIn: true
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
        <h2 className="card-title text-2xl font-bold justify-center mb-6">Masuk ke Akun</h2>
        
        <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
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
            />
          </div>
          
          <div className="form-control w-full">
            <label className="label">
              <span className="label-text font-medium">Password</span>
            </label>
            <input 
              type="password" 
              placeholder="••••••••" 
              className="input input-bordered w-full" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <label className="label justify-end">
              <span className="label-text-alt text-base-content/50">Lupa password? Hubungi admin.</span>
            </label>
          </div>

          <div className="divider my-6">Pilih Role (Demo)</div>

          <div className="flex flex-col gap-3">
            <button 
              className="btn btn-primary w-full"
              onClick={() => handleLogin('buyer')}
              disabled={isLoading}
            >
              {isLoading ? <span className="loading loading-spinner"></span> : null}
              Login sebagai Pembeli
            </button>
            
            <button 
              className="btn btn-outline btn-primary w-full"
              onClick={() => handleLogin('organizer')}
              disabled={isLoading}
            >
              {isLoading ? <span className="loading loading-spinner"></span> : null}
              Login sebagai Organizer
            </button>
          </div>
        </form>
        
        <div className="text-center mt-6 text-sm text-base-content/60">
          Belum punya akun? <a href="/register" className="link link-primary font-medium">Daftar sekarang</a>
        </div>
      </div>
    </div>
  );
}