"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { 
  Bell, 
  CheckCheck, 
  Heart, 
  MessageSquare, 
  Bookmark, 
  ArrowLeft, 
  Loader2, 
  Inbox, 
  Info,
  Calendar,
  UserPlus,
  CheckCircle,
  HelpCircle,
  Clock
} from "lucide-react";
import { useApp } from "@/context/AppContext";

interface Actor {
  id: string;
  username: string;
  email: string;
  avatar_url: string | null;
  bio: string | null;
  reputation_points: number;
  level: number;
  is_banned: number;
  created_at: string;
  updated_at: string;
}

interface Notification {
  id: string;
  user_id: string;
  actor_id?: string;
  type: string;
  reference_id: string | null;
  reference_type: string | null;
  is_read: number;
  created_at: string;
  updated_at?: string;
  actor?: Actor;
  // Fallbacks
  data?: any;
  read_at?: string | null;
}

interface PaginationLink {
  url: string | null;
  label: string;
  active: boolean;
}

interface NotificationsPaginatedData {
  current_page: number;
  data: Notification[];
  first_page_url: string | null;
  from: number | null;
  last_page: number;
  last_page_url: string | null;
  links: PaginationLink[];
  next_page_url: string | null;
  path: string | null;
  per_page: number;
  prev_page_url: string | null;
  to: number | null;
  total: number;
}

interface ApiResponse {
  success: boolean;
  status: string;
  data: NotificationsPaginatedData;
}

