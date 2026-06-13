"use client";
import 'quill/dist/quill.snow.css';

import React, { useState, use, useEffect, useRef } from "react";
import {
  ChevronUp,
  ChevronDown,
  Check,
  Bookmark,
  MessageSquare,
  Award,
  ArrowLeft,
  Send,
  CheckCircle2,
  Heart,
  Eye,
  Loader2,
  AlertCircle,
  Edit2,
  Trash2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Post, Comment } from "@/app/api/posts/[id]/PostDetailType";
import { useApp } from "@/context/AppContext";

// Extend Post type to include optional bookmark_id used for optimistic UI
interface PostWithBookmark extends Post {
  bookmark_id?: string | null;
}

const AVATAR_BASE = "https://pegaduanmasyarakat.alwaysdata.net/storage/";
const FALLBACK_AVATAR =
  "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=150&q=80";

function resolveAvatar(avatarUrl?: string | null): string {
  if (!avatarUrl) return FALLBACK_AVATAR;
  if (avatarUrl.startsWith("http")) return avatarUrl;
  return `${AVATAR_BASE}${avatarUrl}`;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function renderQuillBody(html: string) {
  // Strip HTML tags to get plain text for checking if it's plain text content
  const isHtml = /<[a-z][\s\S]*>/i.test(html);
  if (!isHtml) {
    // Legacy plain text fallback
    return (
      <p className="whitespace-pre-wrap leading-relaxed text-zinc-700 dark:text-zinc-300 text-sm sm:text-base font-sans">
        {html}
      </p>
    );
  }
  return (
    <div
      className="ql-editor ql-content prose prose-zinc dark:prose-invert max-w-none text-zinc-800 dark:text-zinc-200 text-sm sm:text-base"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

const fetchCache: Record<string, Promise<any>> = {};

export default function QuestionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { currentUser, showNotification } = useApp();

  const [post, setPost] = useState<PostWithBookmark | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [questionComment, setQuestionComment] = useState("");
  const [showQuestionCommentInput, setShowQuestionCommentInput] =
    useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);

  // States for replies
  const [replyingToCommentId, setReplyingToCommentId] = useState<string | null>(null);
  const [replyBody, setReplyBody] = useState("");
  const [submittingReply, setSubmittingReply] = useState(false);

  // States for editing comments
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editBody, setEditBody] = useState("");
  const [submittingEdit, setSubmittingEdit] = useState(false);

  // States for deleting comments
  const [deletingCommentId, setDeletingCommentId] = useState<string | null>(null);

  // States for deleting post
  const [deletingPost, setDeletingPost] = useState(false);

  // States for accepting answers
  const [acceptingAnswerId, setAcceptingAnswerId] = useState<string | null>(null);

  const isAdminOrModerator = currentUser?.primary_role?.name === 'admin' || currentUser?.primary_role?.name === 'moderator';
  const isPostOwner = currentUser && post && currentUser.id === post.user_id;
  const isPostOwnerOrAdmin = currentUser && post && (currentUser.id === post.user_id || currentUser.primary_role?.name === 'admin');
  const canDeletePost = currentUser && post && (currentUser.id === post.user_id || isAdminOrModerator);
  const hasAcceptedAnswer = post?.comments.some(
    (c: Comment) => c.is_accepted === 1 || (c.replies && c.replies.some((r) => r.is_accepted === 1))
  ) || false;

  // States for editing post
  const [isEditingPost, setIsEditingPost] = useState(false);
  const [editPostTitle, setEditPostTitle] = useState("");
  const [editPostBody, setEditPostBody] = useState("");
  const [editPostCategorySlug, setEditPostCategorySlug] = useState("");
  const [editPostReason, setEditPostReason] = useState("");
  const [categories, setCategories] = useState<any[]>([]);
  const [submittingEditPost, setSubmittingEditPost] = useState(false);

  // Tag selector states for edit form (mirrors ask/page.tsx)
  const [editAllTags, setEditAllTags] = useState<any[]>([]);
  const [editSelectedTags, setEditSelectedTags] = useState<any[]>([]);
  const [editTagInputValue, setEditTagInputValue] = useState('');
  const [editShowTagSuggestions, setEditShowTagSuggestions] = useState(false);
  const [editCreatingTag, setEditCreatingTag] = useState(false);

  // Quill refs for edit post form
  const editQuillRef = useRef<any>(null);
  const editContainerRef = useRef<HTMLDivElement>(null);

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/categories");
      if (res.ok) {
        const json = await res.json();
        const data = json.data ?? json;
        if (Array.isArray(data)) {
          setCategories(data);
        }
      }
    } catch (err) {
      console.error("Gagal memuat kategori:", err);
    }
  };

  const fetchEditTags = async () => {
    try {
      const res = await fetch('/api/tags');
      if (res.ok) {
        const json = await res.json();
        const data = json.data ?? json;
        if (Array.isArray(data)) setEditAllTags(data);
      }
    } catch (err) {
      console.error('Gagal memuat tags:', err);
    }
  };

  const editFilteredSuggestions = editAllTags.filter((tag) => {
    const isAlreadySelected = editSelectedTags.some((s) => s.id === tag.id);
    const matchesInput = tag.name.toLowerCase().includes(editTagInputValue.toLowerCase());
    return !isAlreadySelected && matchesInput;
  });

  const editIsInputExactMatch = editAllTags.some(
    (tag) => tag.name.toLowerCase() === editTagInputValue.trim().toLowerCase()
  );

  const handleEditAddExistingTag = (tag: any) => {
    if (editSelectedTags.length >= 5) return;
    setEditSelectedTags([...editSelectedTags, tag]);
    setEditTagInputValue('');
    setEditShowTagSuggestions(false);
  };

  const handleEditAddNewTag = async (tagName: string) => {
    const trimmed = tagName.trim();
    if (!trimmed || editSelectedTags.length >= 5) return;
    setEditCreatingTag(true);
    try {
      const res = await fetch('/api/tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: trimmed,
          slug: trimmed.toLowerCase().replace(/[^a-zA-Z0-9]/g, '-'),
        }),
      });
      const resData = await res.json();
      if (!res.ok) throw new Error(resData.message || 'Gagal membuat tag baru');
      const newTag = resData.data ?? resData;
      setEditSelectedTags([...editSelectedTags, newTag]);
      setEditAllTags([...editAllTags, newTag]);
      setEditTagInputValue('');
      setEditShowTagSuggestions(false);
      showNotification('Tag baru berhasil dibuat!');
    } catch (err: any) {
      showNotification(err.message || 'Gagal membuat tag.', 'info');
    } finally {
      setEditCreatingTag(false);
    }
  };

  const handleEditRemoveTag = (tagId: string) => {
    setEditSelectedTags(editSelectedTags.filter((t) => t.id !== tagId));
  };

  const handleEditPost = async (e: React.FormEvent) => {
    e.preventDefault();
    const bodyHtml = editQuillRef.current ? editQuillRef.current.root.innerHTML : editPostBody;
    const bodyText = editQuillRef.current ? editQuillRef.current.getText().trim() : editPostBody.trim();
    if (!post || !editPostTitle.trim() || !bodyText || !editPostCategorySlug || submittingEditPost) return;

    setSubmittingEditPost(true);
    try {
      const tagsArray = editSelectedTags.map((t) => t.name);

      const res = await fetch(`/api/posts/${post.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: editPostTitle.trim(),
          body: bodyHtml,
          category_slug: editPostCategorySlug,
          tags: tagsArray,
          reason: editPostReason.trim() || undefined,
        }),
      });

      const resData = await res.json();

      if (!res.ok) {
        throw new Error(resData.message || "Gagal memperbarui postingan");
      }

      showNotification("Postingan berhasil diperbarui!");
      setIsEditingPost(false);
      if (editQuillRef.current) {
        editQuillRef.current.off('text-change');
        editQuillRef.current = null;
      }
      await fetchPostDetails(false);
    } catch (err: any) {
      console.error("Edit post error:", err);
      showNotification(err.message || "Terjadi kesalahan saat memperbarui postingan.", "info");
    } finally {
      setSubmittingEditPost(false);
    }
  };

  const [closingPost, setClosingPost] = useState(false);

  const handleClosePost = async () => {
    if (!post || closingPost) return;
    if (!confirm("Apakah Anda yakin ingin menutup postingan ini? Postingan yang ditutup tidak dapat menerima jawaban/komentar baru.")) return;

    setClosingPost(true);
    try {
      const res = await fetch(`/api/posts/${post.id}/close`, {
        method: "POST",
      });

      const resData = await res.json();

      if (!res.ok) {
        throw new Error(resData.message || "Gagal menutup postingan");
      }

      showNotification("Postingan berhasil ditutup!");
      await fetchPostDetails(false);
    } catch (err: any) {
      console.error("Close post error:", err);
      showNotification(err.message || "Terjadi kesalahan saat menutup postingan.", "info");
    } finally {
      setClosingPost(false);
    }
  };

  const handleDeletePost = async () => {
    if (!post || deletingPost) return;
    if (!confirm("Apakah Anda yakin ingin menghapus postingan ini secara permanen?")) return;

    setDeletingPost(true);
    try {
      const res = await fetch(`/api/posts/${post.id}`, {
        method: "DELETE",
      });

      const resData = await res.json();

      if (!res.ok) {
        throw new Error(resData.message || "Gagal menghapus postingan");
      }

      showNotification("Postingan berhasil dihapus!");
      router.push("/homepage");
    } catch (err: any) {
      console.error("Delete post error:", err);
      showNotification(err.message || "Terjadi kesalahan saat menghapus postingan.", "info");
    } finally {
      setDeletingPost(false);
    }
  };

  const handleAcceptAnswer = async (commentId: string) => {
    if (!post || acceptingAnswerId) return;
    if (!confirm("Apakah Anda yakin ingin menandai jawaban ini sebagai solusi terbaik?")) return;

    setAcceptingAnswerId(commentId);
    try {
      const res = await fetch(`/api/posts/${post.id}/answer`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          comment_id: commentId,
        }),
      });

      const resData = await res.json();

      if (!res.ok) {
        throw new Error(resData.message || "Gagal menerima jawaban");
      }

      showNotification("Jawaban berhasil diterima!");
      await fetchPostDetails(false);
    } catch (err: any) {
      console.error("Accept answer error:", err);
      showNotification(err.message || "Terjadi kesalahan saat menerima jawaban.", "info");
    } finally {
      setAcceptingAnswerId(null);
    }
  };


  // ─── Vote handler (Post & Comment) ────────────────────────────────────────────
  const handleVote = async (targetId: string, voteType: "upvote" | "downvote", isComment: boolean = false) => {
    if (!post) return;

    const prevPost = post;

    // Optimistic Update logic
    if (!isComment) {
      const currentVoteType = post.user_vote_type;
      let newVoteType: string | null = voteType;
      let scoreDiff = 0;

      if (currentVoteType === voteType) {
        newVoteType = null;
        scoreDiff = voteType === "upvote" ? -1 : 1;
      } else if (currentVoteType === null) {
        scoreDiff = voteType === "upvote" ? 1 : -1;
      } else {
        scoreDiff = voteType === "upvote" ? 2 : -2;
      }

      setPost((prev) =>
        prev
          ? {
            ...prev,
            vote_score: prev.vote_score + scoreDiff,
            user_vote_type: newVoteType,
            user_has_voted: newVoteType !== null,
          }
          : prev
      );
    } else {
      let targetComment: Comment | undefined;
      for (const c of post.comments) {
        if (c.id === targetId) {
          targetComment = c;
          break;
        }
        if (c.replies) {
          const found = c.replies.find((r) => r.id === targetId);
          if (found) {
            targetComment = found;
            break;
          }
        }
      }

      if (!targetComment) return;

      const currentVoteType = targetComment.user_vote_type;
      let newVoteType: string | null = voteType;
      let scoreDiff = 0;

      if (currentVoteType === voteType) {
        newVoteType = null;
        scoreDiff = voteType === "upvote" ? -1 : 1;
      } else if (currentVoteType === null) {
        scoreDiff = voteType === "upvote" ? 1 : -1;
      } else {
        scoreDiff = voteType === "upvote" ? 2 : -2;
      }

      setPost((prev) => {
        if (!prev) return null;
        const updateReplies = (c: Comment): Comment => {
          if (c.id === targetId) {
            return {
              ...c,
              votes_count: c.votes_count + scoreDiff,
              user_vote_type: newVoteType,
              user_has_voted: newVoteType !== null,
            };
          }
          if (c.replies && c.replies.length > 0) {
            return {
              ...c,
              replies: c.replies.map(updateReplies),
            };
          }
          return c;
        };

        return {
          ...prev,
          comments: prev.comments.map(updateReplies),
        };
      });
    }

    try {
      const endpoint = voteType === "upvote" ? "/api/vote" : "/api/downvote";
      const payload = voteType === "upvote"
        ? { target_id: targetId, vote_type: voteType }
        : { target_id: targetId };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        console.error("Vote error:", data.message);
        setPost(prevPost);
        return;
      }

      const resData = await res.json();
      const actualScore = resData.vote_score ?? resData.data?.vote_score;
      const actualAction = resData.action;

      let actualVoteType: string | null = null;
      if (actualAction === "upvoted" || actualAction === "upvote") {
        actualVoteType = "upvote";
      } else if (actualAction === "downvoted" || actualAction === "downvote") {
        actualVoteType = "downvote";
      } else if (actualAction === "unvoted" || actualAction === "unvote") {
        actualVoteType = null;
      } else if (resData.data?.vote_type) {
        const vt = resData.data.vote_type;
        if (vt === "upvote" || vt === "upvoted") actualVoteType = "upvote";
        else if (vt === "downvote" || vt === "downvoted") actualVoteType = "downvote";
      }

      if (!isComment) {
        setPost((prev) =>
          prev
            ? {
              ...prev,
              vote_score: typeof actualScore === "number" ? actualScore : prev.vote_score,
              user_vote_type: actualVoteType,
              user_has_voted: actualVoteType !== null,
            }
            : prev
        );
      } else {
        setPost((prev) => {
          if (!prev) return null;
          const updateReplies = (c: Comment): Comment => {
            if (c.id === targetId) {
              return {
                ...c,
                votes_count: typeof actualScore === "number" ? actualScore : c.votes_count,
                user_vote_type: actualVoteType,
                user_has_voted: actualVoteType !== null,
              };
            }
            if (c.replies && c.replies.length > 0) {
              return {
                ...c,
                replies: c.replies.map(updateReplies),
              };
            }
            return c;
          };
          return {
            ...prev,
            comments: prev.comments.map(updateReplies),
          };
        });
      }
    } catch (error) {
      console.error("Vote API network error:", error);
      setPost(prevPost);
    }
  };

  // ─── Like / Unlike handler ────────────────────────────────────────────────────
  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!post) return;

    const isLiked = post.user_has_liked;
    const prevPost = post;

    // Optimistic update
    setPost((prev) =>
      prev
        ? {
          ...prev,
          likes_count: isLiked ? prev.likes_count - 1 : prev.likes_count + 1,
          user_has_liked: !isLiked,
        }
        : prev
    );

    try {
      if (isLiked) {
        const res = await fetch("/api/unlikes", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ target_id: post.id }),
        });
        if (!res.ok) {
          const data = await res.json();
          console.error("Unlike error:", data.message);
          setPost(prevPost);
        }
      } else {
        const res = await fetch("/api/likes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ target_id: post.id }),
        });
        if (!res.ok) {
          const data = await res.json();
          console.error("Like error:", data.message);
          setPost(prevPost);
        }
      }
    } catch (error) {
      console.error("Like/Unlike error:", error);
      setPost(prevPost);
    }
  };

  // ─── Bookmark / Unbookmark handler ────────────────────────────────────────────
  const handleBookmark = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!post) return;

    const isBookmarked = post.user_has_bookmarked;
    const prevPost = post;

    // Optimistic update
    setPost((prev) =>
      prev
        ? {
          ...prev,
          bookmarks_count: isBookmarked
            ? prev.bookmarks_count - 1
            : prev.bookmarks_count + 1,
          user_has_bookmarked: !isBookmarked,
          // Ensure bookmark_id is string or null
          bookmark_id: isBookmarked ? null : (prev.bookmark_id ?? null),
        }
        : prev
    );

    try {
      if (isBookmarked) {
        const bookmarkId = prevPost.bookmark_id;
        if (!bookmarkId) {
          console.error("Unbookmark error: bookmark_id tidak ditemukan");
          setPost(prevPost);
          return;
        }
        const res = await fetch(`/api/bookmark/${bookmarkId}`, {
          method: "DELETE",
        });
        if (!res.ok) {
          const data = await res.json();
          console.error("Unbookmark error:", data.message);
          setPost(prevPost);
        }
      } else {
        const res = await fetch("/api/bookmark", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ post_id: post.id }),
        });
        if (!res.ok) {
          const data = await res.json();
          console.error("Bookmark error:", data.message);
          setPost(prevPost);
          return;
        }
        const data = await res.json();
        const newBookmarkId = data.data?.id ?? data.data ?? null;
        setPost((prev) =>
          prev ? { ...prev, bookmark_id: newBookmarkId } : prev
        );
      }
    } catch (error) {
      console.error("Bookmark/Unbookmark error:", error);
      setPost(prevPost);
    }
  };

  // ─── Comment Like / Unlike handler ────────────────────────────────────────────
  const handleCommentLike = async (e: React.MouseEvent, commentId: string) => {
    e.stopPropagation();
    if (!post) return;

    let isLiked = false;
    let targetComment: Comment | undefined = post.comments.find((c) => c.id === commentId);

    if (!targetComment) {
      for (const c of post.comments) {
        if (c.replies) {
          const found = c.replies.find((r) => r.id === commentId);
          if (found) {
            targetComment = found;
            break;
          }
        }
      }
    }

    if (!targetComment) return;

    isLiked = targetComment.user_has_liked;
    const prevPost = post;

    // Optimistic update
    setPost((prev) => {
      if (!prev) return null;

      const updateComment = (c: Comment): Comment => {
        if (c.id === commentId) {
          return {
            ...c,
            likes_count: isLiked ? c.likes_count - 1 : c.likes_count + 1,
            user_has_liked: !isLiked,
          };
        }
        if (c.replies && c.replies.length > 0) {
          return {
            ...c,
            replies: c.replies.map(updateComment),
          };
        }
        return c;
      };

      return {
        ...prev,
        comments: prev.comments.map(updateComment),
      };
    });

    try {
      if (isLiked) {
        const res = await fetch("/api/unlikes", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ target_id: commentId }),
        });
        if (!res.ok) {
          const data = await res.json();
          console.error("Unlike comment error:", data.message);
          setPost(prevPost);
        }
      } else {
        const res = await fetch("/api/likes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ target_id: commentId }),
        });
        if (!res.ok) {
          const data = await res.json();
          console.error("Like comment error:", data.message);
          setPost(prevPost);
        }
      }
    } catch (error) {
      console.error("Like/Unlike comment error:", error);
      setPost(prevPost);
    }
  };

  // ─── Scroll to top on navigation ─────────────────────────────────────────────
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [id]);

  const isMounted = useRef(true);
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  // ─── Fetch post detail ───────────────────────────────────────────────────────
  const fetchPostDetails = async (showLoading = false) => {
    if (showLoading) setLoading(true);
    setError(null);
    try {
      // Hapus cache agar memaksa fetch data terbaru
      delete fetchCache[id];

      const res = await fetch(`/api/posts/${id}`);
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.message || "Post tidak ditemukan");
      }
      const json = await res.json();
      const postData: PostWithBookmark = (json.data ?? json) as any;

      try {
        const bookmarksRes = await fetch("/api/bookmark");
        if (bookmarksRes.ok) {
          const bookmarksJson = await bookmarksRes.json();
          const bookmarksList = bookmarksJson.data ?? [];
          const matchedBookmark = bookmarksList.find((b: any) => b.post_id === postData.id);
          if (matchedBookmark) {
            postData.bookmark_id = matchedBookmark.id;
          }
        }
      } catch (bookmarkErr) {
        console.error("Gagal mencocokkan bookmark_id:", bookmarkErr);
      }

      if (isMounted.current) {
        setPost(postData);
      }
    } catch (err: any) {
      console.error("Fetch post detail error:", err);
      if (isMounted.current) {
        setError(err.message || "Gagal memuat data. Silakan coba lagi.");
      }
    } finally {
      if (showLoading && isMounted.current) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchPostDetails(true);
  }, [id]);

  // ─── Quill editor for Edit Post form ─────────────────────────────────────────
  useEffect(() => {
    if (!isEditingPost || !editContainerRef.current) return;

    // Avoid double-init
    if (editQuillRef.current) return;

    import('quill').then(({ default: Quill }) => {
      if (!editContainerRef.current) return;

      const toolbarOptions = [
        [{ header: [1, 2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        ['blockquote', 'code-block'],
        [{ list: 'ordered' }, { list: 'bullet' }],
        ['link'],
        ['clean'],
      ];

      const quill = new Quill(editContainerRef.current, {
        theme: 'snow',
        placeholder: 'Tulis isi postingan di sini...',
        modules: { toolbar: toolbarOptions },
      });

      // Seed with existing body HTML
      quill.root.innerHTML = editPostBody;

      editQuillRef.current = quill;
    });

    return () => {
      if (editQuillRef.current) {
        editQuillRef.current = null;
      }
    };
  }, [isEditingPost]);

  // Close edit-tag suggestions on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('#edit-tags-input') && !target.closest('.edit-tag-suggestions')) {
        setEditShowTagSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ─── Add comment handler ──────────────────────────────────────────────────────
  const handleAddQuestionComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!post || !questionComment.trim() || submittingComment) return;

    if (!currentUser) {
      showNotification("Anda harus masuk (login) terlebih dahulu untuk memberikan komentar.", "info");
      return;
    }

    setSubmittingComment(true);
    try {
      const res = await fetch("/api/comment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          post_id: post.id,
          body: questionComment.trim(),
        }),
      });

      const resData = await res.json();

      if (!res.ok) {
        throw new Error(resData.message || "Gagal mengirim komentar");
      }

      setQuestionComment("");
      showNotification("Komentar berhasil ditambahkan!");
      await fetchPostDetails(false);
    } catch (err: any) {
      console.error("Submit comment error:", err);
      showNotification(err.message || "Terjadi kesalahan saat mengirim komentar.", "info");
    } finally {
      setSubmittingComment(false);
    }
  };

  // ─── Add reply handler ────────────────────────────────────────────────────────
  const handleSendReply = async (e: React.FormEvent, parentCommentId: string) => {
    e.preventDefault();
    if (!post || !replyBody.trim() || submittingReply) return;

    if (!currentUser) {
      showNotification("Anda harus masuk (login) terlebih dahulu untuk membalas komentar.", "info");
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
          post_id: post.id,
          parent_id: parentCommentId,
          body: replyBody.trim(),
        }),
      });

      const resData = await res.json();

      if (!res.ok) {
        throw new Error(resData.message || "Gagal mengirim balasan");
      }

      setReplyBody("");
      setReplyingToCommentId(null);
      showNotification("Balasan berhasil ditambahkan!");
      await fetchPostDetails(false);
    } catch (err: any) {
      console.error("Submit reply error:", err);
      showNotification(err.message || "Terjadi kesalahan saat mengirim balasan.", "info");
    } finally {
      setSubmittingReply(false);
    }
  };

  // ─── Edit comment handler ────────────────────────────────────────────────────────
  const handleEditComment = async (e: React.FormEvent, commentId: string) => {
    e.preventDefault();
    if (!post || !editBody.trim() || submittingEdit) return;

    setSubmittingEdit(true);
    try {
      const res = await fetch(`/api/comment/${commentId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          body: editBody.trim(),
        }),
      });

      const resData = await res.json();

      if (!res.ok) {
        throw new Error(resData.message || "Gagal mengedit komentar");
      }

      setEditingCommentId(null);
      setEditBody("");
      showNotification("Komentar berhasil diperbarui!");
      await fetchPostDetails(false);
    } catch (err: any) {
      console.error("Edit comment error:", err);
      showNotification(err.message || "Terjadi kesalahan saat mengedit komentar.", "info");
    } finally {
      setSubmittingEdit(false);
    }
  };

  // ─── Delete comment handler ──────────────────────────────────────────────────────
  const handleDeleteComment = async (commentId: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus komentar ini?")) return;

    setDeletingCommentId(commentId);
    try {
      const res = await fetch(`/api/comment/${commentId}`, {
        method: "DELETE",
      });

      const resData = await res.json();

      if (!res.ok) {
        throw new Error(resData.message || "Gagal menghapus komentar");
      }

      showNotification("Komentar berhasil dihapus!");
      await fetchPostDetails(false);
    } catch (err: any) {
      console.error("Delete comment error:", err);
      showNotification(err.message || "Terjadi kesalahan saat menghapus komentar.", "info");
    } finally {
      setDeletingCommentId(null);
    }
  };

  // ─── Loading state ────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center py-32 gap-2 text-zinc-400">
        <Loader2 className="h-5 w-5 animate-spin" />
        <span className="text-sm">Memuat pertanyaan...</span>
      </div>
    );
  }

  // ─── Error state ──────────────────────────────────────────────────────────────
  if (error || !post) {
    return (
      <div className="p-12 text-center space-y-3">
        <div className="mx-auto w-12 h-12 rounded-full bg-red-50 dark:bg-red-950/20 flex items-center justify-center">
          <AlertCircle className="h-6 w-6 text-red-400" />
        </div>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          {error || "Pertanyaan tidak ditemukan atau telah dihapus."}
        </p>
        <button
          onClick={() => router.push("/homepage")}
          className="text-xs text-brand-blue underline cursor-pointer"
        >
          Kembali ke Beranda
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* BACK LINK */}
      <Link
        href="/homepage"
        className="flex items-center gap-1.5 text-xs sm:text-sm text-zinc-500 hover:text-brand-blue dark:text-zinc-400 dark:hover:text-blue-400 transition-colors py-1 cursor-pointer"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Kembali ke Beranda</span>
      </Link>

      {/* TITLE + META */}
      <div className="pb-5 border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex justify-between items-start gap-4">
          <h1 className="text-xl sm:text-3xl font-bold text-zinc-900 dark:text-white leading-tight">
            {post.title}
          </h1>
          <div className="flex items-center gap-2 shrink-0">
            {isPostOwnerOrAdmin && !isEditingPost && (
              <button
                onClick={() => {
                  setIsEditingPost(true);
                  setEditPostTitle(post.title);
                  setEditPostBody(post.body);
                  setEditPostCategorySlug(post.category?.slug || "");
                  // Pre-populate selected tags from post.tags (objects with id+name+color)
                  const existingTags: any[] = (post.tags ?? []).map((t: any) =>
                    typeof t === 'object' ? t : { id: t, name: t, color: '#3b82f6' }
                  );
                  setEditSelectedTags(existingTags);
                  setEditTagInputValue('');
                  setEditPostReason("");
                  if (categories.length === 0) fetchCategories();
                  fetchEditTags();
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-855 border border-zinc-200 dark:border-zinc-800 hover:text-brand-blue text-xs font-semibold rounded-lg text-zinc-600 dark:text-zinc-350 transition-colors cursor-pointer shrink-0"
                title="Edit Postingan"
              >
                <Edit2 className="h-3.5 w-3.5" />
                <span>Edit</span>
              </button>
            )}

            {isPostOwnerOrAdmin && post.status !== "closed" && !isEditingPost && (
              <button
                onClick={handleClosePost}
                disabled={closingPost}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-50 hover:bg-red-100 dark:bg-red-950/20 dark:hover:bg-red-900/30 border border-red-200 dark:border-red-900/40 text-red-600 dark:text-red-400 text-xs font-semibold rounded-lg transition-colors cursor-pointer disabled:opacity-50 shrink-0"
                title="Tutup Postingan"
              >
                {closingPost ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <AlertCircle className="h-3.5 w-3.5" />
                )}
                <span>Tutup</span>
              </button>
            )}

            {canDeletePost && !isEditingPost && (
              <button
                onClick={handleDeletePost}
                disabled={deletingPost}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-50 hover:bg-red-100 dark:bg-red-950/20 dark:hover:bg-red-900/30 border border-red-200 dark:border-red-900/40 text-red-600 dark:text-red-400 text-xs font-semibold rounded-lg transition-colors cursor-pointer disabled:opacity-50 shrink-0"
                title="Hapus Postingan"
              >
                {deletingPost ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Trash2 className="h-3.5 w-3.5" />
                )}
                <span>Hapus</span>
              </button>
            )}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-3.5 text-xs text-zinc-500 dark:text-zinc-400 font-mono">
          <span>
            Ditanyakan:{" "}
            <strong className="text-zinc-700 dark:text-zinc-300 font-sans">
              {formatDate(post.created_at)}
            </strong>
          </span>
          <span className="flex items-center gap-1">
            <Eye className="h-3 w-3" />
            <strong className="text-zinc-700 dark:text-zinc-300 font-sans">
              {post.view_count.toLocaleString()} kali
            </strong>
          </span>
          <span className="flex items-center gap-1">
            <MessageSquare className="h-3 w-3" />
            <strong className="text-zinc-700 dark:text-zinc-300 font-sans">
              {post.comments_count} komentar
            </strong>
          </span>
          {post.is_answered === 1 && (
            <span className="flex items-center gap-1 text-green-600 bg-green-500/10 px-2 py-0.5 rounded-full font-semibold">
              <CheckCircle2 className="h-3 w-3" />
              Terjawab
            </span>
          )}
          {post.status === "closed" && (
            <span className="flex items-center gap-1 text-red-600 bg-red-500/10 px-2 py-0.5 rounded-full font-semibold">
              <AlertCircle className="h-3 w-3" />
              Ditutup
            </span>
          )}
        </div>
      </div>

      {/* BODY */}
      <div className="flex gap-4 sm:gap-6">
        {/* VOTE + ACTIONS SIDEBAR */}
        <div className="flex flex-col items-center gap-1.5 text-center shrink-0">
          {/* Vote up */}
          <button
            onClick={() => handleVote(post.id, "upvote")}
            className={`p-1.5 rounded-full transition-colors cursor-pointer ${post.user_vote_type === "upvote"
              ? "text-brand-blue bg-brand-blue/10"
              : "text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-950 hover:text-brand-blue"
              }`}
            title="Sangat berkontribusi (Mendukung)"
          >
            <ChevronUp className="h-8 w-8 stroke-[2.5]" />
          </button>
          <span className="text-lg font-bold font-mono text-zinc-800 dark:text-zinc-200">
            {post.vote_score}
          </span>
          {/* Vote down */}
          <button
            onClick={() => handleVote(post.id, "downvote")}
            className={`p-1.5 rounded-full transition-colors cursor-pointer ${post.user_vote_type === "downvote"
              ? "text-red-500 bg-red-500/10"
              : "text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-950 hover:text-red-500"
              }`}
            title="Kurang berkontribusi (Menolak)"
          >
            <ChevronDown className="h-8 w-8 stroke-[2.5]" />
          </button>

          {/* Like */}
          <button
            onClick={handleLike}
            className={`mt-2 transition-colors cursor-pointer ${post.user_has_liked
              ? "text-red-500"
              : "text-zinc-300 hover:text-red-400 dark:text-zinc-600"
              }`}
            title="Like pertanyaan ini"
          >
            <Heart
              className="h-5 w-5"
              fill={post.user_has_liked ? "currentColor" : "none"}
            />
          </button>
          <span className="text-[10px] font-mono text-zinc-400">
            {post.likes_count}
          </span>

          {/* Bookmark */}
          <button
            onClick={handleBookmark}
            className={`mt-1 transition-colors cursor-pointer ${post.user_has_bookmarked
              ? "text-yellow-500"
              : "text-zinc-300 hover:text-yellow-400 dark:text-zinc-600"
              }`}
            title="Bookmark pertanyaan ini"
          >
            <Bookmark
              className="h-5 w-5"
              fill={post.user_has_bookmarked ? "currentColor" : "none"}
            />
          </button>
          <span className="text-[10px] font-mono text-zinc-400">
            {post.bookmarks_count}
          </span>
        </div>

        {/* CONTENT */}
        <div className="flex-1 min-w-0 pr-1 sm:pr-2">
          {isEditingPost ? (
            <form onSubmit={handleEditPost} className="space-y-4 bg-zinc-50/50 dark:bg-zinc-900/20 p-5 rounded-xl border border-zinc-200 dark:border-zinc-800">
              <h3 className="text-base font-bold text-zinc-850 dark:text-zinc-150">Edit Postingan</h3>
              
              {/* Title */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider">Judul Postingan</label>
                <input
                  type="text"
                  value={editPostTitle}
                  onChange={(e) => setEditPostTitle(e.target.value)}
                  disabled={submittingEditPost}
                  className="w-full rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-2.5 text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-1.5 focus:ring-brand-blue/40 transition-all"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Category */}
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider">Kategori</label>
                  <select
                    value={editPostCategorySlug}
                    onChange={(e) => setEditPostCategorySlug(e.target.value)}
                    disabled={submittingEditPost}
                    className="w-full rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-2.5 text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-1.5 focus:ring-brand-blue/40 transition-all"
                    required
                  >
                    <option value="">Pilih Kategori</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.slug}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Tags — dynamic selector */}
                <div className="space-y-2 relative">
                  <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider">Tags</label>

                  {/* Selected tag chips */}
                  {editSelectedTags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pb-1">
                      {editSelectedTags.map((tag) => (
                        <span
                          key={tag.id}
                          className="inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded font-mono font-bold border"
                          style={{
                            backgroundColor: `${tag.color || '#3b82f6'}15`,
                            color: tag.color || '#3b82f6',
                            borderColor: `${tag.color || '#3b82f6'}30`,
                          }}
                        >
                          #{tag.name}
                          <button
                            type="button"
                            onClick={() => handleEditRemoveTag(tag.id)}
                            className="hover:bg-black/10 dark:hover:bg-white/10 rounded-full p-0.5 transition-colors cursor-pointer"
                          >
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Tag search input */}
                  <div className="relative">
                    <input
                      id="edit-tags-input"
                      type="text"
                      placeholder={editSelectedTags.length >= 5 ? 'Maks. 5 tag' : 'Cari tag atau buat tag baru...'}
                      value={editTagInputValue}
                      onChange={(e) => { setEditTagInputValue(e.target.value); setEditShowTagSuggestions(true); }}
                      onFocus={() => setEditShowTagSuggestions(true)}
                      disabled={submittingEditPost || editCreatingTag || editSelectedTags.length >= 5}
                      className="w-full rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-2.5 text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-1.5 focus:ring-brand-blue/40 transition-all disabled:opacity-50"
                    />

                    {/* Suggestions dropdown */}
                    {editShowTagSuggestions && (editTagInputValue.trim() !== '' || editFilteredSuggestions.length > 0) && (
                      <div className="edit-tag-suggestions absolute z-50 w-full mt-1.5 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-lg max-h-52 overflow-y-auto divide-y divide-zinc-100 dark:divide-zinc-900">
                        {editFilteredSuggestions.map((tag) => (
                          <button
                            key={tag.id}
                            type="button"
                            onClick={() => handleEditAddExistingTag(tag)}
                            className="w-full text-left px-4 py-2 text-xs hover:bg-zinc-50 dark:hover:bg-zinc-900/50 flex justify-between items-center cursor-pointer transition-colors"
                          >
                            <span className="font-mono font-bold" style={{ color: tag.color || '#3b82f6' }}>#{tag.name}</span>
                            <span className="text-[10px] text-zinc-400 font-mono">Digunakan {tag.usage_count || 0}×</span>
                          </button>
                        ))}

                        {editTagInputValue.trim() !== '' && !editIsInputExactMatch && (
                          <button
                            type="button"
                            onClick={() => handleEditAddNewTag(editTagInputValue)}
                            disabled={editCreatingTag}
                            className="w-full text-left px-4 py-2.5 text-xs text-brand-blue hover:bg-brand-blue/5 flex items-center justify-between cursor-pointer transition-colors font-semibold"
                          >
                            <span className="flex items-center gap-1.5">
                              {editCreatingTag ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <span className="text-sm">+</span>}
                              <span>Buat tag baru: &ldquo;{editTagInputValue.trim()}&rdquo;</span>
                            </span>
                            <span className="text-[10px] text-zinc-400 uppercase tracking-widest font-mono">Baru</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                  <p className="text-[10px] text-zinc-400">Maks. 5 tag · Pilih dari daftar atau buat tag baru</p>
                </div>
              </div>

              {/* Body */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider">Isi Postingan</label>
                <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden quill-edit-wrapper">
                  <div ref={editContainerRef} />
                </div>
              </div>

              {/* Reason */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider">Alasan Perubahan (Opsional)</label>
                <input
                  type="text"
                  placeholder="Contoh: Memperbaiki typo pada paragraf kedua"
                  value={editPostReason}
                  onChange={(e) => setEditPostReason(e.target.value)}
                  disabled={submittingEditPost}
                  className="w-full rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-2.5 text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-1.5 focus:ring-brand-blue/40 transition-all"
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  disabled={submittingEditPost}
                  className="bg-brand-blue hover:bg-brand-blue-hover text-white text-xs font-semibold px-4 py-2 rounded-lg shadow-sm hover:shadow flex items-center gap-2 cursor-pointer transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submittingEditPost && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  <span>Simpan Perubahan</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditingPost(false)}
                  disabled={submittingEditPost}
                  className="border border-zinc-200 dark:border-zinc-800 text-zinc-650 dark:text-zinc-350 bg-white dark:bg-zinc-950 text-xs font-semibold px-4 py-2 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-900 cursor-pointer"
                >
                  Batal
                </button>
              </div>
            </form>
          ) : (
            <>
              <div className="ql-snow">
                {renderQuillBody(post.body)}
              </div>

          {/* TAGS */}
          {post.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-5">
              {post.tags.map((tag: any) => (
                <span
                  key={tag.id ?? tag}
                  className="text-[11px] px-2.5 py-1 rounded font-mono font-semibold border bg-white dark:bg-zinc-950"
                  style={{
                    borderColor: tag.color || '#3b82f6',
                    color: tag.color || '#3b82f6',
                  }}
                >
                  #{tag.name ?? tag}
                </span>
              ))}
            </div>
          )}

          {/* CATEGORY */}
          <div className="mt-3">
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400">
              {post.category.name}
            </span>
          </div>

          {/* AUTHOR CARD */}
          <div className="flex justify-end gap-4 mt-6">
            <div className="w-56 bg-zinc-100/60 dark:bg-zinc-900/40 p-3 rounded-lg border border-zinc-200/40 dark:border-zinc-800">
              <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-mono block mb-1">
                Ditanyakan {formatDate(post.created_at)}
              </span>
              <div className="flex items-center gap-2">
                {post.user.avatar_url ? (
                  <img
                    src={resolveAvatar(post.user.avatar_url)}
                    alt={post.user.username}
                    className="h-8 w-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-brand-blue text-white flex items-center justify-center font-bold text-sm shadow-inner uppercase shrink-0">
                    {post.user.username ? post.user.username.charAt(0) : '?'}
                  </div>
                )}
                <div className="text-left">
                  <span className="block text-xs font-bold text-zinc-700 dark:text-zinc-200">
                    {post.user.username}
                  </span>
                  <div className="flex items-center gap-1 text-[11px] text-zinc-500 font-mono">
                    <Award className="h-3 w-3 text-brand-blue" />
                    <span>{post.user.reputation_points.toLocaleString()} rep</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  </div>

      {/* ADD ANSWER / COMMENT FORM */}
      <div className="mt-8 pt-6 border-t border-zinc-200 dark:border-zinc-850 space-y-4">
        <h3 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-white">
          Tambahkan Komentar Anda
        </h3>

        <form onSubmit={handleAddQuestionComment} className="space-y-4">
          <textarea
            id="answer-body-textarea"
            rows={7}
            placeholder={
              currentUser
                ? "Tuliskan komentar anda..."
                : "Silakan masuk (login) terlebih dahulu untuk menulis komentar..."
            }
            value={questionComment}
            onChange={(e) => setQuestionComment(e.target.value)}
            disabled={submittingComment || !currentUser}
            className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-4 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-brand-blue/50 focus:border-brand-blue transition-all duration-150 disabled:opacity-60 disabled:cursor-not-allowed"
            required
          />
          <button
            id="btn-submit-answer"
            type="submit"
            disabled={submittingComment || !currentUser}
            className="bg-brand-blue hover:bg-brand-blue-hover text-white text-sm font-semibold px-5 py-2.5 rounded-lg shadow-sm hover:shadow active:scale-98 cursor-pointer transition-all duration-150 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submittingComment && <Loader2 className="h-4 w-4 animate-spin" />}
            <span>Kirim Komentar Anda</span>
          </button>
        </form>

        {/* COMMENTS */}
        <div className="mt-8 pt-4 border-t border-zinc-100 dark:border-zinc-900/60 space-y-3.5">
          <h4 className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
            <MessageSquare className="h-3.5 w-3.5" />
            <span>
              Komentar Pertanyaan (
              {post.comments.filter((c: Comment) => !c.parent_id).reduce((acc: number, c: Comment) => acc + 1 + (c.replies?.length || 0), 0)}
              )
            </span>
          </h4>

          {post.comments.filter((c: Comment) => !c.parent_id).length > 0 && (
            <div className="divide-y divide-zinc-100 dark:divide-zinc-900 pl-3 sm:pl-4 border-l-2 border-zinc-200 dark:border-zinc-800 space-y-4 pb-2">
              {post.comments
                .filter((c: Comment) => !c.parent_id)
                .map((comm: Comment) => (
                  <div key={comm.id} className="pt-4 first:pt-0 pb-2 space-y-4">
                    {/* Parent Comment Card */}
                    <div className="group flex gap-3 text-xs text-zinc-650 dark:text-zinc-350 leading-relaxed font-sans">
                      {/* VOTES & LIKE COLUMN */}
                      <div className="flex flex-col items-center gap-0.5 text-center shrink-0 pt-0.5 min-w-[24px]">
                        <button
                          onClick={() => handleVote(comm.id, "upvote", true)}
                          disabled={currentUser?.id === comm.user_id}
                          className={`p-0.5 rounded-full transition-colors ${
                            currentUser?.id === comm.user_id
                              ? "text-zinc-300 dark:text-zinc-700 cursor-not-allowed opacity-50"
                              : comm.user_vote_type === "upvote"
                              ? "text-brand-blue bg-brand-blue/10 cursor-pointer"
                              : "text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-brand-blue cursor-pointer"
                          }`}
                          title={currentUser?.id === comm.user_id ? "Anda tidak dapat memberikan upvote pada komentar Anda sendiri" : "Sangat membantu (Mendukung)"}
                        >
                          <ChevronUp className="h-4 w-4 stroke-[3.0]" />
                        </button>
                        <span className="text-[10px] font-bold font-mono text-zinc-700 dark:text-zinc-300">
                          {comm.votes_count}
                        </span>
                        <button
                          onClick={() => handleVote(comm.id, "downvote", true)}
                          disabled={currentUser?.id === comm.user_id}
                          className={`p-0.5 rounded-full transition-colors ${
                            currentUser?.id === comm.user_id
                              ? "text-zinc-300 dark:text-zinc-700 cursor-not-allowed opacity-50"
                              : comm.user_vote_type === "downvote"
                              ? "text-red-500 bg-red-500/10 cursor-pointer"
                              : "text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-red-500 cursor-pointer"
                          }`}
                          title={currentUser?.id === comm.user_id ? "Anda tidak dapat memberikan downvote pada komentar Anda sendiri" : "Kurang membantu (Menolak)"}
                        >
                          <ChevronDown className="h-4 w-4 stroke-[3.0]" />
                        </button>

                        <button
                          onClick={(e) => handleCommentLike(e, comm.id)}
                          className={`mt-1 p-0.5 rounded-full cursor-pointer transition-colors ${comm.user_has_liked
                            ? "text-red-500"
                            : "text-zinc-400 hover:text-red-550 dark:text-zinc-500"
                            }`}
                          title="Like komentar ini"
                        >
                          <Heart
                            className="h-3.5 w-3.5"
                            fill={comm.user_has_liked ? "currentColor" : "none"}
                          />
                        </button>
                        <span className="text-[9px] font-mono text-zinc-450 dark:text-zinc-500">
                          {comm.likes_count}
                        </span>
                      </div>

                      {/* COMMENT CONTENT COLUMN */}
                      <div className="flex-1 min-w-0 pt-0.5 flex flex-col">
                        {/* User Card (Kiri Atas & Tombol Solusi Kanan) */}
                        <div className="flex items-center justify-between mb-2 w-full">
                          <div className="flex items-center gap-2">
                            {comm.user.avatar_url ? (
                              <img
                                src={resolveAvatar(comm.user.avatar_url)}
                                alt={comm.user.username}
                                className="h-6 w-6 rounded-full object-cover"
                              />
                            ) : (
                              <div className="h-6 w-6 rounded-full bg-brand-blue text-white flex items-center justify-center font-bold text-[10px] shadow-inner uppercase shrink-0">
                                {comm.user.username ? comm.user.username.charAt(0) : '?'}
                              </div>
                            )}
                            <span className="font-bold text-zinc-850 dark:text-zinc-200">
                              {comm.user.username}
                            </span>
                          </div>

                          {/* MARK AS ANSWER BUTTON */}
                          {isPostOwner && comm.user_id !== post.user_id && (
                            <div className="flex items-center gap-1 shrink-0">
                              {comm.is_accepted === 1 ? (
                                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded font-sans">
                                  ✓ Solusi Disepakati
                                </span>
                              ) : (
                                !hasAcceptedAnswer && (
                                  <button
                                    type="button"
                                    onClick={() => handleAcceptAnswer(comm.id)}
                                    disabled={acceptingAnswerId === comm.id}
                                    className="inline-flex items-center gap-1 text-[10px] font-bold text-zinc-400 hover:text-emerald-600 dark:text-zinc-500 dark:hover:text-emerald-400 transition-colors cursor-pointer disabled:opacity-50 shrink-0"
                                    title="Tandai sebagai solusi/jawaban terbaik"
                                  >
                                    {acceptingAnswerId === comm.id ? (
                                      <Loader2 className="h-3 w-3 animate-spin" />
                                    ) : (
                                      <Check className="h-3.5 w-3.5" />
                                    )}
                                    <span>Tandai Solusi</span>
                                  </button>
                                )
                              )}
                            </div>
                          )}
                          {!isPostOwner && comm.is_accepted === 1 && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded font-sans shrink-0">
                              ✓ Solusi Disepakati
                            </span>
                          )}
                        </div>

                        {/* Comment Body */}
                        {editingCommentId === comm.id ? (
                          <form onSubmit={(e) => handleEditComment(e, comm.id)} className="mt-1 space-y-2.5 pl-0.5">
                            <textarea
                              rows={3}
                              value={editBody}
                              onChange={(e) => setEditBody(e.target.value)}
                              disabled={submittingEdit}
                              className="w-full rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 p-3 text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-1.5 focus:ring-brand-blue/40 transition-all disabled:opacity-60"
                              required
                              autoFocus
                            />
                            <div className="flex gap-2">
                              <button type="submit" disabled={submittingEdit} className="bg-brand-blue hover:bg-brand-blue-hover text-white text-[11px] font-semibold px-3 py-1.5 rounded flex items-center gap-1.5 cursor-pointer">
                                {submittingEdit && <Loader2 className="h-3 w-3 animate-spin" />}
                                <span>Simpan</span>
                              </button>
                              <button type="button" onClick={() => setEditingCommentId(null)} className="border border-zinc-200 dark:border-zinc-855 text-zinc-650 bg-white dark:bg-zinc-950 text-[11px] font-semibold px-3 py-1.5 rounded hover:bg-zinc-50 cursor-pointer">
                                Batal
                              </button>
                            </div>
                          </form>
                        ) : (
                          <div className="ql-snow pl-0.5">
                            {renderQuillBody(comm.body)}
                          </div>
                        )}

                        {/* Date & Reply Action (Di Bawah Komen) */}
                        <div className="flex items-center gap-3 mt-2 pl-0.5 text-[10px] text-zinc-455 dark:text-zinc-500">
                          <span className="font-mono">{formatDate(comm.created_at)}</span>
                          <span>•</span>
                          <button
                            type="button"
                            onClick={() => {
                              if (replyingToCommentId === comm.id) {
                                setReplyingToCommentId(null);
                                setReplyBody("");
                              } else {
                                setReplyingToCommentId(comm.id);
                                setReplyBody("");
                                setEditingCommentId(null);
                              }
                            }}
                            className="hover:text-brand-blue cursor-pointer font-sans font-bold transition-colors"
                          >
                            {replyingToCommentId === comm.id ? "Batal" : "Balas"}
                          </button>
                          {currentUser?.id === comm.user_id && (
                            <>
                              <span>•</span>
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingCommentId(comm.id);
                                  setEditBody(comm.body);
                                  setReplyingToCommentId(null);
                                }}
                                className="hover:text-brand-blue cursor-pointer font-sans font-bold transition-colors flex items-center gap-1"
                              >
                                <Edit2 className="h-3 w-3" />
                                <span>Edit</span>
                              </button>
                            </>
                          )}
                          {isAdminOrModerator && (
                            <>
                              <span>•</span>
                              <button
                                type="button"
                                onClick={() => handleDeleteComment(comm.id)}
                                disabled={deletingCommentId === comm.id}
                                className="hover:text-red-500 cursor-pointer font-sans font-bold transition-colors flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {deletingCommentId === comm.id ? (
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                ) : (
                                  <Trash2 className="h-3 w-3" />
                                )}
                                <span>Hapus</span>
                              </button>
                            </>
                          )}
                        </div>

                        {/* Inline Reply Form */}
                        {replyingToCommentId === comm.id && (
                          <form
                            onSubmit={(e) => handleSendReply(e, comm.id)}
                            className="mt-3 pl-0.5 space-y-2.5"
                          >
                            <textarea
                              rows={3}
                              placeholder={
                                currentUser
                                  ? `Balas komentar @${comm.user.username}...`
                                  : "Silakan masuk (login) terlebih dahulu untuk membalas..."
                              }
                              value={replyBody}
                              onChange={(e) => setReplyBody(e.target.value)}
                              disabled={submittingReply || !currentUser}
                              className="w-full rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 p-3 text-xs text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-1.5 focus:ring-brand-blue/40 focus:border-brand-blue transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                              required
                              autoFocus
                            />
                            <div className="flex gap-2">
                              <button
                                type="submit"
                                disabled={submittingReply || !currentUser}
                                className="bg-brand-blue hover:bg-brand-blue-hover text-white text-[11px] font-semibold px-3 py-1.5 rounded shadow-sm flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                              >
                                {submittingReply && <Loader2 className="h-3 w-3 animate-spin" />}
                                <span>Kirim Balasan</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setReplyingToCommentId(null);
                                  setReplyBody("");
                                }}
                                className="border border-zinc-200 dark:border-zinc-850 text-zinc-650 dark:text-zinc-350 bg-white dark:bg-zinc-950 text-[11px] font-semibold px-3 py-1.5 rounded hover:bg-zinc-50 dark:hover:bg-zinc-900 cursor-pointer"
                              >
                                Batal
                              </button>
                            </div>
                          </form>
                        )}
                      </div>
                    </div>

                    {/* Nested Replies */}
                    {comm.replies && comm.replies.length > 0 && (
                      <div className="ml-6 sm:ml-10 pl-4 border-l border-zinc-200 dark:border-zinc-800 space-y-3.5 mt-2">
                        {comm.replies.map((reply: Comment) => (
                          <div
                            key={reply.id}
                            className="group flex gap-3 text-xs text-zinc-650 dark:text-zinc-350 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800/80 bg-zinc-50/30 dark:bg-zinc-900/10 leading-relaxed font-sans"
                          >
                            {/* VOTES COLUMN FOR REPLY */}
                            <div className="flex flex-col items-center gap-0.5 text-center shrink-0 pt-0.5 min-w-[24px]">
                              <button
                                onClick={() => handleVote(reply.id, "upvote", true)}
                                disabled={currentUser?.id === reply.user_id}
                                className={`p-0.5 rounded-full transition-colors ${
                                  currentUser?.id === reply.user_id
                                    ? "text-zinc-300 dark:text-zinc-700 cursor-not-allowed opacity-50"
                                    : reply.user_vote_type === "upvote"
                                    ? "text-brand-blue bg-brand-blue/10 cursor-pointer"
                                    : "text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-brand-blue cursor-pointer"
                                }`}
                                title={currentUser?.id === reply.user_id ? "Anda tidak dapat memberikan upvote pada balasan Anda sendiri" : "Sangat membantu (Mendukung)"}
                              >
                                <ChevronUp className="h-4 w-4 stroke-[3.0]" />
                              </button>
                              <span className="text-[10px] font-bold font-mono text-zinc-700 dark:text-zinc-300">
                                {reply.votes_count}
                              </span>
                              <button
                                onClick={() => handleVote(reply.id, "downvote", true)}
                                disabled={currentUser?.id === reply.user_id}
                                className={`p-0.5 rounded-full transition-colors ${
                                  currentUser?.id === reply.user_id
                                    ? "text-zinc-300 dark:text-zinc-700 cursor-not-allowed opacity-50"
                                    : reply.user_vote_type === "downvote"
                                    ? "text-red-500 bg-red-500/10 cursor-pointer"
                                    : "text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-red-550 cursor-pointer"
                                }`}
                                title={currentUser?.id === reply.user_id ? "Anda tidak dapat memberikan downvote pada balasan Anda sendiri" : "Kurang membantu (Menolak)"}
                              >
                                <ChevronDown className="h-4 w-4 stroke-[3.0]" />
                              </button>

                              <button
                                onClick={(e) => handleCommentLike(e, reply.id)}
                                className={`mt-1 p-0.5 rounded-full cursor-pointer transition-colors ${reply.user_has_liked
                                  ? "text-red-500"
                                  : "text-zinc-400 hover:text-red-555 dark:text-zinc-500"
                                  }`}
                                title="Like balasan ini"
                              >
                                <Heart
                                  className="h-3.5 w-3.5"
                                  fill={reply.user_has_liked ? "currentColor" : "none"}
                                />
                              </button>
                              <span className="text-[9px] font-mono text-zinc-450 dark:text-zinc-500">
                                {reply.likes_count}
                              </span>
                            </div>

                            {/* REPLY CONTENT COLUMN */}
                            <div className="flex-1 min-w-0 pt-0.5 flex flex-col">
                              {/* User details */}
                              <div className="flex items-center justify-between mb-2 w-full">
                                <div className="flex items-center gap-2">
                                  {reply.user.avatar_url ? (
                                    <img
                                      src={resolveAvatar(reply.user.avatar_url)}
                                      alt={reply.user.username}
                                      className="h-6 w-6 rounded-full object-cover"
                                    />
                                  ) : (
                                    <div className="h-6 w-6 rounded-full bg-brand-blue text-white flex items-center justify-center font-bold text-[10px] shadow-inner uppercase shrink-0">
                                      {reply.user.username ? reply.user.username.charAt(0) : '?'}
                                    </div>
                                  )}
                                  <span className="font-bold text-zinc-850 dark:text-zinc-200">
                                    {reply.user.username}
                                  </span>
                                </div>

                                {/* Mark as solution checkmark */}
                                {isPostOwner && reply.user_id !== post.user_id && (
                                  <div className="flex items-center gap-1 shrink-0">
                                    {reply.is_accepted === 1 ? (
                                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded font-sans">
                                        ✓ Solusi Disepakati
                                      </span>
                                    ) : (
                                      !hasAcceptedAnswer && (
                                        <button
                                          type="button"
                                          onClick={() => handleAcceptAnswer(reply.id)}
                                          disabled={acceptingAnswerId === reply.id}
                                          className="inline-flex items-center gap-1 text-[10px] font-bold text-zinc-400 hover:text-emerald-600 dark:text-zinc-500 dark:hover:text-emerald-400 transition-colors cursor-pointer disabled:opacity-50 shrink-0"
                                          title="Tandai sebagai solusi/jawaban terbaik"
                                        >
                                          {acceptingAnswerId === reply.id ? (
                                            <Loader2 className="h-3 w-3 animate-spin" />
                                          ) : (
                                            <Check className="h-3.5 w-3.5" />
                                          )}
                                          <span>Tandai Solusi</span>
                                        </button>
                                      )
                                    )}
                                  </div>
                                )}
                                {!isPostOwner && reply.is_accepted === 1 && (
                                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded font-sans shrink-0">
                                    ✓ Solusi Disepakati
                                  </span>
                                )}
                              </div>

                              {/* Reply body */}
                              {editingCommentId === reply.id ? (
                                <form onSubmit={(e) => handleEditComment(e, reply.id)} className="mt-1 space-y-2.5 pl-0.5">
                                  <textarea
                                    rows={3}
                                    value={editBody}
                                    onChange={(e) => setEditBody(e.target.value)}
                                    disabled={submittingEdit}
                                    className="w-full rounded-lg border border-zinc-200 dark:border-zinc-850 bg-zinc-50 dark:bg-zinc-900/50 p-3 text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-1.5 focus:ring-brand-blue/40 transition-all disabled:opacity-60"
                                    required
                                    autoFocus
                                  />
                                  <div className="flex gap-2">
                                    <button type="submit" disabled={submittingEdit} className="bg-brand-blue hover:bg-brand-blue-hover text-white text-[11px] font-semibold px-3 py-1.5 rounded flex items-center gap-1.5 cursor-pointer">
                                      {submittingEdit && <Loader2 className="h-3 w-3 animate-spin" />}
                                      <span>Simpan</span>
                                    </button>
                                    <button type="button" onClick={() => setEditingCommentId(null)} className="border border-zinc-200 dark:border-zinc-850 text-zinc-650 bg-white dark:bg-zinc-950 text-[11px] font-semibold px-3 py-1.5 rounded hover:bg-zinc-50 cursor-pointer">
                                      Batal
                                    </button>
                                  </div>
                                </form>
                              ) : (
                                <div className="ql-snow pl-0.5">
                                  {renderQuillBody(reply.body)}
                                </div>
                              )}

                              {/* Reply actions */}
                              <div className="flex items-center gap-3 mt-2 pl-0.5 text-[10px] text-zinc-455 dark:text-zinc-500">
                                <span className="font-mono">{formatDate(reply.created_at)}</span>
                                {currentUser?.id === reply.user_id && (
                                  <>
                                    <span>•</span>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setEditingCommentId(reply.id);
                                        setEditBody(reply.body);
                                        setReplyingToCommentId(null);
                                      }}
                                      className="hover:text-brand-blue cursor-pointer font-sans font-bold transition-colors flex items-center gap-1"
                                    >
                                      <Edit2 className="h-3 w-3" />
                                      <span>Edit</span>
                                    </button>
                                  </>
                                )}
                                {isAdminOrModerator && (
                                  <>
                                    <span>•</span>
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteComment(reply.id)}
                                      disabled={deletingCommentId === reply.id}
                                      className="hover:text-red-500 cursor-pointer font-sans font-bold transition-colors flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                      {deletingCommentId === reply.id ? (
                                        <Loader2 className="h-3 w-3 animate-spin" />
                                      ) : (
                                        <Trash2 className="h-3 w-3" />
                                      )}
                                      <span>Hapus</span>
                                    </button>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
