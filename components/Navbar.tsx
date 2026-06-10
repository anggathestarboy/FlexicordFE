"use client";

import { MessageSquare, Search, Award, Plus, ArrowLeft, LogOut, Bell } from 'lucide-react';
import { User, ViewType } from '@/lib/types';
import ThemeToggle from './ThemeToggle';
import FlexicordLogo from './FlexicordLogo';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';

interface NavbarProps {
  currentUser: User | null;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  currentView: ViewType;
  setView: (view: ViewType) => void;
  onAskQuestionClick: () => void;
  onLogout?: () => void;
}

export default function Navbar({
  currentUser,
  searchQuery,
  setSearchQuery,
  currentView,
  setView,
  onAskQuestionClick,
  onLogout,
}: NavbarProps) {
  const router = useRouter();
  const pathname = usePathname();

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    if (pathname !== '/') {
      router.push('/');
    }
  };

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    }
    router.push('/login');
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-200 dark:border-zinc-800 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo */}
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

        {/* Global Search Bar */}
        <div className="hidden md:flex flex-1 max-w-2xl relative">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-zinc-400" />
          </div>
          <input
            id="nav-search-input"
            type="text"
            placeholder="cari username.."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-brand-blue/50 focus:border-brand-blue dark:focus:border-brand-blue transition-all duration-150"
          />
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">

          {/* Theme Switcher Toggle */}
          <ThemeToggle />

          {/* Bell Notifikasi — hanya tampil kalau login */}
          {currentUser && (
            <Link
              href="/notifications"
              className={`relative p-2 rounded-lg border transition-all ${
                pathname === '/notifications'
                  ? 'border-brand-blue bg-brand-blue/5 dark:bg-brand-blue/15 text-brand-blue'
                  : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200'
              }`}
            >
              <Bell className="h-4 w-4" />
              {/* Badge unread — ganti angka atau sembunyikan kalau tidak ada notif */}
              <span className="absolute -top-1 -right-1 h-4 w-4 flex items-center justify-center rounded-full bg-red-500 text-white text-[9px] font-bold leading-none">
                3
              </span>
            </Link>
          )}

          {/* User Section */}
          {currentUser ? (
            <Link
              href="/profile"
              id="nav-profile-trigger"
              className={`flex items-center gap-2 p-1 rounded-full sm:rounded-lg border transition-all cursor-pointer ${
                pathname === '/profile'
                  ? 'border-brand-blue bg-brand-blue/5 dark:bg-brand-blue/15 shadow-sm'
                  : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800'
              }`}
            >
              {currentUser.avatar_url ? (
                <img
                  src={
                    currentUser.avatar_url.startsWith('http')
                      ? currentUser.avatar_url
                      : `https://pegaduanmasyarakat.alwaysdata.net/storage/${currentUser.avatar_url}`
                  }
                  alt={currentUser.username}
                  referrerPolicy="no-referrer"
                  className="h-8 w-8 rounded-full object-cover shadow-inner"
                />
              ) : (
                <div className="h-8 w-8 rounded-full bg-brand-blue text-white flex items-center justify-center font-bold text-sm shadow-inner uppercase shrink-0">
                  {currentUser.username ? currentUser.username.charAt(0) : '?'}
                </div>
              )}
              <div className="hidden sm:flex flex-col items-start pr-1 text-left">
                <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 line-clamp-1 max-w-[85px]">
                  {currentUser.username}
                </span>
                <span className="text-[10px] text-zinc-500 font-mono font-medium flex items-center gap-1">
                  <Award className="h-3 w-3 text-brand-blue" />
                  {(currentUser.reputation_points ?? currentUser.reputation ?? 0).toLocaleString()}
                </span>
              </div>
            </Link>
          ) : (
            <div className="flex items-center gap-1.5 sm:gap-2">
              <Link
                href="/login"
                className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:text-brand-blue dark:hover:text-brand-blue px-2.5 py-1.5 rounded-lg transition-colors"
              >
                Masuk
              </Link>
              <Link
                href="/register"
                className="text-xs font-semibold bg-brand-blue hover:bg-brand-blue-hover text-white px-3 py-1.5 rounded-lg transition-all shadow-xs active:scale-95"
              >
                Daftar
              </Link>
            </div>
          )}

        </div>
      </div>

      {/* Mobile Search Bar Expansion */}
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