"use client";

import React, { useState, use, useEffect } from "react";
import {
  ChevronUp,
  ChevronDown,
  Heart,
  MessageSquare,
  ArrowLeft,
  Calendar,
  Award,
  Clock,
  User,
  Send,
  Loader2,
  CheckCircle,
  HelpCircle,
  History,
  CornerDownRight,
  ExternalLink,
  UserPlus,
  UserMinus,
  Flag,
} from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useApp } from "@/context/AppContext";
import ReportModal from "@/components/ReportModal";

interface Role {
  id: string;
  name: string;
  permissions: string | null;
}

interface Author {
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
  roles?: Role[];
}

interface EditHistory {
  id: string;
  comment_id: string;
  edited_by: string;
  body_before: string;
  body_after: string;
  reason?: string;
  edited_at: string;
  created_at?: string;
}

interface CommentReply {
  id: string;
  post_id: string;
  user_id: string;
  parent_id: string | null;
  body: string;
  vote_score: number;
  is_accepted: number;
  created_at: string;
  updated_at: string;
  is_edited: boolean;
  user_has_liked?: boolean;
  user_has_voted?: boolean;
  user_vote_type?: "upvote" | "downvote" | null;
  user?: Author;
  likes_count?: number;
  upvotes_count?: number;
  downvotes_count?: number;
  votes_count?: number;
}

interface CommentDetail {
  id: string;
  post_id: string;
  user_id: string;
  parent_id: string | null;
  body: string;
  vote_score: number;
  is_accepted: number;
  created_at: string;
  updated_at: string;
  is_edited: boolean;
  user_has_liked?: boolean;
  user_has_voted?: boolean;
  user_vote_type?: "upvote" | "downvote" | null;
  user: Author;
  replies: CommentReply[];
  comment_edit_histories: EditHistory[];
  likes_count?: number;
  upvotes_count?: number;
  downvotes_count?: number;
  votes_count?: number;
}

const STORAGE_BASE = "https://pegaduanmasyarakat.alwaysdata.net/storage/";
const FALLBACK_AVATAR =
  "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=150&q=80";

function resolveAvatar(avatarUrl?: string | null): string {
  if (!avatarUrl) return FALLBACK_AVATAR;
  if (avatarUrl.startsWith("http")) return avatarUrl;
  return `${STORAGE_BASE}${avatarUrl}`;
}

