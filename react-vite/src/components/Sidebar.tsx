import { Globe, Tag, User, HelpCircle, Code, Award, Landmark, LogIn, UserPlus } from 'lucide-react';
import { ViewType, User as UserType } from '../types';

interface SidebarProps {
  currentView: ViewType;
  setView: (view: ViewType) => void;
  currentUser: UserType;
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
  const handleNavClick = (view: ViewType) => {
    setView(view);
    if (view === 'home') {
      setSelectedTag(null);
    }
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
            <button
              id="sidebar-home-link"
              onClick={() => handleNavClick('home')}
              className={`w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg transition-all cursor-pointer ${
                currentView === 'home' && !selectedTag
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
            </button>

            <button
              id="sidebar-tag-link"
              onClick={() => {
                setView('home');
                setSelectedTag('react'); // Just as a sample active tagged navigation state
              }}
              className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm font-medium rounded-lg transition-all cursor-pointer ${
                currentView === 'home' && selectedTag === 'react'
                  ? 'bg-brand-blue/10 dark:bg-brand-blue/20 text-brand-blue font-semibold'
                  : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              <Tag className="h-4 w-4" />
              <span>Tag Terpopuler (React)</span>
            </button>

            <button
              id="sidebar-ask-link"
              onClick={() => handleNavClick('ask-question')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm font-medium rounded-lg transition-all cursor-pointer ${
                currentView === 'ask-question'
                  ? 'bg-brand-blue/10 dark:bg-brand-blue/20 text-brand-blue font-semibold'
                  : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              <HelpCircle className="h-4 w-4" />
              <span>Tanya Masalah</span>
            </button>

            <button
              id="sidebar-profile-link"
              onClick={() => handleNavClick('profile')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm font-medium rounded-lg transition-all cursor-pointer ${
                currentView === 'profile'
                  ? 'bg-brand-blue/10 dark:bg-brand-blue/20 text-brand-blue font-semibold'
                  : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              <User className="h-4 w-4" />
              <span>Profil Pengguna</span>
            </button>
          </nav>
        </div>

        {/* Authentication Section */}
        <div>
          <h3 className="px-3 text-[10px] font-bold tracking-wider text-zinc-400 dark:text-zinc-500 uppercase font-sans">
            Akses & Keanggotaan
          </h3>
          <nav className="mt-2.5 space-y-1">
            <button
              id="sidebar-login-link"
              onClick={() => handleNavClick('login')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm font-medium rounded-lg transition-all cursor-pointer ${
                currentView === 'login'
                  ? 'bg-brand-blue/10 dark:bg-brand-blue/20 text-brand-blue font-semibold'
                  : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              <LogIn className="h-4 w-4" />
              <span>Masuk (Login)</span>
            </button>

            <button
              id="sidebar-register-link"
              onClick={() => handleNavClick('register')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm font-medium rounded-lg transition-all cursor-pointer ${
                currentView === 'register'
                  ? 'bg-brand-blue/10 dark:bg-brand-blue/20 text-brand-blue font-semibold'
                  : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              <UserPlus className="h-4 w-4" />
              <span>Daftar / Registrasi</span>
            </button>
          </nav>
        </div>

        {/* Info Box / Developer Guild card */}
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
            <span>Current user: {currentUser.username}</span>
          </div>
        </div>

        {/* Small footer in sidebar */}
        <div className="px-3 text-[10px] text-zinc-400 dark:text-zinc-500 space-y-1">
          <p>© 2026 Flexicord Inc.</p>
          <p>Didesain ramah mata demi kenyamanan ngoding tanpa lelah.</p>
        </div>
      </div>
    </aside>
  );
}
