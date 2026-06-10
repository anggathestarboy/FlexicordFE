"use client";

import { Globe, Tag, User, HelpCircle, LogIn, UserPlus, LogOut, List, Tags, Flag, ScrollText } from 'lucide-react';
import { ViewType, User as UserType } from '@/lib/types';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

interface SidebarProps {
  currentView: ViewType;
  setView: (view: ViewType) => void;
  currentUser: UserType | null;
  selectedTag: string | null;
  setSelectedTag: (tag: string | null) => void;
}

interface ApiUser {
  id: string;
  username: string;
  email: string;
  avatar_url: string | null;
  bio: string | null;
  reputation_points: number;
  level: number;
  is_banned: number;
  primary_role: {
    id: string;
    name: string;
    permissions: string | null;
  } | null;
}

interface MeResponse {
  message: string;
  user: ApiUser;
}

const fetchMe = async (): Promise<{ isLoggedIn: boolean; user: ApiUser | null }> => {
  try {
    const response = await axios.get<MeResponse>('/api/me');
    if (response.status === 200 && response.data.user) {
      return { isLoggedIn: true, user: response.data.user };
    }
    return { isLoggedIn: false, user: null };
  } catch {
    return { isLoggedIn: false, user: null };
  }
};

const logoutUser = async () => {
  await axios.post('/api/logout');
};

export default function Sidebar({
  currentView,
  setView,
  currentUser,
  selectedTag,
  setSelectedTag,
}: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['me'],
    queryFn: fetchMe,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  const isLoggedIn = data?.isLoggedIn ?? false;
  const apiUser = data?.user ?? null;
  const isModerator =
    apiUser?.primary_role?.name === 'moderator' ||
    apiUser?.primary_role?.name === 'admin';

  const logoutMutation = useMutation({
    mutationFn: logoutUser,
    onMutate: () => {
      queryClient.setQueryData(['me'], { isLoggedIn: false, user: null });
    },
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: ['me'] });
      router.push('/');
    },
    onError: () => {
      queryClient.invalidateQueries({ queryKey: ['me'] });
    },
  });

  const modNavItem = (href: string, icon: React.ReactNode, label: string) => (
    <Link
      href={href}
      className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm font-medium rounded-lg transition-all cursor-pointer ${
        pathname === href
          ? 'bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 font-semibold'
          : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-zinc-900 dark:hover:text-white'
      }`}
    >
      {icon}
      <span>{label}</span>
    </Link>
  );

  if (isLoading && data === undefined) {
    return (
      <aside className="w-64 hidden lg:block shrink-0 border-r border-zinc-200 dark:border-zinc-800 pr-6 pt-6 min-h-[calc(100vh-4rem)]">
        <div className="space-y-6 sticky top-22">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-24"></div>
            <div className="space-y-2">
              <div className="h-8 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
              <div className="h-8 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
              <div className="h-8 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
            </div>
          </div>
        </div>
      </aside>
    );
  }

  return (
    <aside className="w-64 hidden lg:block shrink-0 border-r border-zinc-200 dark:border-zinc-800 pr-6 pt-6 min-h-[calc(100vh-4rem)]">
      <div className="space-y-6 sticky top-22">

        {/* Navigasi Utama */}
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
              <span>Kategori</span>
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

        {/* Panel Moderasi */}
        {isModerator && (
          <div>
            <h3 className="px-3 text-[10px] font-bold tracking-wider text-amber-500 dark:text-amber-400 uppercase font-sans">
              Panel Moderasi
            </h3>
            <nav className="mt-2.5 space-y-1">
              {modNavItem('/moderation/categories', <List className="h-4 w-4" />, 'List Categories')}
              {modNavItem('/moderation/tags', <Tags className="h-4 w-4" />, 'List Tags')}
              {modNavItem('/moderation/reports', <Flag className="h-4 w-4" />, 'Users Report')}
              {modNavItem('/moderation/logs', <ScrollText className="h-4 w-4" />, 'Moderation Logs')}
            </nav>
          </div>
        )}

        {/* Akses & Keanggotaan */}
        <div>
          <h3 className="px-3 text-[10px] font-bold tracking-wider text-zinc-400 dark:text-zinc-500 uppercase font-sans">
            Akses & Keanggotaan
          </h3>
          <nav className="mt-2.5 space-y-1">
            {isLoggedIn ? (
              <button
                onClick={() => logoutMutation.mutate()}
                disabled={logoutMutation.isPending}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-sm font-medium rounded-lg transition-all cursor-pointer text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <LogOut className="h-4 w-4" />
                <span>{logoutMutation.isPending ? 'Logging out...' : 'Keluar (Logout)'}</span>
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
                  <span>Masuk</span>
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
                  <span>Daftar</span>
                </Link>
              </>
            )}
          </nav>
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