"use client";

import { Flame, Tag, Trophy, Medal, Award } from 'lucide-react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import Image from 'next/image';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Tag as ApiTag } from '@/app/api/tags/TagType';

// — Types —
interface LeaderboardUser {
  id: string;
  username: string;
  avatar_url: string | null;
  bio: string | null;
  reputation_points: number;
  level: number;
}

interface RightSidebarProps {
  popularTags?: { name: string; count: number }[];
  selectedTag?: string | null;
  onTagClick?: (tag: string | null) => void;
}

// — Fetch functions —
const fetchLeaderboard = async (): Promise<LeaderboardUser[]> => {
  const { data } = await axios.get<LeaderboardUser[]>(
    'https://pegaduanmasyarakat.alwaysdata.net/api/leaderboard'
  );
  return data;
};

const fetchTags = async (): Promise<ApiTag[]> => {
  const { data } = await axios.get<{ data: ApiTag[] }>('/api/tags');
  return data.data || [];
};

// — Rank badge —
const RankBadge = ({ rank }: { rank: number }) => {
  if (rank === 1)
    return <Trophy className="h-4 w-4 text-yellow-400 shrink-0" />;
 
  return (
    <span className="text-[11px] font-bold text-zinc-400 w-4 text-center shrink-0">
      {rank}
    </span>
  );
};

// — Avatar —
const UserAvatar = ({ user }: { user: LeaderboardUser }) => {
  const validUrl =
    user.avatar_url &&
    user.avatar_url !== 'string' &&
    (user.avatar_url.startsWith('http') ||
      user.avatar_url.startsWith('avatars/'));

  const src = validUrl
    ? user.avatar_url!.startsWith('http')
      ? user.avatar_url!
      : `https://pegaduanmasyarakat.alwaysdata.net/storage/${user.avatar_url}`
    : null;

  if (src) {
    return (
      <img
        src={src}
        alt={user.username}
        className="h-7 w-7 rounded-full object-cover ring-1 ring-zinc-200 dark:ring-zinc-700 shrink-0"
      />
    );
  }

  // fallback initials
  const initials = user.username.slice(0, 2).toUpperCase();
  return (
    <div className="h-7 w-7 rounded-full bg-brand-blue/10 dark:bg-brand-blue/20 flex items-center justify-center shrink-0 ring-1 ring-zinc-200 dark:ring-zinc-700">
      <span className="text-[10px] font-bold text-brand-blue">{initials}</span>
    </div>
  );
};

// — Skeleton —
const LeaderboardSkeleton = () => (
  <div className="space-y-2.5">
    {Array.from({ length: 5 }).map((_, i) => (
      <div key={i} className="flex items-center gap-2.5 animate-pulse">
        <div className="h-4 w-4 rounded bg-zinc-200 dark:bg-zinc-800 shrink-0" />
        <div className="h-7 w-7 rounded-full bg-zinc-200 dark:bg-zinc-800 shrink-0" />
        <div className="flex-1 space-y-1">
          <div className="h-3 bg-zinc-200 dark:bg-zinc-800 rounded w-24" />
          <div className="h-2.5 bg-zinc-200 dark:bg-zinc-800 rounded w-14" />
        </div>
        <div className="h-3 w-10 bg-zinc-200 dark:bg-zinc-800 rounded" />
      </div>
    ))}
  </div>
);

const TagsSkeleton = () => (
  <div className="flex flex-wrap gap-2 animate-pulse">
    {Array.from({ length: 10 }).map((_, i) => (
      <div key={i} className="h-7 w-16 bg-zinc-200 dark:bg-zinc-800 rounded-md" />
    ))}
  </div>
);

