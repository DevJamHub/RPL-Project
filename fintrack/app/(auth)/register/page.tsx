'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert('Password dan konfirmasi password tidak cocok!');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      alert('Fitur register akan segera diaktifkan!');
    }, 1000);
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Nama Lengkap
        </label>
        <div className="mt-1">
          <Input
            id="name"
            name="name"
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Masukkan nama lengkap"
          />
        </div>
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          Email
        </label>
        <div className="mt-1">
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="contoh@email.com"
          />
        </div>
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
          Password
        </label>
        <div className="mt-1">
          <Input
            id="password"
            name="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Minimal 6 karakter"
          />
        </div>
      </div>

      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
          Konfirmasi Password
        </label>
        <div className="mt-1">
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Ulangi password"
          />
        </div>
      </div>

      <div>
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? 'Memproses...' : 'Daftar'}
        </Button>
      </div>

      <div className="text-sm text-center">
        <span className="text-gray-500">Sudah punya akun? </span>
        <Link href="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
          Masuk
        </Link>
      </div>
    </form>
  );
}
