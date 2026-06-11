"use client";

import { Badge, Post, Role, UserDetail, UserDetailResponse, Comment, Like, LikeTargetType } from "@/app/api/profile/[username]/ProfileType";
import { Heart, MessageSquare, FileText, Clock, Filter, Inbox, Bookmark as BookmarkIcon, Search } from "lucide-react";
import { useEffect, useState } from "react";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatDateTime(raw: string): string {
  return new Date(raw).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getInitials(username: string): string {
  return username.slice(0, 2).toUpperCase();
}

function levelLabel(level: number): string {
  const labels: Record<number, string> = { 1: "Newbie", 2: "Member", 3: "Regular", 4: "Veteran", 5: "Legend" };
  return labels[level] ?? `Level ${level}`;
}

const TIER_CONFIG: Record<string, { bg: string; text: string; border: string; icon: string }> = {
  gold:     { bg: "#FEF3C7", text: "#92400E", border: "#F59E0B", icon: "🥇" },
  silver:   { bg: "#F1F5F9", text: "#475569", border: "#94A3B8", icon: "🥈" },
  bronze:   { bg: "#FDF4EF", text: "#9A3412", border: "#C2765A", icon: "🥉" },
  platinum: { bg: "#EFF6FF", text: "#1E40AF", border: "#60A5FA", icon: "💎" },
};

const ROLE_CONFIG: Record<string, { bg: string; text: string }> = {
  admin:     { bg: "#EDE9FE", text: "#5B21B6" },
  moderator: { bg: "#DCFCE7", text: "#166534" },
  user:      { bg: "#F1F5F9", text: "#475569" },
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function AvatarBlock({ user }: { user: UserDetail }) {
  const getAvatarUrl = () => {
    if (!user.avatar_url || user.avatar_url === "string") {
      return null;
    }
    
    if (user.avatar_url.startsWith("avatars/")) {
      return `https://pegaduanmasyarakat.alwaysdata.net/storage/${user.avatar_url}`;
    }
    
    if (user.avatar_url.startsWith("http")) {
      return user.avatar_url;
    }
    
    return null;
  };

  const avatarUrl = getAvatarUrl();

  return (
    <div style={{ position: "relative", width: 88, height: 88, flexShrink: 0 }}>
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt={user.username}
          style={{ width: 88, height: 88, borderRadius: "50%", objectFit: "cover", border: "3px solid #E2E8F0" }}
          onError={(e) => {
            e.currentTarget.style.display = 'none';
            if (e.currentTarget.nextSibling) {
              (e.currentTarget.nextSibling as HTMLElement).style.display = 'flex';
            }
          }}
        />
      ) : null}
      <div
        style={{
          width: 88, height: 88, borderRadius: "50%",
          background: "linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)",
          display: avatarUrl ? 'none' : 'flex',
          alignItems: "center", justifyContent: "center",
          fontSize: 28, fontWeight: 700, color: "#fff",
          border: "3px solid #E2E8F0", letterSpacing: 1,
        }}
      >
        {getInitials(user.username)}
      </div>
      {user.is_banned === 1 && (
        <span
          title="Akun dibanned"
          style={{
            position: "absolute", bottom: 2, right: 2,
            background: "#EF4444", borderRadius: "50%",
            width: 20, height: 20, display: "flex",
            alignItems: "center", justifyContent: "center",
            fontSize: 11, border: "2px solid #fff",
          }}
        >🚫</span>
      )}
    </div>
  );
}

