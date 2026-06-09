"use client";

import React, { useState } from 'react';
import { Mail, Lock, ArrowRight, Eye, EyeOff, ShieldAlert, MessageSquare, Trophy, Users } from 'lucide-react';
import FlexicordLogo from '@/components/FlexicordLogo';
import { User } from '@/lib/types';
import { useApp } from '@/context/AppContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const features = [
  {
    icon: <MessageSquare className="h-4 w-4 text-sky-400" />,
    title: 'Tanya apa saja',
    desc: 'Bug, arsitektur, deployment — semua bisa didiskusikan.',
  },
  {
    icon: <Trophy className="h-4 w-4 text-sky-400" />,
    title: 'Kumpulkan reputasi',
    desc: 'Jawab pertanyaan, raih poin, dan naik peringkat.',
  },
];

export default function LoginPage() {
  const { setCurrentUser, showNotification } = useApp();
  const router = useRouter();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Validasi input
    if (!username || !password) {
      setError('Harap masukkan username dan kata sandi Anda.');
      setIsLoading(false);
      return;
    }

    if (password.length < 4) {
      setError('Kata sandi harus terdiri dari minimal 4 karakter.');
      setIsLoading(false);
      return;
    }

    try {
      // Panggil API login
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          username: username, // Kirim username sesuai dengan yang diharapkan backend
          password: password 
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Tampilkan pesan error dari backend
        throw new Error(data.message || 'Login gagal');
      }

      // Login berhasil
      // Data user dari response API (asumsikan struktur seperti ini)
      // Sesuaikan dengan response actual dari backend Anda
    const loggedInUser: User = {
  id: data.user.id,
  username: data.user.username,
  email: data.user.email,
  avatar_url: data.user.avatar_url,
  bio: data.user.bio,
  reputation_points: data.user.reputation_points,
  level: data.user.level,
  is_banned: data.user.is_banned,
  created_at: data.user.created_at,
  updated_at: data.user.updated_at,
  roles: data.user.roles,
  primary_role: data.user.primary_role,
};

      setCurrentUser(loggedInUser);
      showNotification(`Selamat datang kembali, ${loggedInUser.username}! 👋`);
      
      // Redirect ke halaman utama
      router.push('/');
      
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'Terjadi kesalahan saat login. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  const inputBase =
    'w-full text-sm py-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-brand-blue/40 focus:border-brand-blue transition-all';

  return (
    <div className="w-full min-h-[580px] bg-white dark:bg-zinc-950 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-md grid grid-cols-1 lg:grid-cols-12">

      {/* ── Kiri ── */}
      <div className="col-span-12 lg:col-span-4 bg-zinc-950 p-8 sm:p-10 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-zinc-800">
        <div className="flex flex-col gap-6">

          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-zinc-900 rounded-lg border border-zinc-800">
              <FlexicordLogo size={25} className="text-sky-400" />
            </div>
            <span className="text-lg font-black text-white tracking-tight">
              Flexi<span className="text-sky-400">cord</span>
            </span>
          </div>

          <div className="h-px bg-zinc-800" />

          {/* Headline */}
          <div>
            <h2 className="text-2xl font-black text-white leading-tight tracking-tight">
              Tempat terbaik<br />
              tanya &amp; jawab<br />
              sesama dev.
            </h2>
            <p className="text-sm text-zinc-500 mt-2.5 leading-relaxed">
              Komunitas pengembang Indonesia yang saling bantu memecahkan masalah teknis setiap hari.
            </p>
          </div>

          {/* Feature list */}
          <div className="flex flex-col gap-4">
            {features.map((f) => (
              <div key={f.title} className="flex items-start gap-3">
                <div className="p-1.5 bg-zinc-900 rounded-lg border border-zinc-800 shrink-0">
                  {f.icon}
                </div>
                <div>
                  <p className="text-sm font-semibold text-zinc-200 leading-tight">{f.title}</p>
                  <p className="text-xs text-zinc-500 mt-0.5 leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div>
          <div className="h-px bg-zinc-800 mb-4" />
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-zinc-600 font-mono">© Flexicord</span>
            <span className="flex items-center gap-1.5 text-[11px] text-emerald-500">
            </span>
          </div>
        </div>
      </div>

      {/* ── Kanan — Form ── */}
      <div className="lg:col-span-8 p-8 sm:p-12 md:p-16 flex flex-col justify-center bg-white dark:bg-zinc-950">
        <div className="max-w-md w-full mx-auto space-y-6">
          <div>
            <h3 className="text-xl font-bold text-zinc-900 dark:text-white tracking-tight">
              Selamat datang kembali
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              Masukkan kredensial akun Anda untuk melanjutkan.
            </p>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 text-xs text-red-600 dark:text-red-400 flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-widest block">
                Username <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Masukkan username Anda"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className={`${inputBase} pl-10 pr-4`}
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-widest block">
                  Kata Sandi <span className="text-red-500">*</span>
                </label>
                <a href="#reset" className="text-xs text-brand-blue hover:underline font-medium">
                  Lupa sandi?
                </a>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Masukkan kata sandi Anda"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`${inputBase} pl-10 pr-10`}
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 cursor-pointer"
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-brand-blue hover:bg-brand-blue-hover text-white text-sm font-semibold py-2.5 rounded-lg active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  <span>Memproses...</span>
                </>
              ) : (
                <>
                  Masuk Sekarang
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          <div className="pt-4 border-t border-zinc-100 dark:border-zinc-900 text-center text-xs text-zinc-500 dark:text-zinc-400">
            Belum punya akun?{' '}
            <Link href="/register" className="text-brand-blue hover:underline font-semibold">
              Daftar akun gratis
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}