export default function RightSidebar({}: RightSidebarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const activeTagSlug = pathname === '/tag' ? searchParams.get('slug') : null;

  const {
    data: leaderboard,
    isLoading: isLoadingLeaderboard,
    isError: isErrorLeaderboard,
  } = useQuery({
    queryKey: ['leaderboard'],
    queryFn: fetchLeaderboard,
    staleTime: 60 * 1000,      
    gcTime: 2 * 60 * 1000,     
    refetchOnWindowFocus: false,
    retry: false,
  });

  const {
    data: tags,
    isLoading: isLoadingTags,
    isError: isErrorTags,
  } = useQuery({
    queryKey: ['tags'],
    queryFn: fetchTags,
    staleTime: 5 * 60 * 1000,      
    gcTime: 10 * 60 * 1000,     
    refetchOnWindowFocus: false,
  });

  // Sort tags by usage_count desc and take top 15
  const sortedTags = tags ? [...tags].sort((a, b) => b.usage_count - a.usage_count) : [];
  const popularTagsToShow = sortedTags.slice(0, 15);

  const handleTagClick = (tagSlug: string) => {
    if (activeTagSlug === tagSlug) {
      router.push('/');
    } else {
      router.push(`/tag?slug=${tagSlug}`);
    }
  };

  return (
    <aside className="w-80 hidden xl:block shrink-0 pl-6 pt-6">
      <div className="space-y-6 sticky top-22">

        {/* Leaderboard */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 px-1">
            <Flame className="h-4 w-4 text-brand-blue animate-pulse" />
            <h4 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">
              Leaderboard
            </h4>
          </div>

          {isLoadingLeaderboard && <LeaderboardSkeleton />}

          {isErrorLeaderboard && (
            <p className="text-xs text-red-400 px-1">
              Gagal memuat leaderboard.
            </p>
          )}

          {leaderboard && (
            <div className="space-y-1.5">
              {leaderboard.map((user, index) => (
                <Link
                  key={user.id}
                  href={`/profile/${user.username}`}
                  className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors group"
                >
                  {/* rank */}
                  <RankBadge rank={index + 1} />

                  {/* avatar */}
                  <UserAvatar user={user} />

                  {/* info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 truncate group-hover:text-brand-blue transition-colors">
                      {user.username}
                    </p>
                    <p className="text-[10px] text-zinc-400 dark:text-zinc-500">
                      Level {user.level}
                    </p>
                  </div>

                  {/* points */}
                  <span className="text-[11px] font-bold text-brand-blue tabular-nums shrink-0">
                    {user.reputation_points.toLocaleString("en-US")} pts
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Popular Tags */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 px-1">
            <Tag className="h-4 w-4 text-zinc-500" />
            <h4 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">
              Popular Tags
            </h4>
          </div>

          {isLoadingTags && <TagsSkeleton />}

          {isErrorTags && (
            <p className="text-xs text-red-400 px-1">
              Gagal memuat popular tags.
            </p>
          )}

          {tags && (
            <div className="flex flex-wrap gap-2">
              {popularTagsToShow.map((tag) => {
                const isActive = activeTagSlug === tag.slug;
                return (
                  <button
                    key={tag.id}
                    onClick={() => handleTagClick(tag.slug)}
                    className={`text-xs px-2.5 py-1.5 rounded-md font-mono transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs hover:shadow-xs active:scale-95 ${
                      isActive
                        ? 'bg-brand-blue text-white ring-1 ring-brand-blue font-semibold'
                        : 'bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border border-zinc-200/50 dark:border-zinc-800/80'
                    }`}
                  >
                    <span>#{tag.name}</span>
                    <span
                      suppressHydrationWarning
                      className={`text-[10px] pl-1 font-sans ${
                        isActive
                          ? 'text-blue-100'
                          : 'text-zinc-400 dark:text-zinc-500'
                      }`}
                    >
                      ({tag.usage_count.toLocaleString()})
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {activeTagSlug && (
            <button
              onClick={() => router.push('/')}
              className="text-xs text-brand-blue hover:text-brand-blue-hover font-medium underline px-1 cursor-pointer hover:no-underline transition-all block mt-1"
            >
              Hapus filter tag
            </button>
          )}
        </div>

      </div>
    </aside>
  );
}