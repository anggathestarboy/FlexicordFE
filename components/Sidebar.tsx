"use client";

import { Globe, Tag, User, HelpCircle, Code, Award, LogIn, UserPlus, LogOut } from 'lucide-react';
import { ViewType, User as UserType } from '@/lib/types';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface SidebarProps {
  currentView: ViewType;
  setView: (view: ViewType) => void;
  currentUser: UserType | null;
  selectedTag: string | null;
  setSelectedTag: (tag: string | null) => void;
}

export default function Sidebar({
  currentView,
  setView,
  currentUser,
  selectedTag,
  setSelectedTag,
}: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    fetch('/api/me')
      .then((res) => setIsLoggedIn(res.ok))
      .catch(() => setIsLoggedIn(false));
  }, []);

  const handleLogout = async () => {
    await fetch('/api/logout', { method: 'POST' });
    setIsLoggedIn(false);
    router.push('/');
  };

  return (
    <aside className="w-64 hidden lg:block shrink-0 border-r border-zinc-200 dark:border-zinc-800 pr-6 pt-6 min-h-[calc(100vh-4rem)]">
      <div className="space-y-6 sticky top-22">
        {/* Navigation Section */}
        <div>
          <h3 className="px-3 text-[10px] font-bold tracking-wider text-zinc-400 dark:text-zinc-500 uppercase font-sans">
            Navigasi Utama
          </h3>
          <nav className="mt-2.5 space-y-1">
            <Link
              href="/"
              onClick={() => setSelectedTag(null)}
              className={`w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg transition-all cursor-pointer ${
                pathname === '/' && !selectedTag
                  ? 'bg-brand-blue/10 dark:bg-brand-blue/20 text-brand-blue font-semibold'
                  : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Globe className="h-4 w-4" />
                <span>Pertanyaan</span>
              </div>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-zinc-200 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 font-mono">
                3
              </span>
            </Link>

            <Link
              href="/"
              onClick={() => setSelectedTag('react')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm font-medium rounded-lg transition-all cursor-pointer ${
                pathname === '/' && selectedTag === 'react'
                  ? 'bg-brand-blue/10 dark:bg-brand-blue/20 text-brand-blue font-semibold'
                  : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              <Tag className="h-4 w-4" />
              <span>Tag Terpopuler (React)</span>
            </Link>

            <Link
              href="/ask"
              className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm font-medium rounded-lg transition-all cursor-pointer ${
                pathname === '/ask'
                  ? 'bg-brand-blue/10 dark:bg-brand-blue/20 text-brand-blue font-semibold'
                  : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              <HelpCircle className="h-4 w-4" />
              <span>Tanya Masalah</span>
            </Link>

            <Link
              href="/profile"
              className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm font-medium rounded-lg transition-all cursor-pointer ${
                pathname === '/profile'
                  ? 'bg-brand-blue/10 dark:bg-brand-blue/20 text-brand-blue font-semibold'
                  : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              <User className="h-4 w-4" />
              <span>Profil Pengguna</span>
            </Link>
          </nav>
        </div>

        {/* Auth Section */}
        {isLoggedIn !== null && (
          <div>
            <h3 className="px-3 text-[10px] font-bold tracking-wider text-zinc-400 dark:text-zinc-500 uppercase font-sans">
              Akses & Keanggotaan
            </h3>
            <nav className="mt-2.5 space-y-1">
              {isLoggedIn ? (
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-sm font-medium rounded-lg transition-all cursor-pointer text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-600"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Keluar (Logout)</span>
                </button>
              ) : (
                <>
                  <Link
                    href="/login"
                    className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm font-medium rounded-lg transition-all cursor-pointer ${
                      pathname === '/login'
                        ? 'bg-brand-blue/10 dark:bg-brand-blue/20 text-brand-blue font-semibold'
                        : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-zinc-900 dark:hover:text-white'
                    }`}
                  >
                    <LogIn className="h-4 w-4" />
                    <span>Masuk (Login)</span>
                  </Link>

                  <Link
                    href="/register"
                    className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm font-medium rounded-lg transition-all cursor-pointer ${
                      pathname === '/register'
                        ? 'bg-brand-blue/10 dark:bg-brand-blue/20 text-brand-blue font-semibold'
                        : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-zinc-900 dark:hover:text-white'
                    }`}
                  >
                    <UserPlus className="h-4 w-4" />
                    <span>Daftar / Registrasi</span>
                  </Link>
                </>
              )}
            </nav>
          </div>
        )}

        {/* Info Box */}
        <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30">
          <div className="flex items-center gap-2 text-zinc-900 dark:text-white font-semibold text-xs">
            <Code className="h-4 w-4 text-brand-blue" />
            <span>Misi Developer</span>
          </div>
          <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
            Dapatkan reputasi dengan berkontribusi memberikan jawaban solutif dan membagikan kode berkualitas tinggi.
          </p>
          <div className="mt-3 flex items-center gap-1.5 text-[10px] text-zinc-500 font-mono">
            <Award className="h-3 w-3 text-brand-blue" />
            <span>Current user: {currentUser ? currentUser.username : 'Guest'}</span>
          </div>
        </div>

        {/* Footer */}
        <div className="px-3 text-[10px] text-zinc-400 dark:text-zinc-500 space-y-1">
          <p>© 2026 Flexicord Inc.</p>
          <p>Didesain ramah mata demi kenyamanan ngoding tanpa lelah.</p>
        </div>
      </div>
    </aside>
  );
}