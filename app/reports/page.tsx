"use client";

import { useState } from "react";
import { AlertTriangle, CheckCircle2, User, FileText, MessageSquare, ShieldCheck, X, Eye, Clipboard } from "lucide-react";

// ── Types Definition ─────────────────────────────────────────────────────────
interface UserInfo {
  id: string;
  username: string;
  email: string;
  avatar_url: string;
  bio: string | null;
  reputation_points: number;
  level: number;
  is_banned: number;
  created_at: string;
  updated_at: string;
}

interface PostInfo {
  id: string;
  user_id: string;
  category_id: string;
  title: string;
  body: string;
  status: string;
  view_count: number;
  vote_score: number;
  is_answered: number;
  accepted_answer_id: string | null;
  created_at: string;
  updated_at: string;
}

interface Report {
  id: string;
  reporter_id: string;
  target_id: string;
  target_type: "user" | "post" | "comment";
  reason: string;
  description: string;
  status: "open" | "resolved";
  resolved_at: string | null;
  created_at: string;
  resolved_by: UserInfo | null;
  reporter: UserInfo;
  post: PostInfo | null;
  comment: any | null;
  user: UserInfo | null;
}

// ── Dummy Data ──────────────────────────────────────────────────────────────
const INITIAL_REPORTS: Report[] = [
  {
    id: "8410271c-8b02-40bc-9cec-b4c73a24c2ee",
    reporter_id: "b6698191-8a48-4073-9cfe-d5f1f3e96b08",
    target_id: "33119eac-b64e-40bf-a8b3-81b5a4cd8ddf",
    target_type: "user",
    reason: "orang ini toxic banget",
    description: "ban aja nih orang 10 tahun karena merusak ekosistem chat room utama",
    status: "resolved",
    created_at: "2026-06-06 16:34:51",
    resolved_at: "2026-06-06 09:35:10",
    resolved_by: {
      id: "b6698191-8a48-4073-9cfe-d5f1f3e96b08",
      username: "reifan",
      email: "reifan@gmail.com",
      avatar_url: "avatars/avatar1.jpg",
      bio: null,
      reputation_points: 0,
      level: 1,
      is_banned: 0,
      created_at: "2026-06-03T15:04:02.000000Z",
      updated_at: "2026-06-08T20:11:00.000000Z",
    },
    reporter: {
      id: "b6698191-8a48-4073-9cfe-d5f1f3e96b08",
      username: "reifan",
      email: "reifan@gmail.com",
      avatar_url: "avatars/avatar1.jpg",
      bio: null,
      reputation_points: 0,
      level: 1,
      is_banned: 0,
      created_at: "2026-06-03T15:04:02.000000Z",
      updated_at: "2026-06-08T20:11:00.000000Z",
    },
    post: null,
    comment: null,
    user: {
      id: "33119eac-b64e-40bf-a8b3-81b5a4cd8ddf",
      username: "anggaraa",
      email: "anggara@gmail.com",
      avatar_url: "avatars/avatar2.jpg",
      bio: "glory glory man utd @zahra",
      reputation_points: 19,
      level: 2,
      is_banned: 0,
      created_at: "2026-06-03T03:39:06.000000Z",
      updated_at: "2026-06-08T20:10:38.000000Z",
    },
  },
  {
    id: "85251ab7-d2fe-4ff7-98e0-934230c9b74d",
    reporter_id: "b6698191-8a48-4073-9cfe-d5f1f3e96b08",
    target_id: "19eb9b6b-749e-4795-a618-1646ffab5ebb",
    target_type: "post",
    reason: "orang ini toxic banget",
    description: "Memposting ujaran kebencian di dalam tutorial teknis, mohon segera ditinjau.",
    status: "resolved",
    created_at: "2026-06-06 15:33:30",
    resolved_at: "2026-06-06 08:49:51",
    resolved_by: {
      id: "33119eac-b64e-40bf-a8b3-81b5a4cd8ddf",
      username: "anggaraa",
      email: "anggara@gmail.com",
      avatar_url: "avatars/avatar2.jpg",
      bio: "glory glory man utd @zahra",
      reputation_points: 19,
      level: 2,
      is_banned: 0,
      created_at: "2026-06-03T03:39:06.000000Z",
      updated_at: "2026-06-08T20:10:38.000000Z",
    },
    reporter: {
      id: "b6698191-8a48-4073-9cfe-d5f1f3e96b08",
      username: "reifan",
      email: "reifan@gmail.com",
      avatar_url: "avatars/avatar1.jpg",
      bio: null,
      reputation_points: 0,
      level: 1,
      is_banned: 0,
      created_at: "2026-06-03T15:04:02.000000Z",
      updated_at: "2026-06-08T20:11:00.000000Z",
    },
    post: {
      id: "19eb9b6b-749e-4795-a618-1646ffab5ebb",
      user_id: "b6698191-8a48-4073-9cfe-d5f1f3e96b08", // Ini ID si pelakunya (reifan)
      category_id: "169508a8-1ac9-431f-8409-8533fdf28319",
      title: "Cara Belajar React untuk Pemula",
      body: "React adalah framework Javascript yang sangat populer dan mudah digunakan.",
      status: "open",
      view_count: 0,
      vote_score: 0,
      is_answered: 0,
      accepted_answer_id: null,
      created_at: "2026-06-05T14:55:27.000000Z",
      updated_at: "2026-06-05T14:55:27.000000Z",
    },
    comment: null,
    user: null,
  },
];

