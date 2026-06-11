"use client";

import { useState } from "react";

// --- Types ---
interface Post {
  id: string;
  user_id: string;
  category_id: string;
  title: string;
  body: string;
  status: "open" | "closed" | "answered";
  view_count: number;
  vote_score: number;
  is_answered: number;
  accepted_answer_id: string | null;
  created_at: string;
  updated_at: string;
}

interface Bookmark {
  id: string;
  user_id: string;
  post_id: string;
  created_at: string;
  post: Post;
}

interface BookmarksResponse {
  message: string;
  data: Bookmark[];
}

// --- Mock Data ---
const mockData: BookmarksResponse = {
  message: "Bookmarks retrieved successfully",
  data: [
    {
      id: "2553920e-63c9-4f67-9cb1-5358b078e51f",
      user_id: "b6698191-8a48-4073-9cfe-d5f1f3e96b08",
      post_id: "20c2029f-27ca-4610-b46f-3405f6ef2dc0",
      created_at: "2026-06-05 08:04:03",
      post: {
        id: "20c2029f-27ca-4610-b46f-3405f6ef2dc0",
        user_id: "33119eac-b64e-40bf-a8b3-81b5a4cd8ddf",
        category_id: "709bb650-b0bc-4f4e-ae8b-1560d5d49809",
        title: "Cara Belajar Laravel untuk Pemula",
        body: "Laravel adalah framework PHP yang sangat populer dan mudah digunakan.",
        status: "open",
        view_count: 15,
        vote_score: 2,
        is_answered: 0,
        accepted_answer_id: null,
        created_at: "2026-06-03T17:12:45.000000Z",
        updated_at: "2026-06-05T14:35:17.000000Z",
      },
    },
    {
      id: "3c71a12f-88de-4b90-a012-9147c3f9d120",
      user_id: "b6698191-8a48-4073-9cfe-d5f1f3e96b08",
      post_id: "a1b2c3d4-1234-5678-abcd-ef1234567890",
      created_at: "2026-06-04 10:22:11",
      post: {
        id: "a1b2c3d4-1234-5678-abcd-ef1234567890",
        user_id: "aabbccdd-1111-2222-3333-444455556666",
        category_id: "709bb650-b0bc-4f4e-ae8b-1560d5d49809",
        title: "Perbedaan REST API dan GraphQL di Laravel",
        body: "REST dan GraphQL memiliki kelebihan masing-masing. REST lebih sederhana sedangkan GraphQL lebih fleksibel.",
        status: "answered",
        view_count: 42,
        vote_score: 8,
        is_answered: 1,
        accepted_answer_id: "xyz-answer-001",
        created_at: "2026-05-28T09:00:00.000000Z",
        updated_at: "2026-06-01T12:00:00.000000Z",
      },
    },
    {
      id: "9f0a21bb-cc44-4e55-b77d-88f901234abc",
      user_id: "b6698191-8a48-4073-9cfe-d5f1f3e96b08",
      post_id: "bbccdd11-9999-8888-7777-666655554444",
      created_at: "2026-06-02 15:45:00",
      post: {
        id: "bbccdd11-9999-8888-7777-666655554444",
        user_id: "11223344-aaaa-bbbb-cccc-ddddeeeeffffgg",
        category_id: "709bb650-b0bc-4f4e-ae8b-1560d5d49809",
        title: "Cara Menggunakan Eloquent ORM di Laravel",
        body: "Eloquent ORM mempermudah interaksi dengan database menggunakan model PHP.",
        status: "closed",
        view_count: 30,
        vote_score: 5,
        is_answered: 0,
        accepted_answer_id: null,
        created_at: "2026-05-20T08:30:00.000000Z",
        updated_at: "2026-05-25T10:00:00.000000Z",
      },
    },
  ],
};

// --- Helpers ---
function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
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

