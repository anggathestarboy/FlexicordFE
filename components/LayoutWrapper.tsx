"use client";

import React from 'react';
import { usePathname } from 'next/navigation';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import RightSidebar from './RightSidebar';
import { useApp } from '@/context/AppContext';
import { POPULAR_TAGS } from '@/lib/data';
import { Sparkles } from 'lucide-react';

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { 
    currentUser, 
    searchQuery, 
    setSearchQuery, 
    notification,
    selectedTag,
    setSelectedTag
  } = useApp();

  const isAuthPage = pathname === '/login' || pathname === '/register';
  const isQuestionDetailPage = pathname.startsWith('/posts/');
  const isHomePage = pathname === '/' || pathname === '/homepage';
  const isTagPage = pathname.startsWith('/tag');
  
  const showRightSidebar = isHomePage || isQuestionDetailPage || isTagPage;

  
  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-zinc-950 font-sans antialiased text-zinc-900 dark:text-zinc-100 transition-colors duration-200">
      {/* Dynamic Float Notification Toast Alert */}
      {notification && (
        <div id="toast-notification" className="fixed bottom-6 right-6 z-50 p-4 rounded-xl border border-emerald-350 dark:border-emerald-900/50 bg-emerald-50 dark:bg-zinc-900 text-emerald-800 dark:text-emerald-400 text-xs sm:text-sm shadow-xl flex items-center gap-2.5 max-w-sm sm:max-w-md animate-slide-in">
          <Sparkles className="h-5 w-5 text-emerald-550 shrink-0" />
          <p className="font-semibold">{notification.message}</p>
        </div>
      )}

      <Navbar
        currentUser={currentUser}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        currentView={pathname === '/' ? 'home' : (pathname.substring(1) as any)}
        setView={() => {}} // This will be handled by Next.js navigation
        onAskQuestionClick={() => {}} // Handled by Link in Navbar
        onLogout={() => {}} // Handled in Navbar
      />

      <div className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {isAuthPage ? (
          <div className="max-w-5xl mx-auto py-2">
            {children}
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-6 sm:gap-8">
            <Sidebar
              currentView={pathname === '/' ? 'home' : (pathname.substring(1) as any)}
              setView={() => {}} // Handled by Next.js navigation
              currentUser={currentUser}
              selectedTag={selectedTag}
              setSelectedTag={setSelectedTag}
            />

            <main className="flex-1 min-w-0">
              {children}
            </main>

            {showRightSidebar && (
              <RightSidebar />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
