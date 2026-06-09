"use client";

import React, { useState } from 'react';
import { Mail, Lock, User as UserIcon, ArrowRight, Eye, EyeOff, ShieldAlert, Zap, MessageSquare, Trophy, Users } from 'lucide-react';
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

export default function RegisterPage() {
  const { setCurrentUser, showNotification } = useApp();
  const router = useRouter();

  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!displayName || !username || !email || !password) {
      setError('Mohon lengkapi semua bidang isian formulir.');
      return;
    }
    if (username.length < 3) {
      setError('Nama Pengguna minimal kudu 3 karakter.');
      return;
    }
    if (password.length < 5) {
      setError('Kata Sandi minimal kudu 5 karakter.');
      return;
    }
    if (!agreeTerms) {
      setError('Anda harus menyetujui Ketentuan Penggunaan Layanan Flexicord.');
      return;
    }

    const cleanUsername = username.toLowerCase().trim().replace(/[^a-z0-9_-]/g, '');

    const registeredUser: User = {
      id: `u-${Date.now()}`,
      username: cleanUsername || 'developerbaru',
      displayName: displayName.trim(),
      avatarUrl: `https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=150&q=80`,
      reputation: 1,
      joinedDate: 'Juni 2026',
      bio: 'Pengembang baru bersemangat tinggi yang baru saja menetapkan lencana pertamanya di Flexicord.',
      badges: { gold: 0, silver: 0, bronze: 0 },
    };

    setCurrentUser(registeredUser);
    showNotification(`Akun berhasil dibuat! Selamat bergabung, ${registeredUser.displayName}! 🎉`);
    router.push('/');
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
      <div className="lg:col-span-8 p-8 sm:p-12 flex flex-col justify-center bg-white dark:bg-zinc-950">
        <div className="max-w-md w-full mx-auto space-y-6">
          <div>
            <h3 className="text-xl font-bold text-zinc-900 dark:text-white tracking-tight">
              Daftar akun baru
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              Isi data di bawah untuk membuat akun Flexicord.
            </p>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 text-xs text-red-600 dark:text-red-400 flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Nama Lengkap */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-widest block">
                  Nama Lengkap <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Budi Santoso"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className={`${inputBase} pl-10 pr-4`}
                    required
                  />
                </div>
              </div>

              {/* Username */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-widest block">
                  Username <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-mono font-bold text-zinc-400 pointer-events-none">@</span>
                  <input
                    type="text"
                    placeholder="budisan"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className={`${inputBase} pl-9 pr-4`}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-widest block">
                Email <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 pointer-events-none" />
                <input
                  type="email"
                  placeholder="budi@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`${inputBase} pl-10 pr-4`}
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-widest block">
                Kata Sandi <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Buat sandi tangguh..."
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`${inputBase} pl-10 pr-10`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Checkbox */}
            <label
              htmlFor="agree"
              className="flex items-start gap-2.5 text-xs text-zinc-600 dark:text-zinc-400 cursor-pointer select-none pt-1"
            >
              <input
                id="agree"
                type="checkbox"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="accent-brand-blue h-4 w-4 rounded border-zinc-300 cursor-pointer mt-0.5"
              />
              <span>Saya menyetujui Ketentuan Penggunaan dan Kebijakan Privasi Flexicord.</span>
            </label>

            <button
              type="submit"
              className="w-full bg-brand-blue hover:bg-brand-blue-hover text-white text-sm font-semibold py-2.5 rounded-lg active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              Daftarkan Akun
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          <div className="pt-4 border-t border-zinc-100 dark:border-zinc-900 text-center text-xs text-zinc-500 dark:text-zinc-400">
            Sudah punya akun?{' '}
            <Link href="/login" className="text-brand-blue hover:underline font-semibold">
              Masuk di sini
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}