function StatPill({ label, value }: { label: string; value: number | string }) {
  return (
    <div style={{ textAlign: "center", minWidth: 64 }}>
      <div style={{ fontSize: 20, fontWeight: 700, color: "#1E293B", lineHeight: 1.1 }}>{value}</div>
      <div style={{ fontSize: 11, color: "#94A3B8", marginTop: 2, textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</div>
    </div>
  );
}

function RoleBadge({ role }: { role: Role }) {
  const cfg = ROLE_CONFIG[role.name] ?? { bg: "#F1F5F9", text: "#475569" };
  return (
    <span style={{
      padding: "2px 10px", borderRadius: 20,
      background: cfg.bg, color: cfg.text,
      fontSize: 12, fontWeight: 600, textTransform: "capitalize",
    }}>
      {role.name}
    </span>
  );
}

function BadgeCard({ badge }: { badge: Badge }) {
  const cfg = TIER_CONFIG[badge.tier] ?? TIER_CONFIG.bronze;
  return (
    <div style={{
      border: `1.5px solid ${cfg.border}`,
      background: cfg.bg,
      borderRadius: 10,
      padding: "10px 14px",
      display: "flex", alignItems: "flex-start", gap: 10,
      minWidth: 0,
    }}>
      <span style={{ fontSize: 22, lineHeight: 1, flexShrink: 0 }}>{cfg.icon}</span>
      <div>
        <div style={{ fontWeight: 700, fontSize: 13, color: cfg.text }}>{badge.name}</div>
        <div style={{ fontSize: 11, color: "#64748B", marginTop: 2, lineHeight: 1.4 }}>{badge.description}</div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: Post["status"] }) {
  const map: Record<Post["status"], { label: string; color: string }> = {
    open: { label: "Terbuka", color: "#2563eb" },
    answered: { label: "Terjawab", color: "#16a34a" },
    closed: { label: "Ditutup", color: "#6b7280" },
  };
  const { label, color } = map[status] ?? map.open;
  return (
    <span
      style={{
        display: "inline-block",
        padding: "2px 10px",
        borderRadius: "999px",
        fontSize: "11px",
        fontWeight: 600,
        letterSpacing: "0.04em",
        color: "#fff",
        background: color,
        textTransform: "uppercase",
      }}
    >
      {label}
    </span>
  );
}

// PostCard component
function PostCard({ 
  post, 
  currentUserId, 
  onDelete 
}: { 
  post: Post; 
  currentUserId?: string;
  onDelete?: (postId: string) => void;
}) {
  const score = post.votes_count;
  const scoreColor = score > 0 ? "#16A34A" : score < 0 ? "#DC2626" : "#94A3B8";
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  
  const isOwnPost = currentUserId && post.user_id === currentUserId;

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      onDelete?.(post.id);
    } catch (error) {
      console.error("Gagal menghapus postingan:", error);
      alert("Gagal menghapus postingan. Silakan coba lagi.");
    } finally {
      setIsDeleting(false);
      setShowConfirm(false);
    }
  };

  return (
    <>
      <div style={{
        borderRadius: 10,
        border: "1px solid #E2E8F0",
        background: "#FAFAFA",
        padding: "14px 16px",
        display: "flex", gap: 14, alignItems: "flex-start",
        transition: "box-shadow .15s",
        position: "relative",
      }}
        onMouseEnter={e => (e.currentTarget.style.boxShadow = "0 2px 12px rgba(0,0,0,.08)")}
        onMouseLeave={e => (e.currentTarget.style.boxShadow = "none")}
      >
        <div style={{
          flexShrink: 0, width: 40, height: 40, borderRadius: 8,
          background: "#F1F5F9", display: "flex", alignItems: "center",
          justifyContent: "center", fontWeight: 700, fontSize: 15, color: scoreColor,
        }}>
          {score > 0 ? `+${score}` : score}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 600, fontSize: 14, color: "#1E293B", marginBottom: 4, lineHeight: 1.4 }}>
            {post.title}
            {post.is_answered === 1 && (
              <span style={{ marginLeft: 8, background: "#DCFCE7", color: "#166534", fontSize: 11, fontWeight: 600, padding: "1px 8px", borderRadius: 20 }}>
                ✓ Terjawab
              </span>
            )}
          </div>

          <div style={{ fontSize: 12, color: "#64748B", lineHeight: 1.5, marginBottom: 8,
            overflow: "hidden", display: "-webkit-box",
            WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as const }}>
            {post.body}
          </div>

          <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
            <span style={{
              fontSize: 11, padding: "2px 8px", borderRadius: 20,
              background: "#EEF2FF", color: "#4338CA", fontWeight: 500,
            }}>
              {post.category.name}
            </span>

            {post.tags && post.tags.map(tag => (
              <span key={tag.id} style={{
                fontSize: 11, padding: "2px 8px", borderRadius: 20,
                background: "#FEE2E2", color: "#991B1B", fontWeight: 500,
              }}>
                {tag.name}
              </span>
            ))}

            <span style={{ marginLeft: "auto", fontSize: 11, color: "#94A3B8" }}>
              {formatDate(post.created_at)}
            </span>
          </div>

          <div style={{ display: "flex", gap: 14, marginTop: 8 }}>
            {[
              { icon: "👁", val: post.view_count, label: "views" },
              { icon: "💬", val: post.comments_count || 0, label: "komentar" },
              { icon: "❤️", val: post.likes_count || 0, label: "suka" },
              { icon: "🔖", val: post.bookmarks_count || 0, label: "simpan" },
            ].map(({ icon, val, label }) => (
              <span key={label} style={{ fontSize: 11, color: "#94A3B8", display: "flex", alignItems: "center", gap: 3 }}>
                {icon} {val}
              </span>
            ))}
          </div>
        </div>

        {isOwnPost && (
          <button
            onClick={() => setShowConfirm(true)}
            disabled={isDeleting}
            style={{
              position: "absolute",
              top: 12,
              right: 12,
              background: "#FEE2E2",
              border: "none",
              borderRadius: 6,
              padding: "4px 8px",
              cursor: isDeleting ? "not-allowed" : "pointer",
              fontSize: 12,
              color: "#DC2626",
              fontWeight: 500,
              opacity: isDeleting ? 0.5 : 0.7,
              transition: "opacity 0.15s",
            }}
          >
            {isDeleting ? "Menghapus..." : "🗑️ Hapus"}
          </button>
        )}
      </div>

      {showConfirm && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0,0,0,0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
        }} onClick={() => setShowConfirm(false)}>
          <div style={{
            background: "#fff",
            borderRadius: 12,
            padding: 24,
            maxWidth: 400,
            width: "90%",
            textAlign: "center",
          }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ margin: "0 0 12px 0", fontSize: 18, fontWeight: 600 }}>Hapus Postingan?</h3>
            <p style={{ margin: "0 0 20px 0", color: "#64748B", fontSize: 14 }}>
              Apakah Anda yakin ingin menghapus postingan {post.title}? Tindakan ini tidak dapat dibatalkan.
            </p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
              <button
                onClick={() => setShowConfirm(false)}
                style={{
                  padding: "8px 20px",
                  borderRadius: 8,
                  border: "1px solid #E2E8F0",
                  background: "#fff",
                  cursor: "pointer",
                  fontSize: 14,
                }}
              >
                Batal
              </button>
              <button
                onClick={handleDelete}
                style={{
                  padding: "8px 20px",
                  borderRadius: 8,
                  border: "none",
                  background: "#DC2626",
                  color: "#fff",
                  cursor: "pointer",
                  fontSize: 14,
                }}
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// LikeCard component with detailed content (menggunakan data dari API profile)
function LikeCard({ like, index }: { like: Like; index: number }) {
  const [showDetail, setShowDetail] = useState(false);
  
  const getTargetConfig = (type: LikeTargetType) => {
    if (type === "post") {
      return {
        label: "Postingan",
        Icon: FileText,
        bg: "#EEF2FF",
        iconColor: "#6366F1",
        border: "#C7D2FE",
        badgeBg: "#EEF2FF",
        badgeText: "#4338CA",
      };
    }
    return {
      label: "Komentar",
      Icon: MessageSquare,
      bg: "#F0FDF4",
      iconColor: "#22C55E",
      border: "#BBF7D0",
      badgeBg: "#F0FDF4",
      badgeText: "#166534",
    };
  };

  const cfg = getTargetConfig(like.target_type);
  const { Icon } = cfg;
  const detail = like.target_type === "post" ? like.post_detail : like.comment_detail;

  if (!detail) return null;

  return (
    <div
      style={{
        borderRadius: 12,
        border: `1px solid ${cfg.border}`,
        background: "#fff",
        padding: "14px 18px",
        transition: "transform .15s, box-shadow .15s",
        cursor: "pointer",
        animation: `fadeUp .3s ease both`,
        animationDelay: `${index * 50}ms`,
      }}
      onClick={() => setShowDetail(!showDetail)}
      onMouseEnter={e => {
        (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
        (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 16px rgba(0,0,0,.07)";
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
        (e.currentTarget as HTMLElement).style.boxShadow = "none";
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{
          width: 44, height: 44, borderRadius: 10,
          background: cfg.bg,
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0,
        }}>
          <Icon size={20} color={cfg.iconColor} strokeWidth={2} />
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
            <span style={{
              fontSize: 11, fontWeight: 700,
              padding: "2px 9px", borderRadius: 20,
              background: cfg.badgeBg, color: cfg.badgeText,
              letterSpacing: "0.03em",
              textTransform: "capitalize",
            }}>
              {cfg.label}
            </span>
            <span style={{
              fontSize: 11, color: "#64748B",
            }}>
              dari {detail.user?.username || "Unknown User"}
            </span>
          </div>

          <div style={{ fontWeight: 600, fontSize: 13, color: "#1E293B", marginBottom: 4 }}>
            {like.target_type === "post" 
              ? (detail as any).title 
              : (detail as any).post?.title || "Komentar"
            }
          </div>

          <div style={{ fontSize: 12, color: "#64748B", lineHeight: 1.4 }}>
            {like.target_type === "post" 
              ? (detail as any).body?.substring(0, 100) 
              : (detail as any).body
            }
            {(detail as any).body?.length > 100 && "..."}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 8, color: "#94A3B8", fontSize: 11 }}>
            <span>❤️ {formatDateTime(like.created_at)}</span>
          </div>
        </div>

        <Heart
          size={18}
          strokeWidth={0}
          fill="#F43F5E"
          style={{ flexShrink: 0, opacity: 0.85 }}
        />
      </div>

      {/* Detail expanded section */}
      {showDetail && like.target_type === "comment" && (
        <div style={{
          marginTop: 12,
          paddingTop: 12,
          borderTop: "1px solid #E2E8F0",
          background: "#F8FAFC",
          borderRadius: 8,
          padding: 12,
        }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: "#475569", marginBottom: 6 }}>
            Detail Komentar:
          </div>
          <div style={{ fontSize: 13, color: "#1E293B", lineHeight: 1.5 }}>
            {(detail as any).body}
          </div>
          <div style={{ fontSize: 11, color: "#94A3B8", marginTop: 6 }}>
            Pada postingan: {(detail as any).post?.title}
          </div>
        </div>
      )}

      {showDetail && like.target_type === "post" && (
        <div style={{
          marginTop: 12,
          paddingTop: 12,
          borderTop: "1px solid #E2E8F0",
          background: "#F8FAFC",
          borderRadius: 8,
          padding: 12,
        }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: "#475569", marginBottom: 6 }}>
            Detail Postingan:
          </div>
          <div style={{ fontSize: 13, color: "#1E293B", lineHeight: 1.5 }}>
            {(detail as any).body}
          </div>
          <div style={{ fontSize: 11, color: "#94A3B8", marginTop: 6 }}>
            Kategori: {(detail as any).category?.name}
          </div>
        </div>
      )}
    </div>
  );
}

