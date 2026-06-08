"use client";

import React, { useState } from 'react';
import { Mail, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react';
import FlexicordLogo from '@/components/FlexicordLogo';
import { User } from '@/lib/types';
import { useApp } from '@/context/AppContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const { setCurrentUser, showNotification } = useApp();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Harap masukkan email dan kata sandi Anda.');
      return;
    }

    if (password.length < 4) {
      setError('Kata sandi harus terdiri dari minimal 4 karakter.');
      return;
    }

    const usernameFromEmail = email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
    const displayNameFromEmail = email.split('@')[0]
      .split(/[-._]/)
      .map(part => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');

    const loggedInUser: User = {
      id: `u-${Date.now()}`,
      username: usernameFromEmail || 'developer',
      displayName: displayNameFromEmail || 'Developer Elite',
      avatarUrl: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80`,
      reputation: 1540,
      joinedDate: 'Juni 2026',
      bio: 'Seorang penjelajah baris kode yang baru saja bergabung kembali di gerbang Flexicord.',
      badges: {
        gold: 1,
        silver: 4,
        bronze: 12,
      },
    };

    setCurrentUser(loggedInUser);
    showNotification(`Selamat datang kembali, ${loggedInUser.displayName}! 👋`);
    router.push('/');
  };

  return (
    <div className="w-full min-h-[580px] bg-white dark:bg-zinc-950 rounded-2xl border border-zinc-200 dark:border-zinc-850 overflow-hidden shadow-md grid grid-cols-1 lg:grid-cols-12">
      <div className="col-span-12 lg:col-span-5 bg-gradient-to-br from-zinc-900 via-zinc-950 to-blue-950/85 p-8 sm:p-12 text-white flex flex-col justify-between relative overflow-hidden border-b lg:border-b-0 lg:border-r border-zinc-800">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
        
        <div className="my-auto relative z-10 space-y-7">
          <div className="flex flex-col items-start gap-4">
            <div className="p-3 bg-white/5 dark:bg-zinc-900/50 rounded-2xl border border-white/10 shadow-lg inline-block">
              <FlexicordLogo size={64} className="text-zinc-100" />
            </div>
            <span className="text-3xl font-black font-sans tracking-tight">
              Flexi<span className="text-sky-400">cord</span>
            </span>
          </div>
          
          <div className="h-[2px] w-12 bg-gradient-to-r from-teal-400 to-sky-400 rounded" />
          
          <h2 className="text-lg sm:text-xl font-medium tracking-wide text-zinc-300 italic font-mono">
            &ldquo;ada masalah, kita atasi bersama&rdquo;
          </h2>
        </div>

        <div className="text-[11px] text-zinc-500 font-mono relative z-10 flex justify-between items-center mt-8">
          <span>© 1.2.0 Flexicord Dev</span>
          <span className="flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Active
          </span>
        </div>
      </div>

      <div className="lg:col-span-7 p-8 sm:p-12 md:p-16 flex flex-col justify-center bg-white dark:bg-zinc-950">
        <div className="max-w-md w-full mx-auto space-y-6">
          <div>
            <h3 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-white tracking-tight">
              Selamat datang kembali
            </h3>
            <p className="text-xs sm:text-sm text-zinc-500 mt-1.5 dark:text-zinc-400">
              Isi kredensial akun Anda di bawah ini untuk memulai sesi diskusi.
            </p>
          </div>

          {error && (
            <div className="p-3.5 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 text-xs text-red-650 dark:text-red-400 font-medium flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-red-500 uppercase shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-widest block">
                Surel / Alamat Email <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-405">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full text-sm pl-10 pr-4 py-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-55/40 dark:bg-zinc-900/40 text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-brand-blue/40 focus:border-brand-blue transition-all"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-widest block">
                  Kata Sandi <span className="text-red-500">*</span>
                </label>
                <a href="#reset" className="text-xs text-brand-blue hover:underline font-medium">
                  Lupa sandi?
                </a>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-405">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full text-sm pl-10 pr-10 py-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-55/40 dark:bg-zinc-900/40 text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-brand-blue/40 focus:border-brand-blue transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-400 hover:text-zinc-650 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <label htmlFor="remember-me" className="flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-400 cursor-pointer select-none">
                <input
                  id="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="accent-brand-blue h-4 w-4 rounded border-zinc-300 focus:ring-0 cursor-pointer"
                />
                <span>Ingat saya di perangkat ini</span>
              </label>
            </div>

            <button
              type="submit"
              className="w-full bg-brand-blue hover:bg-brand-blue-hover text-white text-sm font-semibold py-2.5 rounded-lg shadow-sm hover:shadow active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Masuk Sekarang</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          <div className="pt-4 border-t border-zinc-150 dark:border-zinc-900 text-center text-xs text-zinc-500 dark:text-zinc-400">
            <span>Belum memiliki akun Flexicord? </span>
            <Link
              href="/register"
              className="text-brand-blue hover:underline font-bold cursor-pointer"
            >
              Daftar akun gratis
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
