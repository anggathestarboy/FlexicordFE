"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, FolderTree, User } from 'lucide-react';
import { useApp } from '@/context/AppContext';

export default function MobileBottomBar() {
  const pathname = usePathname();
  const { currentUser } = useApp();

  // Helper to determine if a route is currently active
  const isActive = (path: string) => {
    if (path === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(path);
  };

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md border-t border-zinc-200 dark:border-zinc-800 shadow-[0_-4px_12px_rgba(0,0,0,0.05)] transition-all duration-200">
      <div className="flex justify-around items-center h-16 max-w-md mx-auto px-6">
        <Link
          href="/"
          className={`flex flex-col items-center gap-1 transition-all ${
            isActive('/') 
              ? 'text-brand-blue scale-105 font-bold' 
              : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200'
          }`}
        >
          <Home className="h-5 w-5" />
          <span className="text-[10px] tracking-wide">Home</span>
        </Link>

        <Link
          href="/category"
          className={`flex flex-col items-center gap-1 transition-all ${
            isActive('/category') 
              ? 'text-brand-blue scale-105 font-bold' 
              : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200'
          }`}
        >
          <FolderTree className="h-5 w-5" />
          <span className="text-[10px] tracking-wide">Kategori</span>
        </Link>

        <Link
          href={currentUser ? '/profile' : '/login'}
          className={`flex flex-col items-center gap-1 transition-all ${
            isActive('/profile') 
              ? 'text-brand-blue scale-105 font-bold' 
              : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200'
          }`}
        >
          <User className="h-5 w-5" />
          <span className="text-[10px] tracking-wide">Profil</span>
        </Link>
      </div>
    </div>
  );
}