function formatDate(dateStr: string): string {
  try {
    const date = new Date(dateStr);
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
}

export default function CommentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { currentUser, showNotification } = useApp();
  const isAdminOrModerator = currentUser?.primary_role?.name === "admin" || currentUser?.primary_role?.name === "moderator";

  const [comment, setComment] = useState<CommentDetail | null>(null);
  const [postOwnerId, setPostOwnerId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Follow states
  const [followLoading, setFollowLoading] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);

  // Replies states
  const [replyText, setReplyText] = useState("");
  const [submittingReply, setSubmittingReply] = useState(false);

  // Report states
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportTarget, setReportTarget] = useState<{ id: string; type: "post" | "comment" }>({ id: "", type: "comment" });

  // Fetch comment details
  const fetchCommentDetails = async (showSpinner = true) => {
    if (showSpinner) setLoading(true);
    try {
      const res = await fetch(`/api/comment/${id}`);
      if (!res.ok) {
        throw new Error("Gagal mengambil detail komentar.");
      }
      const json = await res.json();
      const commentData = json.data as CommentDetail;
      setComment(commentData);

      // Check following status (only if viewing someone else's comment)
      if (currentUser && commentData.user?.username && commentData.user.username !== currentUser.username) {
        try {
          const profileRes = await fetch(`/api/profile/${commentData.user.username}`);
          if (profileRes.ok) {
            const profileData = await profileRes.json();
            setIsFollowing(profileData.is_following);
          }
        } catch (e) {
          console.error("Error checking follow status:", e);
        }
      }

      // Fetch main post details to identify the owner
      try {
        const postRes = await fetch(`/api/posts/${commentData.post_id}`);
        if (postRes.ok) {
          const postJson = await postRes.ok ? await postRes.json() : null;
          if (postJson?.data?.user_id) {
            setPostOwnerId(postJson.data.user_id);
          }
        }
      } catch (postErr) {
        console.error("Error fetching post details:", postErr);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Terjadi kesalahan.");
    } finally {
      if (showSpinner) setLoading(false);
    }
  };

  useEffect(() => {
    fetchCommentDetails();
  }, [id, currentUser?.username]);

  // Handle follow/unfollow
  const handleFollowAuthor = async () => {
    if (!currentUser) {
      router.push("/login");
      return;
    }
    if (!comment || followLoading || !comment.user?.username) return;

    setFollowLoading(true);
    const wasFollowing = isFollowing;
    setIsFollowing(!wasFollowing);

    try {
      const res = await fetch("/api/follows", {
        method: wasFollowing ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: comment.user.username }),
      });

      if (!res.ok) {
        setIsFollowing(wasFollowing);
        const errData = await res.json().catch(() => ({}));
        showNotification(errData.message || (wasFollowing ? "Gagal unfollow." : "Gagal follow."), "info");
      } else {
        showNotification(wasFollowing ? `Batal mengikuti @${comment.user.username}` : `Mengikuti @${comment.user.username}`);
      }
    } catch {
      setIsFollowing(wasFollowing);
      showNotification("Terjadi kesalahan jaringan.", "info");
    } finally {
      setFollowLoading(false);
    }
  };

  // Vote comment handler
  const handleVoteComment = async (voteType: "upvote" | "downvote") => {
    if (!currentUser) {
      router.push("/login");
      return;
    }
    if (!comment) return;

    // Check if toggling same vote
    const currentVote = comment.user_vote_type;
    const isUnvoting = currentVote === voteType;

    // Optimistic UI updates
    let voteDiff = 0;
    if (voteType === "upvote") {
      if (currentVote === "upvote") voteDiff = -1;
      else if (currentVote === "downvote") voteDiff = 2;
      else voteDiff = 1;
    } else {
      if (currentVote === "downvote") voteDiff = 1;
      else if (currentVote === "upvote") voteDiff = -2;
      else voteDiff = -1;
    }

    setComment((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        votes_count: (prev.votes_count ?? prev.vote_score) + voteDiff,
        vote_score: prev.vote_score + voteDiff,
        user_vote_type: isUnvoting ? null : voteType,
      };
    });

    try {
      const endpoint = voteType === "upvote" ? "/api/vote" : "/api/downvote";
      const payload = voteType === "upvote"
        ? { target_id: comment.id, vote_type: voteType }
        : { target_id: comment.id };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        // Rollback
        fetchCommentDetails(false);
        const errData = await res.json().catch(() => ({}));
        showNotification(errData.message || "Gagal melakukan voting.", "info");
      }
    } catch (err) {
      console.error(err);
      fetchCommentDetails(false);
      showNotification("Kesalahan jaringan saat melakukan voting.", "info");
    }
  };

  // Like/Unlike comment handler
  const handleLikeComment = async () => {
    if (!currentUser) {
      router.push("/login");
      return;
    }
    if (!comment) return;

    const wasLiked = !!comment.user_has_liked;

    // Optimistic UI update
    setComment((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        user_has_liked: !wasLiked,
      };
    });

    try {
      const endpoint = wasLiked ? "/api/unlikes" : "/api/likes";
      const method = wasLiked ? "DELETE" : "POST";
      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ target_id: comment.id }),
      });

      if (!res.ok) {
        // Rollback
        fetchCommentDetails(false);
        const errData = await res.json().catch(() => ({}));
        showNotification(errData.message || "Gagal memperbarui status suka.", "info");
      }
    } catch (err) {
      console.error(err);
      fetchCommentDetails(false);
      showNotification("Kesalahan jaringan saat menyukai komentar.", "info");
    }
  };

  // Vote reply handler
  const handleVoteReply = async (replyId: string, voteType: "upvote" | "downvote") => {
    if (!currentUser) {
      router.push("/login");
      return;
    }
    if (!comment) return;

    const replyIndex = comment.replies.findIndex((r) => r.id === replyId);
    if (replyIndex === -1) return;

    const reply = comment.replies[replyIndex];
    const currentVote = reply.user_vote_type;
    const isUnvoting = currentVote === voteType;

    // Optimistic UI updates
    let voteDiff = 0;
    if (voteType === "upvote") {
      if (currentVote === "upvote") voteDiff = -1;
      else if (currentVote === "downvote") voteDiff = 2;
      else voteDiff = 1;
    } else {
      if (currentVote === "downvote") voteDiff = 1;
      else if (currentVote === "upvote") voteDiff = -2;
      else voteDiff = -1;
    }

    setComment((prev) => {
      if (!prev) return null;
      const updatedReplies = [...prev.replies];
      updatedReplies[replyIndex] = {
        ...reply,
        votes_count: (reply.votes_count ?? reply.vote_score) + voteDiff,
        vote_score: reply.vote_score + voteDiff,
        user_vote_type: isUnvoting ? null : voteType,
      };
      return {
        ...prev,
        replies: updatedReplies,
      };
    });

    try {
      const endpoint = voteType === "upvote" ? "/api/vote" : "/api/downvote";
      const payload = voteType === "upvote"
        ? { target_id: replyId, vote_type: voteType }
        : { target_id: replyId };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        fetchCommentDetails(false);
        const errData = await res.json().catch(() => ({}));
        showNotification(errData.message || "Gagal melakukan voting.", "info");
      }
    } catch (err) {
      console.error(err);
      fetchCommentDetails(false);
      showNotification("Kesalahan jaringan saat melakukan voting.", "info");
    }
  };

  // Like reply handler
  const handleLikeReply = async (replyId: string) => {
    if (!currentUser) {
      router.push("/login");
      return;
    }
    if (!comment) return;

    const replyIndex = comment.replies.findIndex((r) => r.id === replyId);
    if (replyIndex === -1) return;

    const reply = comment.replies[replyIndex];
    const wasLiked = !!reply.user_has_liked;

    // Optimistic UI updates
    setComment((prev) => {
      if (!prev) return null;
      const updatedReplies = [...prev.replies];
      updatedReplies[replyIndex] = {
        ...reply,
        user_has_liked: !wasLiked,
      };
      return {
        ...prev,
        replies: updatedReplies,
      };
    });

    try {
      const endpoint = wasLiked ? "/api/unlikes" : "/api/likes";
      const method = wasLiked ? "DELETE" : "POST";
      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ target_id: replyId }),
      });

      if (!res.ok) {
        fetchCommentDetails(false);
        const errData = await res.json().catch(() => ({}));
        showNotification(errData.message || "Gagal memperbarui status suka.", "info");
      }
    } catch (err) {
      console.error(err);
      fetchCommentDetails(false);
      showNotification("Kesalahan jaringan saat menyukai balasan.", "info");
    }
  };

  // Accept solution handler
  const handleAcceptSolution = async (commentOrReplyId: string) => {
    if (!comment || !currentUser) return;
    if (!confirm("Apakah Anda yakin ingin menandai jawaban ini sebagai solusi terbaik?")) return;

    try {
      const res = await fetch(`/api/posts/${comment.post_id}/answer`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          comment_id: commentOrReplyId,
        }),
      });

      if (!res.ok) {
        const resData = await res.json();
        throw new Error(resData.message || "Gagal menerima jawaban.");
      }

      showNotification("Solusi disepakati berhasil diperbarui!");
      fetchCommentDetails(false);
    } catch (err: any) {
      console.error(err);
      showNotification(err.message || "Terjadi kesalahan saat menetapkan solusi terbaik.", "info");
    }
  };

  // Send reply handler
  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment || !replyText.trim() || submittingReply) return;

    if (!currentUser) {
      showNotification("Silakan login terlebih dahulu untuk membalas komentar.", "info");
      return;
    }

    setSubmittingReply(true);
    try {
      const res = await fetch("/api/comment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          post_id: comment.post_id,
          parent_id: comment.id,
          body: replyText.trim(),
        }),
      });

      if (!res.ok) {
        const resData = await res.json();
        throw new Error(resData.message || "Gagal mengirim balasan.");
      }

      setReplyText("");
      showNotification("Balasan berhasil dikirim!");
      fetchCommentDetails(false);
    } catch (err: any) {
      console.error(err);
      showNotification(err.message || "Terjadi kesalahan saat membalas komentar.", "info");
    } finally {
      setSubmittingReply(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto flex flex-col items-center justify-center min-h-[400px] gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-brand-blue" />
        <p className="text-sm text-zinc-500 dark:text-zinc-400">Memuat detail komentar...</p>
      </div>
    );
  }

  if (error || !comment) {
    return (
      <div className="max-w-4xl mx-auto flex flex-col items-center justify-center min-h-[400px] gap-4">
        <HelpCircle className="h-12 w-12 text-red-500" />
        <div className="text-center space-y-1.5">
          <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Gagal Memuat Komentar</h3>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-md">
            {error || "Komentar tidak ditemukan atau terjadi kesalahan server."}
          </p>
        </div>
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-1.5 px-4 py-2 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs font-semibold bg-white dark:bg-zinc-950 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Kembali
        </button>
      </div>
    );
  }

  const isOwnComment = currentUser && currentUser.id === comment.user?.id;
  const avatar = resolveAvatar(comment.user?.avatar_url);
  const isPostOwner = currentUser && postOwnerId === currentUser.id;

  return (
    <div className="max-w-4xl mx-auto space-y-6 py-2">
      {/* Header bar */}
      <div className="flex items-center justify-between pb-5 border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-500 dark:text-zinc-400 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors"
            title="Kembali"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-white tracking-tight">
              Detail Komentar
            </h1>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              Melihat konteks detail dari tanggapan pengguna.
            </p>
          </div>
        </div>

        <Link
          href={`/posts/${comment.post_id}`}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-blue hover:underline bg-brand-blue/5 px-3 py-2 rounded-lg"
        >
          <span>Postingan Utama</span>
          <ExternalLink className="h-3 w-3" />
        </Link>
      </div>

      {/* Main Comment Card */}
      <div className="flex gap-4 p-5 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl relative shadow-xs">
        
        {/* Voting System */}
        <div className="flex flex-col items-center gap-1.5 shrink-0 pt-1">
          <button
            onClick={() => handleVoteComment("upvote")}
            className={`p-1.5 rounded-lg border transition-all ${
              comment.user_vote_type === "upvote"
                ? "border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                : "border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 text-zinc-400 hover:text-zinc-650"
            }`}
            title="Dukung"
          >
            <ChevronUp className="h-5 w-5" />
          </button>
          
          <span className="font-mono text-sm font-bold text-zinc-900 dark:text-white select-none">
            {comment.votes_count ?? comment.vote_score}
          </span>
          
          <button
            onClick={() => handleVoteComment("downvote")}
            className={`p-1.5 rounded-lg border transition-all ${
              comment.user_vote_type === "downvote"
                ? "border-red-500 bg-red-500/10 text-red-600 dark:text-red-400"
                : "border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 text-zinc-400 hover:text-zinc-650"
            }`}
            title="Tolak"
          >
            <ChevronDown className="h-5 w-5" />
          </button>

          {/* Accepted Answer Icon / Toggle */}
          {comment.is_accepted === 1 ? (
            <button
              onClick={() => isPostOwner && handleAcceptSolution(comment.id)}
              className={`mt-2 transition-opacity ${isPostOwner ? 'cursor-pointer hover:opacity-80' : 'cursor-default'} text-emerald-600 dark:text-emerald-400`}
              title={isPostOwner ? "Batal pilih sebagai solusi terbaik" : "Solusi Terbaik / Diterima"}
              disabled={!isPostOwner}
            >
              <CheckCircle className="h-6 w-6 fill-current" />
            </button>
          ) : (
            isPostOwner && comment.user?.id !== currentUser?.id && (
              <button
                onClick={() => handleAcceptSolution(comment.id)}
                className="mt-2 text-zinc-350 dark:text-zinc-700 hover:text-emerald-500 dark:hover:text-emerald-500 transition-colors cursor-pointer"
                title="Tandai sebagai solusi terbaik"
              >
                <CheckCircle className="h-6 w-6" />
              </button>
            )
          )}
        </div>

        {/* Comment Content Column */}
        <div className="flex-1 space-y-4 min-w-0">
          
          {/* Author Meta Row */}
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-3">
              {comment.user ? (
                <Link
                  href={`/profile/${comment.user.username}`}
                  className="h-10 w-10 rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 block shrink-0 hover:opacity-90 active:scale-95 transition-all"
                >
                  <img
                    src={avatar}
                    alt={comment.user.username}
                    className="h-full w-full object-cover"
                  />
                </Link>
              ) : (
                <div className="h-10 w-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-400 border border-zinc-200 dark:border-zinc-800 shrink-0">
                  <User className="h-5 w-5" />
                </div>
              )}
              <div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {comment.user ? (
                    <>
                      <Link
                        href={`/profile/${comment.user.username}`}
                        className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-white hover:text-brand-blue transition-colors"
                      >
                        @{comment.user.username}
                      </Link>
                      <span className="text-[10px] bg-brand-blue/10 text-brand-blue font-mono font-bold px-1.5 py-0.5 rounded">
                        Lv.{comment.user.level}
                      </span>
                      <span className="text-[10px] bg-amber-500/10 text-amber-600 dark:text-amber-400 font-mono font-bold px-1.5 py-0.5 rounded">
                        {comment.user.reputation_points} pts
                      </span>
                    </>
                  ) : (
                    <span className="text-xs sm:text-sm font-bold text-zinc-500 italic">
                      Anonymous
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-medium mt-0.5 flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  <span>Dibuat: {formatDate(comment.created_at)}</span>
                  {comment.is_edited && (
                    <span className="inline-flex items-center gap-0.5 text-zinc-400 dark:text-zinc-500 font-bold bg-zinc-100 dark:bg-zinc-900 px-1 rounded-sm text-[9px] uppercase tracking-wider font-mono">
                      (Edited)
                    </span>
                  )}
                </p>
              </div>
            </div>

            {/* Follow Button */}
            {!isOwnComment && (
              <button
                onClick={handleFollowAuthor}
                disabled={followLoading}
                className={`inline-flex items-center justify-center gap-1.5 text-[10px] font-bold px-3 py-1.5 rounded-lg border transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed ${
                  isFollowing
                    ? "bg-zinc-50 hover:bg-red-50 dark:bg-zinc-900 dark:hover:bg-red-950/20 text-zinc-700 dark:text-zinc-300 hover:text-red-600 dark:hover:text-red-400 border-zinc-200 dark:border-zinc-700 hover:border-red-300 dark:hover:border-red-800"
                    : "bg-brand-blue hover:bg-brand-blue/90 text-white border-transparent shadow-xs"
                }`}
              >
                {followLoading ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : isFollowing ? (
                  <UserMinus className="h-3 w-3" />
                ) : (
                  <UserPlus className="h-3 w-3" />
                )}
                {isFollowing ? "Mengikuti" : "Ikuti"}
              </button>
            )}
          </div>

          {/* Bio Description (Brief context of user) */}
          {comment.user?.bio && (
            <p className="text-[11px] text-zinc-400 dark:text-zinc-500 border-l-2 border-zinc-200 dark:border-zinc-800 pl-2 italic">
              {comment.user.bio}
            </p>
          )}

          {/* Comment Body */}
          <div className="text-zinc-800 dark:text-zinc-200 text-sm sm:text-base leading-relaxed break-words font-sans py-1">
            {comment.body}
          </div>

          {/* Likes & Edit Timeline Action Bar */}
          <div className="flex items-center gap-3 pt-3 border-t border-zinc-100 dark:border-zinc-800/80">
            <button
              onClick={handleLikeComment}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                comment.user_has_liked
                  ? "bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 shadow-xs"
                  : "bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 text-zinc-500 dark:text-zinc-455"
              }`}
            >
              <Heart className={`h-3.5 w-3.5 ${comment.user_has_liked ? "fill-current" : ""}`} />
              <span>{comment.user_has_liked ? "Disukai" : "Sukai"}</span>
            </button>

            {currentUser && !isOwnComment && (
              <button
                onClick={() => {
                  setReportTarget({ id: comment.id, type: "comment" });
                  setShowReportModal(true);
                }}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg border text-xs font-bold bg-white hover:bg-orange-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 hover:border-orange-200 text-zinc-500 hover:text-orange-600 transition-all cursor-pointer"
                title="Laporkan komentar ini"
              >
                <Flag className="h-3.5 w-3.5" />
                <span>Laporkan</span>
              </button>
            )}

            {isAdminOrModerator && (
              <button
                onClick={() => router.push(`/comment/${comment.id}/history`)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg border text-xs font-bold bg-white hover:bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 text-zinc-500 hover:text-brand-blue transition-all cursor-pointer"
                title="Lihat Riwayat Suntingan Lengkap"
              >
                <History className="h-3.5 w-3.5" />
                <span>History</span>
              </button>
            )}

            {comment.comment_edit_histories.length > 0 && (
              <span className="inline-flex items-center gap-1 text-[11px] text-zinc-400 font-mono">
                <History className="h-3 w-3" />
                <span>{comment.comment_edit_histories.length} Editan</span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Edit History Section */}
      {comment.comment_edit_histories.length > 0 && (
        <div className="p-5 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl space-y-4">
          <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1.5">
            <History className="h-4 w-4 text-brand-blue" />
            Riwayat Suntingan ({comment.comment_edit_histories.length})
          </h3>
          
          <div className="space-y-4 relative border-l border-zinc-200 dark:border-zinc-800 ml-2.5 pl-5">
            {comment.comment_edit_histories.map((history, idx) => (
              <div key={history.id} className="relative space-y-1 text-left">
                {/* Timeline Dot Indicator */}
                <span className="absolute -left-[26px] top-1.5 h-3.5 w-3.5 rounded-full border-2 border-white dark:border-zinc-950 bg-brand-blue flex items-center justify-center shrink-0" />
                
                <div className="flex items-center justify-between gap-3 text-[10px] text-zinc-400 font-mono">
                  <span>Versi #{comment.comment_edit_histories.length - idx}</span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatDate(history.edited_at || history.created_at || "")}
                  </span>
                </div>

                <div className="p-3 bg-white dark:bg-zinc-950 rounded-lg border border-zinc-150 dark:border-zinc-800 text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 mt-1.5">
                  <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1 font-mono">
                    Sebelumnya:
                  </div>
                  <div className="line-through text-red-500/80 mb-2 whitespace-pre-wrap">{history.body_before}</div>
                  
                  <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1 font-mono">
                    Sesudah:
                  </div>
                  <div className="text-emerald-600 dark:text-emerald-400 whitespace-pre-wrap">{history.body_after}</div>

                  {history.reason && (
                    <div className="mt-2 text-[10px] italic text-zinc-400">
                      Alasan: &ldquo;{history.reason}&rdquo;
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Replies / Comments Loop */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
          <MessageSquare className="h-4.5 w-4.5 text-brand-blue" />
          <span>Balasan / Diskusi ({comment.replies.length})</span>
        </h3>

        {comment.replies.length > 0 ? (
          <div className="space-y-3 pl-4 border-l-2 border-zinc-200 dark:border-zinc-800">
            {comment.replies.map((reply) => {
              const replyAvatar = resolveAvatar(reply.user?.avatar_url);

              return (
                <div
                  key={reply.id}
                  className="flex gap-3.5 p-4 bg-zinc-50/50 dark:bg-zinc-900/30 border border-zinc-200 dark:border-zinc-850 rounded-xl relative text-left"
                >
                  {/* Indicator Line Connector */}
                  <span className="absolute -left-5 top-7 w-5 border-t border-zinc-200 dark:border-zinc-800" />
                  
                  {/* Left Column: Reply Vote system */}
                  <div className="flex flex-col items-center gap-1 shrink-0 pt-1">
                    <button
                      onClick={() => handleVoteReply(reply.id, "upvote")}
                      className={`p-1 rounded-md border transition-all ${
                        reply.user_vote_type === "upvote"
                          ? "border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                          : "border-zinc-200 dark:border-zinc-850 hover:bg-zinc-105 dark:hover:bg-zinc-900 text-zinc-400 hover:text-zinc-650"
                      }`}
                      title="Dukung"
                    >
                      <ChevronUp className="h-4 w-4" />
                    </button>
                    
                    <span className="font-mono text-xs font-bold text-zinc-900 dark:text-white select-none">
                      {reply.votes_count ?? reply.vote_score}
                    </span>
                    
                    <button
                      onClick={() => handleVoteReply(reply.id, "downvote")}
                      className={`p-1 rounded-md border transition-all ${
                        reply.user_vote_type === "downvote"
                          ? "border-red-500 bg-red-500/10 text-red-600 dark:text-red-400"
                          : "border-zinc-200 dark:border-zinc-855 hover:bg-zinc-105 dark:hover:bg-zinc-900 text-zinc-400 hover:text-zinc-650"
                      }`}
                      title="Tolak"
                    >
                      <ChevronDown className="h-4 w-4" />
                    </button>

                    {/* Reply Accepted Answer Icon / Toggle */}
                    {reply.is_accepted === 1 ? (
                      <button
                        onClick={() => isPostOwner && handleAcceptSolution(reply.id)}
                        className={`mt-1.5 transition-opacity ${isPostOwner ? 'cursor-pointer hover:opacity-80' : 'cursor-default'} text-emerald-600 dark:text-emerald-400`}
                        title={isPostOwner ? "Batal pilih sebagai solusi terbaik" : "Solusi Terbaik / Diterima"}
                        disabled={!isPostOwner}
                      >
                        <CheckCircle className="h-5 w-5 fill-current" />
                      </button>
                    ) : (
                      isPostOwner && reply.user?.id !== currentUser?.id && (
                        <button
                          onClick={() => handleAcceptSolution(reply.id)}
                          className="mt-1.5 text-zinc-350 dark:text-zinc-700 hover:text-emerald-500 dark:hover:text-emerald-500 transition-colors cursor-pointer"
                          title="Tandai sebagai solusi terbaik"
                        >
                          <CheckCircle className="h-5 w-5" />
                        </button>
                      )
                    )}
                  </div>

                  {/* Right Column: Miniature reply icon indicator & Content */}
                  <div className="shrink-0 flex flex-col items-center">
                    {reply.user ? (
                      <Link
                        href={`/profile/${reply.user.username}`}
                        className="h-8 w-8 rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-800 block shrink-0 hover:opacity-90 transition-all"
                      >
                        <img
                          src={replyAvatar}
                          alt={reply.user.username}
                          className="h-full w-full object-cover"
                        />
                      </Link>
                    ) : (
                      <div className="h-8 w-8 rounded-lg bg-zinc-100 dark:bg-zinc-850 flex items-center justify-center text-zinc-400 border border-zinc-200 dark:border-zinc-800 shrink-0">
                        <User className="h-4 w-4" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 space-y-2 min-w-0">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {reply.user ? (
                          <>
                            <Link
                              href={`/profile/${reply.user.username}`}
                              className="text-xs font-bold text-zinc-900 dark:text-white hover:text-brand-blue"
                            >
                              @{reply.user.username}
                            </Link>
                            <span className="text-[9px] bg-brand-blue/10 text-brand-blue font-mono font-bold px-1.5 py-0.2 rounded">
                              Lv.{reply.user.level}
                            </span>
                            <span className="text-[9px] bg-amber-500/10 text-amber-600 dark:text-amber-400 font-mono font-bold px-1.5 py-0.2 rounded">
                              {reply.user.reputation_points} pts
                            </span>
                          </>
                        ) : (
                          <span className="text-xs font-bold text-zinc-500 italic">
                            Anonymous
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-zinc-400 font-mono">
                        {formatDate(reply.created_at)}
                      </span>
                    </div>

                    <div className="text-zinc-700 dark:text-zinc-300 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap break-words">
                      {reply.body}
                    </div>

                    {/* Interactive Like Action Bar for Reply */}
                    <div className="flex items-center gap-3 text-[11px] text-zinc-400 font-mono pt-2 border-t border-zinc-200/40 dark:border-zinc-800/40">
                      <button
                        onClick={() => handleLikeReply(reply.id)}
                        className={`flex items-center gap-1 hover:text-rose-500 transition-colors cursor-pointer ${
                          reply.user_has_liked ? "text-rose-500 font-bold" : "text-zinc-400"
                        }`}
                      >
                        <Heart className={`h-3 w-3 ${reply.user_has_liked ? "fill-current" : ""}`} />
                        <span>{reply.user_has_liked ? "Disukai" : "Sukai"}</span>
                      </button>

                      {currentUser && currentUser.id !== reply.user?.id && (
                        <>
                          <span className="text-zinc-350 dark:text-zinc-700 select-none">•</span>
                          <button
                            onClick={() => {
                              setReportTarget({ id: reply.id, type: "comment" });
                              setShowReportModal(true);
                            }}
                            className="flex items-center gap-1 hover:text-orange-500 transition-colors cursor-pointer text-zinc-400 font-semibold"
                            title="Laporkan balasan ini"
                          >
                            <Flag className="h-3 w-3" />
                            <span>Laporkan</span>
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-8 text-center bg-zinc-50/50 dark:bg-zinc-900/20 border border-zinc-200 dark:border-zinc-800 rounded-xl space-y-2">
            <CornerDownRight className="h-6 w-6 text-zinc-300 dark:text-zinc-650 mx-auto" />
            <p className="text-xs text-zinc-400 italic">Belum ada balasan untuk komentar ini.</p>
          </div>
        )}
      </div>

      {/* Reply Input Form */}
      <form onSubmit={handleSendReply} className="p-4 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xs space-y-3">
        <label className="text-xs font-bold text-zinc-900 dark:text-white block uppercase tracking-wider">
          Kirim Balasan
        </label>
        <div className="relative">
          <textarea
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder="Tulis tanggapan atau balasan Anda..."
            className="w-full text-xs sm:text-sm px-3.5 py-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 focus:outline-none focus:ring-1 focus:ring-brand-blue min-h-[80px] resize-none dark:text-white transition-shadow"
            required
            disabled={submittingReply}
          />
        </div>
        <div className="flex justify-end pt-1">
          <button
            type="submit"
            disabled={submittingReply || !replyText.trim()}
            className="inline-flex items-center justify-center gap-1.5 bg-brand-blue hover:bg-brand-blue/90 disabled:opacity-50 text-white text-xs font-bold py-2 px-4 rounded-lg shadow-xs transition-colors cursor-pointer disabled:cursor-not-allowed"
          >
            {submittingReply ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Mengirim...</span>
              </>
            ) : (
              <>
                <Send className="h-3.5 w-3.5" />
                <span>Kirim Solusi</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Report Modal */}
      <ReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        targetId={reportTarget.id}
        targetType={reportTarget.type}
        onSuccess={() => {
          if (showNotification) {
            showNotification("Laporan berhasil dikirim!", "success");
          }
        }}
      />
    </div>
  );
}
