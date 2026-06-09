"use client";

import { useEffect, useState } from 'react';
import { Search, Award, User as UserIcon } from 'lucide-react';
import { User, ViewType } from '@/lib/types';
import ThemeToggle from './ThemeToggle';
import FlexicordLogo from './FlexicordLogo';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import next from 'next';

interface NavbarProps {
  currentUser: User | null;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  currentView: ViewType;
  setView: (view: ViewType) => void;
  onAskQuestionClick: () => void;
  onLogout?: () => void;
}

function getInitials(user: User): string {
  const name = user.username || '?';
  return name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase();
}

function getAvatarColor(user: User): string {
  const colors = [
    'bg-sky-500', 'bg-violet-500', 'bg-emerald-500',
    'bg-rose-500', 'bg-amber-500', 'bg-indigo-500', 'bg-teal-500',
  ];
  const seed = (user.username || '').split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return colors[seed % colors.length];
}

function UserAvatar({ user, className = '' }: { user: User; className?: string }) {
  if (user.avatar_url) {
    return (
      <img
        src={`${process.env.NEXT_PUBLIC_IMG_URL}/${user.avatar_url}`}
        alt={user.username}
        referrerPolicy="no-referrer"
        className={`rounded-full object-cover shadow-inner ${className}`}
      />
    );
  }
  return (
    <div className={`rounded-full flex items-center justify-center font-bold text-white ${getAvatarColor(user)} ${className}`}>
      <span className="text-xs leading-none">{getInitials(user)}</span>
    </div>
  );
}

export default function Navbar({
  currentUser: currentUserProp,
  searchQuery,
  setSearchQuery,
  currentView,
  setView,
  onAskQuestionClick,
  onLogout,
}: NavbarProps) {
  const router = useRouter();
  const pathname = usePathname();

  // null  = belum selesai cek
  // false = sudah cek, tidak login
  // User  = sudah cek, login
  const [verifiedUser, setVerifiedUser] = useState<User | null | false>(null);

  useEffect(() => {
    let cancelled = false;

    async function checkSession() {
      // Kalau prop sudah null (misal habis logout dari context), langsung false
      if (currentUserProp === null) {
        setVerifiedUser(false);
        return;
      }

      try {
        const res = await fetch('/api/me', { credentials: 'include' });
        if (cancelled) return;

        if (res.ok) {
          // Kalau ada data user dari /api/me, pakai; kalau tidak, pakai prop
          try {
            const data = await res.json();
            setVerifiedUser(data.user ?? currentUserProp);
          } catch {
            setVerifiedUser(currentUserProp);
          }
        } else {
          // Token tidak valid / expired / sudah logout
          setVerifiedUser(false);
        }
      } catch {
        // Network error — fallback ke prop supaya tidak blokir UI
        if (!cancelled) setVerifiedUser(currentUserProp);
      }
    }

    checkSession();
    return () => { cancelled = true; };
  }, [currentUserProp]); // re-run tiap prop berubah (misal habis logout)

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    if (pathname !== '/') router.push('/');
  };

  // Saat masih loading (null), tampilkan skeleton kecil supaya tidak flicker
  const renderRight = () => {
    if (verifiedUser === null) {
      return <div className="h-8 w-24 rounded-lg bg-zinc-100 dark:bg-zinc-800 animate-pulse" />;
    }

    if (verifiedUser === false) {
      return (
        <div className="flex items-center gap-2">
          <Link
            href="/login"
            className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 hover:text-brand-blue dark:hover:text-brand-blue px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:border-brand-blue/50 bg-white dark:bg-zinc-900 transition-all"
          >
            Masuk
          </Link>
          <Link
            href="/register"
            className="text-sm font-semibold text-white bg-brand-blue hover:bg-brand-blue-hover px-3 py-1.5 rounded-lg transition-all active:scale-95"
          >
            Daftar
          </Link>
        </div>
      );
    }

    return (
      <Link
        href="/profile"
        id="nav-profile-trigger"
        className={`flex items-center gap-2 p-1 rounded-full sm:rounded-lg border transition-all cursor-pointer ${
          pathname === '/profile'
            ? 'border-brand-blue bg-brand-blue/5 dark:bg-brand-blue/15 shadow-sm'
            : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800'
        }`}
      >
        <UserAvatar user={verifiedUser} className="h-8 w-8" />
        <div className="hidden sm:flex flex-col items-start pr-1 text-left">
          <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 line-clamp-1 max-w-[85px]">
            {verifiedUser.username}
          </span>
          <span className="text-[10px] text-zinc-500 font-mono font-medium flex items-center gap-1">
            <Award className="h-3 w-3 text-brand-blue" />
            {verifiedUser.reputation_points}
          </span>
        </div>
      </Link>
    );
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-200 dark:border-zinc-800 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">

        <Link
          href="/"
          className="flex items-center cursor-pointer group active:scale-95 transition-transform shrink-0"
        >
          <div className="p-1 px-1.5 rounded-lg group-hover:scale-105 transition-transform">
            <FlexicordLogo size={32} className="transform -rotate-6 transition-transform group-hover:rotate-0" />
          </div>
          <span className="text-xl font-bold font-sans tracking-tight text-gray-800 dark:text-white flex items-center">
            Flexi<span className="text-brand-blue">cord</span>
          </span>
        </Link>

        <div className="hidden md:flex flex-1 max-w-2xl relative">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-zinc-400" />
          </div>
          <input
            id="nav-search-input"
            type="text"
            placeholder="Cari pertanyaan, tag, atau kendala error (cth: Next.js)..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-brand-blue/50 focus:border-brand-blue dark:focus:border-brand-blue transition-all duration-150"
          />
        </div>

        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <ThemeToggle />
          {renderRight()}
        </div>
      </div>

      <div className="block md:hidden border-t border-zinc-100 dark:border-zinc-900 px-4 py-2 bg-zinc-50/50 dark:bg-zinc-950/50">
        <div className="relative w-full">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <Search className="h-3.5 w-3.5 text-zinc-400" />
          </div>
          <input
            id="nav-mobile-search-input"
            type="text"
            placeholder="Cari pertanyaan atau kendala..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-brand-blue"
          />
        </div>
      </div>
    </header>
  );
}