function BookmarkCard({
  bookmark,
  onRemove,
}: {
  bookmark: Bookmark;
  onRemove: (id: string) => void;
}) {
  const { post } = bookmark;

  return (
    <div
      style={{
        background: "#ffffff",
        border: "1px solid #e5e7eb",
        borderRadius: "14px",
        padding: "22px 24px",
        display: "flex",
        flexDirection: "column",
        gap: "12px",
        boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
        transition: "box-shadow 0.15s ease",
        position: "relative",
      }}
    >
      {/* Header Row */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
          <StatusBadge status={post.status} />
          {post.is_answered === 1 && (
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
                fontSize: "11px",
                color: "#16a34a",
                fontWeight: 600,
              }}
            >
              ✓ Ada Jawaban Diterima
            </span>
          )}
        </div>
        <button
          onClick={() => onRemove(bookmark.id)}
          title="Hapus bookmark"
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "#9ca3af",
            fontSize: "18px",
            lineHeight: 1,
            padding: "2px 4px",
            borderRadius: "6px",
            transition: "color 0.1s",
            flexShrink: 0,
          }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.color = "#ef4444")}
          onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.color = "#9ca3af")}
        >
          🔖
        </button>
      </div>

      {/* Title */}
      <h2
        style={{
          margin: 0,
          fontSize: "16px",
          fontWeight: 700,
          color: "#111827",
          lineHeight: 1.4,
          cursor: "pointer",
        }}
        onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "#2563eb")}
        onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "#111827")}
      >
        {post.title}
      </h2>

      {/* Body */}
      <p
        style={{
          margin: 0,
          fontSize: "14px",
          color: "#6b7280",
          lineHeight: 1.6,
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
        }}
      >
        {post.body}
      </p>

      {/* Footer */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "16px",
          paddingTop: "6px",
          borderTop: "1px solid #f3f4f6",
          flexWrap: "wrap",
        }}
      >
        <Stat icon="👁" value={post.view_count} label="dilihat" />
        <Stat icon="▲" value={post.vote_score} label="suara" />
        <span style={{ fontSize: "12px", color: "#9ca3af", marginLeft: "auto" }}>
          Disimpan {formatDate(bookmark.created_at)}
        </span>
      </div>
    </div>
  );
}

function Stat({ icon, value, label }: { icon: string; value: number; label: string }) {
  return (
    <span style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "12px", color: "#6b7280" }}>
      <span>{icon}</span>
      <strong style={{ color: "#374151", fontWeight: 600 }}>{value}</strong>
      <span>{label}</span>
    </span>
  );
}

// --- Empty State ---
function EmptyState() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "64px 24px",
        gap: "16px",
        color: "#9ca3af",
        textAlign: "center",
      }}
    >
      <span style={{ fontSize: "48px" }}>🔖</span>
      <p style={{ margin: 0, fontSize: "16px", fontWeight: 600, color: "#374151" }}>
        Belum ada bookmark
      </p>
      <p style={{ margin: 0, fontSize: "14px" }}>
        Simpan pertanyaan menarik dan temukan lagi kapan saja di sini.
      </p>
    </div>
  );
}

// --- Main Page ---
export default function BookmarksPage() {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>(mockData.data);
  const [search, setSearch] = useState("");

  const filtered = bookmarks.filter((b) =>
    b.post.title.toLowerCase().includes(search.toLowerCase()) ||
    b.post.body.toLowerCase().includes(search.toLowerCase())
  );

  function handleRemove(id: string) {
    setBookmarks((prev) => prev.filter((b) => b.id !== id));
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f9fafb",
        fontFamily: "'Inter', system-ui, sans-serif",
        padding: "0 0 48px",
      }}
    >
      {/* Top Bar */}
      <div
        style={{
          background: "#ffffff",
          borderBottom: "1px solid #e5e7eb",
          padding: "20px 24px",
          position: "sticky",
          top: 0,
          zIndex: 10,
        }}
      >
        <div style={{ maxWidth: "680px", margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
            <div>
              <h1 style={{ margin: 0, fontSize: "20px", fontWeight: 700, color: "#111827" }}>
                Bookmark Saya
              </h1>
              <p style={{ margin: "2px 0 0", fontSize: "13px", color: "#9ca3af" }}>
                {bookmarks.length} pertanyaan tersimpan
              </p>
            </div>
            <span style={{ fontSize: "28px" }}>🔖</span>
          </div>

          {/* Search */}
          <div style={{ position: "relative" }}>
            <span
              style={{
                position: "absolute",
                left: "12px",
                top: "50%",
                transform: "translateY(-50%)",
                color: "#9ca3af",
                fontSize: "15px",
              }}
            >
              🔍
            </span>
            <input
              type="text"
              placeholder="Cari bookmark..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: "100%",
                boxSizing: "border-box",
                padding: "10px 14px 10px 36px",
                border: "1px solid #e5e7eb",
                borderRadius: "10px",
                fontSize: "14px",
                color: "#111827",
                background: "#f9fafb",
                outline: "none",
              }}
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: "680px", margin: "0 auto", padding: "24px 16px 0" }}>
        {filtered.length === 0 ? (
          <EmptyState />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {filtered.map((bookmark) => (
              <BookmarkCard key={bookmark.id} bookmark={bookmark} onRemove={handleRemove} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}