export default function NotificationsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { currentUser, showNotification } = useApp();
  const [page, setPage] = useState(1);

  // Fetch notifications with react-query
  const { data, isLoading, isError, refetch } = useQuery<ApiResponse>({
    queryKey: ["notifications", page],
    queryFn: async () => {
      const res = await fetch(`/api/notifications?page=${page}`);
      if (!res.ok) {
        if (res.status === 401) {
          throw new Error("Unauthorized");
        }
        throw new Error("Failed to fetch notifications");
      }
      return res.json();
    },
    enabled: !!currentUser,
  });

  // Mark all as read mutation
  const markAllReadMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/notifications/read-all", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!res.ok) throw new Error("Gagal menandai semua notifikasi");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      showNotification("Semua notifikasi ditandai sebagai terbaca!", "success");
    },
    onError: (error: any) => {
      console.error(error);
      showNotification("Gagal menandai semua notifikasi.", "info");
    },
  });

  const getNotificationLink = (notification: Notification): string | null => {
    // If follow type, link to follower's profile
    if (notification.type === "follow" && notification.actor?.username) {
      return `/profile/${notification.actor.username}`;
    }
    // If it has reference_id, link to the post
    if (notification.reference_id) {
      return `/posts/${notification.reference_id}`;
    }
    return null;
  };

  const getNotificationMessage = (notification: Notification): string => {
    const type = notification.type;

    switch (type) {
      case "follow":
        return "mulai mengikuti Anda.";
      case "answer_accepted":
        return "menyetujui jawaban Anda sebagai solusi terbaik.";
      case "new_post":
      case "post":
        return "membagikan postingan baru.";
      case "new_comment":
      case "comment":
        return "memberikan komentar pada postingan Anda.";
      case "new_answer":
      case "answer":
        return "menjawab pertanyaan Anda.";
      case "like":
      case "post_liked":
        return "menyukai postingan Anda.";
      case "bookmark":
      case "post_bookmarked":
        return "menyimpan postingan Anda ke bookmark.";
      default:
        return `melakukan interaksi (${type}) pada akun Anda.`;
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "follow":
        return (
          <div className="p-1 rounded-full bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400 border border-white dark:border-zinc-950 shadow-xs shrink-0">
            <UserPlus className="h-3 w-3" />
          </div>
        );
      case "answer_accepted":
        return (
          <div className="p-1 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 border border-white dark:border-zinc-950 shadow-xs shrink-0">
            <CheckCircle className="h-3 w-3" />
          </div>
        );
      case "new_comment":
      case "comment":
        return (
          <div className="p-1 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 border border-white dark:border-zinc-950 shadow-xs shrink-0">
            <MessageSquare className="h-3 w-3" />
          </div>
        );
      case "new_answer":
      case "answer":
        return (
          <div className="p-1 rounded-full bg-sky-50 dark:bg-sky-950 text-sky-600 dark:text-sky-400 border border-white dark:border-zinc-950 shadow-xs shrink-0">
            <HelpCircle className="h-3 w-3" />
          </div>
        );
      case "like":
      case "post_liked":
        return (
          <div className="p-1 rounded-full bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-400 border border-white dark:border-zinc-950 shadow-xs shrink-0">
            <Heart className="h-3 w-3 fill-current" />
          </div>
        );
      case "bookmark":
      case "post_bookmarked":
        return (
          <div className="p-1 rounded-full bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 border border-white dark:border-zinc-950 shadow-xs shrink-0">
            <Bookmark className="h-3 w-3 fill-current" />
          </div>
        );
      default:
        return (
          <div className="p-1 rounded-full bg-zinc-150 dark:bg-zinc-800 text-zinc-650 dark:text-zinc-350 border border-white dark:border-zinc-950 shadow-xs shrink-0">
            <Bell className="h-3 w-3" />
          </div>
        );
    }
  };

  const getAvatarSrc = (avatarUrl: string | null | undefined) => {
    if (!avatarUrl) return null;
    if (avatarUrl.startsWith("http")) return avatarUrl;
    return `https://pegaduanmasyarakat.alwaysdata.net/storage/${avatarUrl}`;
  };

  const formatDate = (dateStr: string): string => {
    try {
      const date = new Date(dateStr.replace(/-/g, "/"));
      return date.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });
    } catch {
      return dateStr;
    }
  };

  // Render loading state
  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto space-y-6 py-4">
        <div className="flex items-center gap-4">
          <div className="h-8 w-8 bg-zinc-200 dark:bg-zinc-800 animate-pulse rounded-lg" />
          <div className="space-y-2 flex-1">
            <div className="h-6 bg-zinc-200 dark:bg-zinc-800 animate-pulse rounded w-1/4" />
            <div className="h-4 bg-zinc-200 dark:bg-zinc-800 animate-pulse rounded w-1/3" />
          </div>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((n) => (
            <div key={n} className="p-5 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 rounded-xl flex gap-4 animate-pulse">
              <div className="h-10 w-10 bg-zinc-200 dark:bg-zinc-800 rounded-xl" />
              <div className="space-y-2 flex-1">
                <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-3/4" />
                <div className="h-3 bg-zinc-200 dark:bg-zinc-800 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Handle errors or unauthorized state
  if (isError || !currentUser) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-6">
        <div className="mx-auto w-12 h-12 rounded-full bg-red-100 dark:bg-red-950/30 flex items-center justify-center text-red-500">
          <Info className="h-6 w-6" />
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
            {!currentUser ? "Silakan Login Terlebih Dahulu" : "Gagal Memuat Notifikasi"}
          </h3>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {!currentUser 
              ? "Anda harus masuk ke akun Anda terlebih dahulu untuk melihat notifikasi." 
              : "Terjadi kesalahan saat mengambil notifikasi Anda dari server."}
          </p>
        </div>
        {!currentUser ? (
          <button
            onClick={() => router.push("/login")}
            className="bg-brand-blue hover:bg-brand-blue-hover text-white text-sm font-semibold py-2.5 px-6 rounded-lg shadow-sm transition-all"
          >
            Masuk ke Akun
          </button>
        ) : (
          <button
            onClick={() => refetch()}
            className="bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 text-sm font-semibold py-2 px-4 rounded-lg transition-colors"
          >
            Coba Lagi
          </button>
        )}
      </div>
    );
  }

  const paginatedData = data?.data;
  const notificationsList = paginatedData?.data || [];
  const totalNotifications = paginatedData?.total || 0;
  
  // Real API check for read state
  const hasUnread = notificationsList.some((n) => n.is_read === 0 || (n.read_at === null && n.is_read === undefined));

  return (
    <div className="max-w-3xl mx-auto space-y-6 py-2">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-500 dark:text-zinc-400 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors"
            title="Kembali"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-white tracking-tight flex items-center gap-2">
              Notifikasi
              {totalNotifications > 0 && (
                <span className="text-xs bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 px-2 py-0.5 rounded-full font-normal">
                  {totalNotifications}
                </span>
              )}
            </h1>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              Lihat aktivitas terbaru mengenai postingan dan interaksi Anda.
            </p>
          </div>
        </div>

        {totalNotifications > 0 && hasUnread && (
          <button
            onClick={() => markAllReadMutation.mutate()}
            disabled={markAllReadMutation.isPending}
            className="flex items-center justify-center gap-2 bg-brand-blue hover:bg-brand-blue-hover disabled:bg-brand-blue/60 text-white text-xs font-semibold py-2 px-4 rounded-lg shadow-sm transition-all cursor-pointer"
          >
            {markAllReadMutation.isPending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <CheckCheck className="h-3.5 w-3.5" />
            )}
            Tandai Semua Terbaca
          </button>
        )}
      </div>

      {/* Notifications List */}
      {notificationsList.length > 0 ? (
        <div className="space-y-3">
          {notificationsList.map((notification) => {
            const hasLink = !!getNotificationLink(notification);
            const isUnread = notification.is_read === 0 || (notification.read_at === null && notification.is_read === undefined);
            const actor = notification.actor;
            const avatarSrc = getAvatarSrc(actor?.avatar_url);

            return (
              <div
                key={notification.id}
                onClick={() => {
                  const link = getNotificationLink(notification);
                  if (link) {
                    router.push(link);
                  }
                }}
                className={`group flex items-start gap-4.5 p-5 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl transition-all relative ${
                  hasLink ? "cursor-pointer hover:border-brand-blue" : ""
                } ${isUnread ? "border-l-4 border-l-brand-blue bg-brand-blue/1 dark:bg-brand-blue/3" : ""}`}
              >
                {/* Notification Icon Badge overlay on top of actor avatar */}
                <div className="relative shrink-0">
                  <div
                    onClick={(e) => {
                      if (actor?.username) {
                        e.stopPropagation();
                        router.push(`/profile/${actor.username}`);
                      }
                    }}
                    className="h-10 w-10 rounded-full border border-zinc-150 dark:border-zinc-800 overflow-hidden cursor-pointer hover:opacity-90 active:scale-95 transition-all"
                  >
                    {avatarSrc ? (
                      <img
                        src={avatarSrc}
                        alt={actor?.username || "Actor"}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full bg-brand-blue/10 flex items-center justify-center text-brand-blue text-sm font-bold uppercase">
                        {actor?.username ? actor.username.charAt(0) : "?"}
                      </div>
                    )}
                  </div>
                  {/* Miniature type icon badge */}
                  <div className="absolute -bottom-1 -right-1">
                    {getNotificationIcon(notification.type)}
                  </div>
                </div>

                <div className="flex-1 space-y-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div className="text-sm text-zinc-600 dark:text-zinc-300 leading-snug">
                      <span 
                        onClick={(e) => {
                          if (actor?.username) {
                            e.stopPropagation();
                            router.push(`/profile/${actor.username}`);
                          }
                        }}
                        className="font-bold text-zinc-900 dark:text-white hover:text-brand-blue hover:underline cursor-pointer transition-colors"
                      >
                        {actor?.username || "Seseorang"}
                      </span>{" "}
                      <span>{getNotificationMessage(notification)}</span>
                    </div>

                    {/* Unread indicator dot */}
                    {isUnread && (
                      <span className="h-2 w-2 rounded-full bg-brand-blue shrink-0 mt-1.5" />
                    )}
                  </div>

                  {notification.reference_type && notification.reference_id && (
                    <div className="flex items-center gap-1.5 text-[11px] text-brand-blue/90 dark:text-brand-blue/70 font-semibold font-mono">
                      <span>Ref: {notification.reference_type}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-1.5 text-[11px] text-zinc-400 dark:text-zinc-500 font-medium pt-1">
                    <Clock className="h-3 w-3" />
                    <span>{formatDate(notification.created_at)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <div className="p-12 text-center rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 max-w-xl mx-auto space-y-4">
          <div className="mx-auto w-12 h-12 rounded-full bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center">
            <Inbox className="h-6 w-6 text-zinc-450 dark:text-zinc-500" />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-base font-bold text-zinc-900 dark:text-white">
              Tidak ada notifikasi baru
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto leading-relaxed">
              Anda belum menerima pemberitahuan apa pun saat ini. Kami akan memberi tahu Anda di sini saat ada aktivitas!
            </p>
          </div>
        </div>
      )}

      {/* Pagination */}
      {!isLoading && paginatedData && paginatedData.last_page > 1 && (
        <div className="flex items-center justify-center gap-1.5 pt-4">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3.5 py-2 text-xs font-semibold rounded-lg border border-zinc-200 dark:border-zinc-800 disabled:opacity-40 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors"
          >
            Sebelumnya
          </button>

          {Array.from({ length: paginatedData.last_page }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all ${
                page === p
                  ? "bg-brand-blue text-white border-brand-blue"
                  : "border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 text-zinc-650 dark:text-zinc-350"
              }`}
            >
              {p}
            </button>
          ))}

          <button
            onClick={() => setPage((p) => Math.min(paginatedData.last_page, p + 1))}
            disabled={page === paginatedData.last_page}
            className="px-3.5 py-2 text-xs font-semibold rounded-lg border border-zinc-200 dark:border-zinc-800 disabled:opacity-40 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors"
          >
            Berikutnya
          </button>
        </div>
      )}
    </div>
  );
}