// ── Main Component ───────────────────────────────────────────────────────────
export default function ReportsPage() {
  const [reports] = useState<Report[]>(INITIAL_REPORTS);
  const [filterStatus, setFilterStatus] = useState<"all" | "resolved" | "open">("all");
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);

  const filteredReports = reports.filter(
    (rep) => filterStatus === "all" || rep.status === filterStatus
  );

  // Helper pencari username pelaku postingan/komentar dari daftar reporter/user yang ada
  const getPelakuUsername = (report: Report) => {
    if (report.target_type === "user" && report.user) return `@${report.user.username}`;
    if (report.target_type === "post" && report.post) {
      return report.post.user_id === report.reporter.id ? `@${report.reporter.username}` : "User Terkait";
    }
    return "Tidak Diketahui";
  };

  const typeConfig = {
    user: { label: "User", color: "text-cyan-500 bg-cyan-500/10 border-cyan-500/20", icon: User },
    post: { label: "Post", color: "text-teal-500 bg-teal-500/10 border-teal-500/20", icon: FileText },
    comment: { label: "Komentar", color: "text-sky-500 bg-sky-500/10 border-sky-500/20", icon: MessageSquare },
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6">
      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-bold bg-gradient-to-r from-zinc-900 to-zinc-600 dark:from-white dark:to-zinc-400 bg-clip-text text-transparent tracking-tight">
          Pusat Moderasi Konten
        </h1>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
          Review laporan ringkas di bawah. Klik card untuk menampilkan modul pop-up detail eksekusi.
        </p>
      </div>

      {/* TABS FILTER */}
      <div className="flex flex-wrap gap-1.5 bg-zinc-100/60 dark:bg-zinc-900/40 p-1.5 rounded-xl border border-zinc-200/60 dark:border-zinc-800/60 w-fit">
        {["all", "resolved", "open"].map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status as any)}
            className={`px-4 py-1.5 text-xs font-bold rounded-lg capitalize transition-all cursor-pointer ${
              filterStatus === status
                ? "bg-cyan-500 text-white shadow-sm shadow-cyan-500/20"
                : "text-zinc-500 dark:text-zinc-400 hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50"
            }`}
          >
            {status === "all" ? "Semua" : status === "resolved" ? "Selesai" : "Pending"}
          </button>
        ))}
      </div>

      {/* MINI LIST GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredReports.map((report) => {
          const currentType = typeConfig[report.target_type] || typeConfig.user;
          const TargetIcon = currentType.icon;

          return (
            <div
              key={report.id}
              onClick={() => setSelectedReport(report)}
              className="group relative bg-white dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-800/80 rounded-xl p-4 cursor-pointer transition-all duration-200 hover:border-cyan-500/40 hover:shadow-md flex flex-col justify-between space-y-3"
            >
              <div className="space-y-2.5">
                {/* Badge Status & Tipe */}
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${currentType.color} flex items-center gap-1`}>
                    <TargetIcon className="w-3 h-3" />
                    {currentType.label}
                  </span>
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${
                    report.status === "resolved" ? "text-emerald-500" : "text-amber-500"
                  }`}>
                    ● {report.status}
                  </span>
                </div>

                {/* Judul Objek Konten Pelanggaran */}
                <div>
                  <span className="text-[10px] uppercase font-bold text-zinc-400 block tracking-wider">Objek Pelanggaran:</span>
                  <h3 className="text-xs font-bold text-zinc-800 dark:text-zinc-200 truncate mt-0.5">
                    {report.target_type === "post" && report.post ? report.post.title : `Akun ${getPelakuUsername(report)}`}
                  </h3>
                </div>

                {/* PENGGANTIAN SINKRONISASI DI SINI: USERNAME PELAKU */}
                <div className="bg-zinc-50 dark:bg-zinc-950/50 p-2 rounded-lg border border-zinc-200/40 dark:border-zinc-800/40 text-[11px]">
                  <span className="text-zinc-400">User Pelaku: </span>
                  <span className="font-bold text-cyan-600 dark:text-cyan-400 font-mono">
                    {getPelakuUsername(report)}
                  </span>
                </div>
              </div>

              {/* Footer Aksi */}
              <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800/60 flex items-center justify-between text-[11px] text-zinc-400">
                <span>Alasan: "{report.reason.slice(0, 20)}..."</span>
                <span className="text-cyan-500 flex items-center gap-0.5 font-semibold group-hover:underline">
                  Detail <Eye className="w-3 h-3" />
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── POP-UP MODAL DETAIL (Klik Hasil) ────────────────────────────────── */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 w-full max-w-lg rounded-xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="p-4 border-b border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between bg-zinc-50 dark:bg-zinc-950/40">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-cyan-500" />
                <h2 className="text-sm font-bold text-zinc-900 dark:text-white">Detail Log Pengaduan</h2>
              </div>
              <button
                onClick={() => setSelectedReport(null)}
                className="p-1.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 rounded-lg bg-zinc-200/50 dark:bg-zinc-800/50 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body Content (Scrollable) */}
            <div className="p-5 overflow-y-auto space-y-4 text-xs">
              
              {/* Row 1: ID Laporan & Status */}
              <div className="grid grid-cols-2 gap-3 bg-zinc-50 dark:bg-zinc-950/30 p-3 rounded-lg border border-zinc-100 dark:border-zinc-800/60 font-mono text-[11px]">
                <div>
                  <span className="text-zinc-400 block font-sans font-semibold text-[10px] uppercase">ID Pengaduan</span>
                  <span className="text-zinc-700 dark:text-zinc-300 truncate block">{selectedReport.id}</span>
                </div>
                <div>
                  <span className="text-zinc-400 block font-sans font-semibold text-[10px] uppercase">Status Tiket</span>
                  <span className={`inline-block font-bold mt-0.5 uppercase tracking-wide text-[10px] px-2 py-0.5 rounded ${
                    selectedReport.status === "resolved" ? "bg-emerald-500/10 text-emerald-500" : "bg-amber-500/10 text-amber-500"
                  }`}>
                    {selectedReport.status}
                  </span>
                </div>
              </div>

              {/* Row 2: Kronologi Kasus */}
              <div className="space-y-1">
                <span className="text-zinc-400 font-bold uppercase tracking-wider text-[10px]">Alasan Utama:</span>
                <p className="font-bold text-zinc-900 dark:text-zinc-100 text-sm bg-cyan-500/5 p-2 rounded border border-cyan-500/10">
                  "{selectedReport.reason}"
                </p>
                <div className="text-zinc-500 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-950/40 p-3 rounded-lg border border-zinc-200/50 dark:border-zinc-800/60 mt-1 italic">
                  <span className="not-italic font-bold block text-[10px] text-zinc-400 uppercase tracking-wide mb-1 font-sans">Deskripsi Pelapor:</span>
                  {selectedReport.description}
                </div>
              </div>

              {/* Row 3: Blok Khusus Detail Objek & ID Database Database */}
              <div className="p-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200/60 dark:border-zinc-800 rounded-xl space-y-2">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Struktur Objek Pelanggaran Deep-Info:</span>
                
                {selectedReport.target_type === "post" && selectedReport.post && (
                  <div className="space-y-2 text-[11px]">
                    <div className="bg-white dark:bg-zinc-900 p-2.5 rounded border border-zinc-200/60 dark:border-zinc-800">
                      <span className="text-[10px] font-bold text-teal-500 block">● Judul Posting:</span>
                      <p className="font-bold text-zinc-800 dark:text-zinc-200 mt-0.5">{selectedReport.post.title}</p>
                      <p className="text-zinc-400 text-[11px] mt-1 line-clamp-2">{selectedReport.post.body}</p>
                    </div>
                    {/* Database Deep IDs Keys */}
                    <div className="space-y-1 font-mono text-[10px] bg-zinc-100/60 dark:bg-zinc-900/60 p-2 rounded border border-zinc-200/30 dark:border-zinc-800/30 text-zinc-500">
                      <div className="truncate"><span className="font-sans font-bold text-zinc-400">ID Post Target:</span> {selectedReport.post.id}</div>
                      <div><span className="font-sans font-bold text-zinc-400">ID User Pelaku:</span> {selectedReport.post.user_id}</div>
                      <div><span className="font-sans font-bold text-zinc-400">Username Pelaku:</span> <span className="text-cyan-500 font-bold">{getPelakuUsername(selectedReport)}</span></div>
                    </div>
                  </div>
                )}

                {selectedReport.target_type === "user" && selectedReport.user && (
                  <div className="space-y-2 font-mono text-[11px] bg-zinc-100/60 dark:bg-zinc-900/60 p-2.5 rounded border border-zinc-200/30 dark:border-zinc-800/30 text-zinc-500">
                    <div><span className="font-sans font-bold text-zinc-400">Username Target:</span> <span className="text-cyan-500 font-bold">@{selectedReport.user.username}</span></div>
                    <div className="truncate"><span className="font-sans font-bold text-zinc-400">ID User Target:</span> {selectedReport.user.id}</div>
                    <div className="font-sans text-zinc-400 truncate mt-1">Bio: "{selectedReport.user.bio || 'No bio'}"</div>
                  </div>
                )}
              </div>

              {/* Row 4: Alur Pelapor & Moderator Penanggung Jawab */}
              <div className="grid grid-cols-2 gap-4 pt-3 border-t border-zinc-100 dark:border-zinc-800 text-[11px]">
                <div>
                  <span className="text-zinc-400 block font-semibold text-[10px] uppercase">Pelapor Konten</span>
                  <span className="font-bold text-zinc-700 dark:text-zinc-300">@{selectedReport.reporter.username}</span>
                  <span className="text-[10px] text-zinc-400 block font-mono">{selectedReport.created_at}</span>
                </div>
                {selectedReport.resolved_by && (
                  <div className="text-right">
                    <span className="text-zinc-400 block font-semibold text-[10px] uppercase flex items-center justify-end gap-1">
                      <ShieldCheck className="w-3 h-3 text-cyan-500" /> Moderator Penindak
                    </span>
                    <span className="font-bold text-cyan-600 dark:text-cyan-400">@{selectedReport.resolved_by.username}</span>
                    <span className="text-[10px] text-zinc-400 block font-mono">{selectedReport.resolved_at}</span>
                  </div>
                )}
              </div>

            </div>

            {/* Modal Footer / Action Button */}
            <div className="p-3 border-t border-zinc-100 dark:border-zinc-800/80 bg-zinc-50 dark:bg-zinc-950/40 flex justify-end">
              <button
                onClick={() => setSelectedReport(null)}
                className="px-4 py-1.5 text-xs font-bold text-white bg-cyan-500 hover:bg-cyan-600 rounded-lg transition-colors cursor-pointer"
              >
                Tutup Dokumen
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}