function EmptyState({ label, icon: Icon }: { label: string; icon?: React.ElementType }) {
  return (
    <div style={{
      textAlign: "center",
      padding: "52px 16px",
      border: "1.5px dashed #E2E8F0",
      borderRadius: 14,
      color: "#94A3B8",
    }}>
      {Icon && <Icon size={36} strokeWidth={1.5} style={{ margin: "0 auto 12px", display: "block", opacity: 0.5 }} />}
      <p style={{ margin: 0, fontSize: 14, fontWeight: 500 }}>{label}</p>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function ProfilePage({ username }: { username?: string }) {
  const [data, setData] = useState<UserDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [activeTab, setActiveTab] = useState<"posts" | "badges" | "likes" | "bookmarks">("posts");
  const [currentUserId, setCurrentUserId] = useState<string | undefined>(undefined);
  const [likesFilter, setLikesFilter] = useState<"all" | "post" | "comment">("all");

  // Fetch data dari API profile saja
  const fetchProfileData = async (targetUsername: string) => {
    const response = await fetch(`/api/profile/${targetUsername}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch profile: ${response.status}`);
    }
    const data: UserDetailResponse = await response.json();
    return data;
  };

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        
        // TODO: Ganti dengan logic mendapatkan current user ID dari auth context/session
        setCurrentUserId("33119eac-b64e-40bf-a8b3-81b5a4cd8ddf");
        
        // Gunakan username dari props
        const targetUsername = username || "current-user"; // Ganti dengan logic default yang sesuai
        
        // Fetch data dari API profile saja
        const profileData = await fetchProfileData(targetUsername);
        
        setData(profileData);
        setIsFollowing(profileData.is_following);
      } catch (err) {
        setError("Gagal memuat profil.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [username]);

  const handleDeletePost = async (postId: string) => {
    try {
      // Panggil API delete post
      const response = await fetch(`/api/posts/${postId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete post');
      }
      
      // Update local state setelah delete berhasil
      if (data) {
        setData({
          ...data,
          user: {
            ...data.user,
            posts: data.user.posts.filter(post => post.id !== postId),
            posts_count: data.user.posts_count - 1,
          },
        });
      }
    } catch (error) {
      console.error("Gagal menghapus postingan:", error);
      alert("Gagal menghapus postingan. Silakan coba lagi.");
    }
  };

  const handleRemoveBookmark = async (bookmarkId: string, postId: string) => {
    try {
      // Panggil API delete bookmark
      const response = await fetch(`/api/bookmarks/${bookmarkId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to remove bookmark');
      }
      
      // Update local state - hapus bookmark dari daftar bookmarks di user
      if (data) {
        setData({
          ...data,
          user: {
            ...data.user,
            bookmarks: data.user.bookmarks.filter(b => b.id !== bookmarkId),
            bookmarks_count: data.user.bookmarks_count - 1,
          },
        });
      }
    } catch (error) {
      console.error("Gagal menghapus bookmark:", error);
      alert("Gagal menghapus bookmark. Silakan coba lagi.");
    }
  };

  const handleToggleFollow = async () => {
    try {
      if (isFollowing) {
        // Unfollow
        const response = await fetch(`/api/follow/${data?.user.id}`, {
          method: 'DELETE',
        });
        if (response.ok) {
          setIsFollowing(false);
          if (data) {
            setData({
              ...data,
              user: {
                ...data.user,
                followers_count: data.user.followers_count - 1,
              },
            });
          }
        }
      } else {
        // Follow
        const response = await fetch(`/api/follow/${data?.user.id}`, {
          method: 'POST',
        });
        if (response.ok) {
          setIsFollowing(true);
          if (data) {
            setData({
              ...data,
              user: {
                ...data.user,
                followers_count: data.user.followers_count + 1,
              },
            });
          }
        }
      }
    } catch (error) {
      console.error("Error toggling follow:", error);
      alert("Gagal mengubah status follow. Silakan coba lagi.");
    }
  };

  // Mendapatkan data likes dari response API
  const likes = data?.user?.likes || [];
  const filteredLikes = likesFilter === "all" 
    ? likes 
    : likes.filter(l => l.target_type === likesFilter);

  const likesCounts = {
    all: likes.length,
    post: likes.filter(l => l.target_type === "post").length,
    comment: likes.filter(l => l.target_type === "comment").length,
  };

  if (loading) {
    return (
      <div style={{ maxWidth: 680, margin: "0 auto", padding: "40px 16px" }}>
        {[1, 2, 3].map(i => (
          <div key={i} style={{
            height: i === 1 ? 120 : 60,
            borderRadius: 12,
            background: "linear-gradient(90deg, #F1F5F9 25%, #E2E8F0 50%, #F1F5F9 75%)",
            backgroundSize: "200% 100%",
            animation: "shimmer 1.4s infinite",
            marginBottom: 16,
          }} />
        ))}
        <style>{`@keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }`}</style>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div style={{ maxWidth: 680, margin: "60px auto", textAlign: "center", color: "#EF4444", fontSize: 14 }}>
        {error ?? "Data tidak tersedia."}
      </div>
    );
  }

  const { user } = data;

  return (
    <div style={{
      maxWidth: 680, margin: "0 auto", padding: "32px 16px 64px",
      fontFamily: "'Inter', 'Segoe UI', sans-serif",
      color: "#1E293B",
    }}>
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>

      {/* Profile card */}
      <div style={{
        borderRadius: 16,
        border: "1px solid #E2E8F0",
        background: "#fff",
        padding: "28px 24px",
        marginBottom: 20,
      }}>
        <div style={{ display: "flex", gap: 20, alignItems: "flex-start", flexWrap: "wrap" }}>
          <AvatarBlock user={user} />

          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, letterSpacing: "-0.02em" }}>
                @{user.username}
              </h1>
              {user.roles.map(r => <RoleBadge key={r.id} role={r} />)}
            </div>

            <div style={{ fontSize: 12, color: "#94A3B8", marginTop: 4 }}>
              {user.email} · Bergabung {formatDate(user.created_at)}
            </div>

            {user.bio && user.bio !== "string" && (
              <p style={{ margin: "8px 0 0", fontSize: 14, color: "#475569", lineHeight: 1.6 }}>
                {user.bio}
              </p>
            )}

            <div style={{ marginTop: 10, display: "inline-flex", alignItems: "center", gap: 6,
              background: "#EEF2FF", borderRadius: 20, padding: "4px 12px" }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#6366F1", display: "inline-block" }} />
              <span style={{ fontSize: 12, fontWeight: 600, color: "#4338CA" }}>
                {levelLabel(user.level)} · {user.reputation_points} poin
              </span>
            </div>
          </div>

          {currentUserId !== user.id && (
            <button
              onClick={handleToggleFollow}
              style={{
                alignSelf: "flex-start",
                padding: "8px 20px",
                borderRadius: 8,
                border: isFollowing ? "1.5px solid #C7D2FE" : "1.5px solid #6366F1",
                background: isFollowing ? "#EEF2FF" : "#6366F1",
                color: isFollowing ? "#4338CA" : "#fff",
                fontWeight: 600, fontSize: 13, cursor: "pointer",
                transition: "all .15s",
              }}
            >
              {isFollowing ? "Mengikuti ✓" : "+ Ikuti"}
            </button>
          )}
        </div>

        <div style={{ height: 1, background: "#F1F5F9", margin: "20px 0" }} />

        <div style={{ display: "flex", gap: 0, justifyContent: "space-around", flexWrap: "wrap", rowGap: 12 }}>
          <StatPill label="Postingan" value={user.posts_count} />
          <div style={{ width: 1, background: "#F1F5F9" }} />
          <StatPill label="Pengikut" value={user.followers_count} />
          <div style={{ width: 1, background: "#F1F5F9" }} />
          <StatPill label="Mengikuti" value={user.following_count} />
          <div style={{ width: 1, background: "#F1F5F9" }} />
          <StatPill label="Lencana" value={user.badges_count} />
          <div style={{ width: 1, background: "#F1F5F9" }} />
          <StatPill label="Reputasi" value={user.reputation_points} />
        </div>
      </div>

      {/* Tabs */}
      <div style={{
        display: "flex", gap: 0,
        borderBottom: "2px solid #E2E8F0",
        marginBottom: 20,
        overflowX: "auto",
      }}>
        {(["posts", "badges", "likes", "bookmarks"] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              background: "none", border: "none", cursor: "pointer",
              padding: "10px 20px",
              fontSize: 14, fontWeight: 600,
              color: activeTab === tab ? "#6366F1" : "#94A3B8",
              borderBottom: activeTab === tab ? "2px solid #6366F1" : "2px solid transparent",
              marginBottom: -2,
              transition: "color .15s",
              textTransform: "capitalize",
              display: "flex",
              alignItems: "center",
              gap: 6,
              whiteSpace: "nowrap",
            }}
          >
            {tab === "posts" && <FileText size={14} />}
            {tab === "badges" && <span>🏅</span>}
            {tab === "likes" && <Heart size={14} />}
            {tab === "bookmarks" && <BookmarkIcon size={14} />}
            {tab === "posts" ? `Postingan (${user.posts_count})` : 
             tab === "badges" ? `Lencana (${user.badges_count})` : 
             tab === "likes" ? `Like (${likes.length})` :
             `Bookmark (${user.bookmarks_count})`}
          </button>
        ))}
      </div>

      {/* Posts Tab */}
      {activeTab === "posts" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {user.posts.length === 0
            ? <EmptyState label="Belum ada postingan." />
            : user.posts.map(post => (
                <PostCard 
                  key={post.id} 
                  post={post} 
                  currentUserId={currentUserId}
                  onDelete={handleDeletePost}
                />
              ))
          }
        </div>
      )}

      {/* Badges Tab */}
      {activeTab === "badges" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 12 }}>
          {user.badges.length === 0
            ? <EmptyState label="Belum ada lencana." />
            : user.badges.map(badge => <BadgeCard key={badge.id} badge={badge} />)
          }
        </div>
      )}

      {/* Likes Tab - Menggunakan data dari user.likes */}
      {activeTab === "likes" && (
        <div>
          <div style={{
            display: "flex", gap: 6, marginBottom: 20,
            background: "#F8FAFC", borderRadius: 10,
            padding: 4, border: "1px solid #E2E8F0",
          }}>
            <Filter size={14} color="#CBD5E1" style={{ alignSelf: "center", marginLeft: 6, flexShrink: 0 }} />
            {[
              { key: "all" as const, label: "Semua", Icon: Heart },
              { key: "post" as const, label: "Postingan", Icon: FileText },
              { key: "comment" as const, label: "Komentar", Icon: MessageSquare },
            ].map(({ key, label, Icon }) => (
              <button
                key={key}
                onClick={() => setLikesFilter(key)}
                style={{
                  flex: 1,
                  padding: "7px 10px",
                  borderRadius: 7,
                  border: "none",
                  background: likesFilter === key ? "#fff" : "transparent",
                  boxShadow: likesFilter === key ? "0 1px 4px rgba(0,0,0,.08)" : "none",
                  color: likesFilter === key ? "#1E293B" : "#94A3B8",
                  fontWeight: likesFilter === key ? 600 : 400,
                  fontSize: 13,
                  cursor: "pointer",
                  display: "flex", alignItems: "center",
                  justifyContent: "center", gap: 5,
                  transition: "all .15s",
                }}
              >
                <Icon size={13} strokeWidth={2} />
                {label}
                <span style={{
                  fontSize: 11, fontWeight: 700,
                  background: likesFilter === key ? "#F1F5F9" : "transparent",
                  color: likesFilter === key ? "#475569" : "#CBD5E1",
                  padding: "1px 6px", borderRadius: 10,
                  minWidth: 18, textAlign: "center",
                }}>
                  {likesCounts[key]}
                </span>
              </button>
            ))}
          </div>

          {filteredLikes.length === 0 ? (
            <EmptyState label="Belum ada aktivitas like." icon={Inbox} />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {filteredLikes.map((like, i) => (
                <LikeCard key={like.id} like={like} index={i} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Bookmarks Tab - Menggunakan data dari user.bookmarks */}
      {activeTab === "bookmarks" && (
        <div>
          {user.bookmarks?.length === 0 ? (
            <EmptyState label="Belum ada bookmark." icon={BookmarkIcon} />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {user.bookmarks?.map((bookmark) => {
                const { post } = bookmark;
                const [isRemoving, setIsRemoving] = useState(false);
                
                const handleRemove = async () => {
                  setIsRemoving(true);
                  await handleRemoveBookmark(bookmark.id, post.id);
                  setIsRemoving(false);
                };
                
                return (
                  <div
                    key={bookmark.id}
                    style={{
                      background: "#ffffff",
                      border: "1px solid #e5e7eb",
                      borderRadius: "14px",
                      padding: "18px 20px",
                      display: "flex",
                      flexDirection: "column",
                      gap: "10px",
                      boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
                      transition: "all 0.15s ease",
                      position: "relative",
                      opacity: isRemoving ? 0.5 : 1,
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                        <StatusBadge status={post.status} />
                        {post.is_answered === 1 && (
                          <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", fontSize: "11px", color: "#16a34a", fontWeight: 600 }}>
                            ✓ Ada Jawaban
                          </span>
                        )}
                      </div>
                      <button
                        onClick={handleRemove}
                        disabled={isRemoving}
                        style={{
                          background: "none",
                          border: "none",
                          cursor: isRemoving ? "not-allowed" : "pointer",
                          color: "#9ca3af",
                          fontSize: "18px",
                          padding: "2px 4px",
                          borderRadius: "6px",
                          transition: "color 0.1s",
                          flexShrink: 0,
                        }}
                      >
                        {isRemoving ? "..." : "🔖"}
                      </button>
                    </div>

                    <h3 style={{ margin: 0, fontSize: "15px", fontWeight: 700, color: "#111827", lineHeight: 1.4 }}>
                      {post.title}
                    </h3>

                    <p style={{ margin: 0, fontSize: "13px", color: "#6b7280", lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                      {post.body}
                    </p>

                    <div style={{ display: "flex", alignItems: "center", gap: "12px", paddingTop: "4px", borderTop: "1px solid #f3f4f6", flexWrap: "wrap" }}>
                      <span style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "11px", color: "#6b7280" }}>
                        👁 {post.view_count} dilihat
                      </span>
                      <span style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "11px", color: "#6b7280" }}>
                        ▲ {post.vote_score} suara
                      </span>
                      <span style={{ fontSize: "11px", color: "#9ca3af", marginLeft: "auto" }}>
                        Disimpan {formatDate(bookmark.created_at)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}