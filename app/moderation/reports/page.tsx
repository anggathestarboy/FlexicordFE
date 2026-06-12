"use client";

import { useState, useEffect } from "react";
import { AlertTriangle, User, FileText, MessageSquare, ShieldCheck, X, Eye, RefreshCw } from "lucide-react";

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
  target_type: "user" | "post" | "comment" | string;
  reason: string;
  description: string;
  status: "resolved" | "dismissed" | "reviewed" | "pending" | "open" | string;
  resolved_at: string | null;
  created_at: string;
  resolved_by: UserInfo | string | null;
  reporter: UserInfo;
  post: PostInfo | null;
  comment: any | null;
  user: UserInfo | null;
}

// ── Main Component ───────────────────────────────────────────────────────────
export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);

  const [filterStatus, setFilterStatus] = useState<"all" | "resolved" | "open">("all");
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);

  const fetchReports = async (pageNumber = 1) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/reports/all?page=${pageNumber}`);
      if (!res.ok) {
        throw new Error(`Failed to fetch: ${res.status} ${res.statusText}`);
      }
      const json = await res.json();
      if (json.success && json.data) {
        setReports(json.data.data || []);
        setPage(json.data.current_page || 1);
        setLastPage(json.data.last_page || 1);
        setTotal(json.data.total || 0);
      } else {
        throw new Error(json.message || "Gagal memproses data laporan");
      }
    } catch (err: any) {
      console.error("fetchReports error:", err);
      setError(err.message || "Gagal mengambil data laporan");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports(1);
  }, []);

  const handleUpdateStatus = async (reportId: string, newStatus: string) => {
    setSubmitting(true);
    try {
      const res = await fetch(`/api/reports/${reportId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Gagal memperbarui status laporan");
      }

      // Update local state optimistically
      setReports((prev) =>
        prev.map((rep) =>
          rep.id === reportId ? { ...rep, status: newStatus } : rep
        )
      );

      // Update selected report detail state if it's currently open
      setSelectedReport((prev) =>
        prev && prev.id === reportId ? { ...prev, status: newStatus } : prev
      );

      // Re-fetch in background to synchronize other fields like resolved_by
      fetchReports(page);
    } catch (err: any) {
      console.error("handleUpdateStatus error:", err);
      alert(err.message || "Gagal memperbarui status");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredReports = reports.filter((rep) => {
    if (filterStatus === "all") return true;
    if (filterStatus === "resolved") {
      return ["resolved", "dismissed", "reviewed"].includes(rep.status);
    }
    if (filterStatus === "open") {
      return ["open", "pending"].includes(rep.status) || !rep.status;
    }
    return rep.status === filterStatus;
  });

  // Helper pencari username pelaku postingan/komentar dari daftar reporter/user yang ada
  const getPelakuUsername = (report: Report) => {
    if (report.target_type === "user" && report.user) return `@${report.user.username}`;
    if (report.target_type === "post" && report.post) {
      return report.post.user_id === report.reporter?.id ? `@${report.reporter?.username}` : "User Terkait";
    }
    return "Tidak Diketahui";
  };

  const typeConfig: Record<string, { label: string; color: string; icon: React.ComponentType<any> }> = {
    user: { label: "User", color: "text-cyan-500 bg-cyan-500/10 border-cyan-500/20", icon: User },
    post: { label: "Post", color: "text-teal-500 bg-teal-500/10 border-teal-500/20", icon: FileText },
    comment: { label: "Komentar", color: "text-sky-500 bg-sky-500/10 border-sky-500/20", icon: MessageSquare },
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "resolved":
        return "text-cyan-500";
      case "dismissed":
        return "text-red-500";
      case "reviewed":
        return "text-yellow-500";
      case "pending":
      case "open":
      default:
        return "text-orange-500";
    }
  };

  const formatDateTime = (dateStr: string) => {
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
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200/50 dark:border-zinc-800/50">
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-zinc-900 to-zinc-600 dark:from-white dark:to-zinc-400 bg-clip-text text-transparent tracking-tight">
            Pusat Moderasi Konten
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Review laporan ringkas di bawah. Klik card untuk menampilkan modul pop-up detail eksekusi.
          </p>
        </div>
        <button
          onClick={() => fetchReports(page)}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all cursor-pointer disabled:opacity-50 shrink-0 shadow-sm"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh Laporan</span>
        </button>
      </div>

      {/* TABS FILTER */}
      <div className="flex flex-wrap gap-1.5 bg-zinc-100/60 dark:bg-zinc-900/40 p-1.5 rounded-xl border border-zinc-200/60 dark:border-zinc-800/60 w-fit select-none">
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
            {status === "all" ? "Semua" : status === "resolved" ? "Selesai" : "Pending / Open"}
          </button>
        ))}
      </div>

      {/* MINI LIST GRID */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-cyan-500" />
          <p className="text-sm text-zinc-500 dark:text-zinc-400 font-medium">Memuat data laporan...</p>
        </div>
      ) : error ? (
        <div className="p-12 text-center rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 max-w-2xl mx-auto space-y-3">
          <p className="text-base font-bold text-zinc-900 dark:text-white">⚠️ Gagal Memuat Laporan</p>
          <p className="text-xs text-zinc-500">{error}</p>
          <button
            onClick={() => fetchReports(1)}
            className="mt-2 text-xs bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 font-semibold px-4 py-2 rounded-lg cursor-pointer"
          >
            Coba Lagi
          </button>
        </div>
      ) : filteredReports.length === 0 ? (
        <div className="p-12 text-center rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 max-w-md mx-auto space-y-2">
          <p className="text-sm font-bold text-zinc-900 dark:text-white">Tidak ada laporan</p>
          <p className="text-xs text-zinc-500">Laporan tidak ditemukan untuk status saat ini.</p>
        </div>
      ) : (
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
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${getStatusColor(report.status)}`}>
                      ● {report.status || "open"}
                    </span>
                  </div>

                  {/* Judul Objek Konten Pelanggaran dengan Avatar Pelapor */}
                  <div className="flex items-center gap-2.5 mt-2">
                    <div className="w-7 h-7 rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center text-zinc-400 shrink-0 text-[10px] uppercase font-bold overflow-hidden relative">
                      {report.reporter?.avatar_url ? (
                        <img
                          src={report.reporter.avatar_url.startsWith("http") ? report.reporter.avatar_url : `https://pegaduanmasyarakat.alwaysdata.net/storage/${report.reporter.avatar_url}`}
                          alt={report.reporter.username}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        report.reporter?.username?.charAt(0) || "P"
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="text-[9px] uppercase font-bold text-zinc-400 block tracking-wider">Pelapor: @{report.reporter?.username || "unknown"}</span>
                      <h3 className="text-xs font-bold text-zinc-800 dark:text-zinc-200 truncate mt-0.5">
                        {report.target_type === "post" && report.post ? report.post.title : `Akun ${getPelakuUsername(report)}`}
                      </h3>
                    </div>
                  </div>

                  {/* USERNAME PELAKU */}
                  <div className="bg-zinc-50 dark:bg-zinc-950/50 p-2 rounded-lg border border-zinc-200/40 dark:border-zinc-800/40 text-[11px]">
                    <span className="text-zinc-400">User Pelaku: </span>
                    <span className="font-bold text-cyan-600 dark:text-cyan-400 font-mono">
                      {getPelakuUsername(report)}
                    </span>
                  </div>
                </div>

                {/* Footer Aksi */}
                <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800/60 flex items-center justify-between text-[11px] text-zinc-400">
                  <span className="truncate max-w-[70%]">Alasan: "{report.reason || "N/A"}"</span>
                  <span className="text-cyan-500 flex items-center gap-0.5 font-semibold group-hover:underline">
                    Detail <Eye className="w-3 h-3" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* PAGINATION */}
      {!loading && lastPage > 1 && (
        <div className="flex items-center justify-center gap-1 pt-4 select-none">
          <button
            onClick={() => fetchReports(Math.max(1, page - 1))}
            disabled={page === 1}
            className="px-3 py-1.5 text-xs rounded-lg border border-zinc-200 dark:border-zinc-800 disabled:opacity-40 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            ← Prev
          </button>

          {Array.from({ length: lastPage }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => fetchReports(p)}
              className={`px-3 py-1.5 text-xs rounded-lg border transition-colors cursor-pointer ${
                page === p
                  ? "bg-cyan-500 text-white border-cyan-500 font-bold"
                  : "border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              }`}
            >
              {p}
            </button>
          ))}

          <button
            onClick={() => fetchReports(Math.min(lastPage, page + 1))}
            disabled={page === lastPage}
            className="px-3 py-1.5 text-xs rounded-lg border border-zinc-200 dark:border-zinc-800 disabled:opacity-40 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            Next →
          </button>
        </div>
      )}

      {/* ── POP-UP MODAL DETAIL (Klik Hasil) ────────────────────────────────── */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 select-none">
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
                    selectedReport.status === "resolved"
                      ? "bg-cyan-500/10 text-cyan-500"
                      : selectedReport.status === "dismissed"
                      ? "bg-red-500/10 text-red-500"
                      : selectedReport.status === "reviewed"
                      ? "bg-yellow-500/10 text-yellow-500"
                      : "bg-orange-500/10 text-orange-500"
                  }`}>
                    {selectedReport.status || "open"}
                  </span>
                </div>
              </div>

              {/* Row 2: Kronologi Kasus */}
              <div className="space-y-1">
                <span className="text-zinc-400 font-bold uppercase tracking-wider text-[10px]">Alasan Utama:</span>
                <p className="font-bold text-zinc-900 dark:text-zinc-100 text-sm bg-cyan-500/5 p-2 rounded border border-cyan-500/10">
                  "{selectedReport.reason || "N/A"}"
                </p>
                <div className="text-zinc-500 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-950/40 p-3 rounded-lg border border-zinc-200/50 dark:border-zinc-800/60 mt-1 italic">
                  <span className="not-italic font-bold block text-[10px] text-zinc-400 uppercase tracking-wide mb-1 font-sans">Deskripsi Pelapor:</span>
                  {selectedReport.description || "Tidak ada deskripsi tambahan."}
                </div>
              </div>

              {/* Row 3: Profiles Side by Side (Pelapor & Pelaku) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                {/* Pelapor Profile */}
                <div className="p-3 rounded-xl border border-zinc-200/60 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/40 space-y-2.5">
                  <span className="block text-[10px] font-bold uppercase text-zinc-400 tracking-wider">Pelapor Konten</span>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center font-bold text-xs uppercase overflow-hidden shrink-0 relative">
                      {selectedReport.reporter?.avatar_url ? (
                        <img
                          src={selectedReport.reporter.avatar_url.startsWith("http") ? selectedReport.reporter.avatar_url : `https://pegaduanmasyarakat.alwaysdata.net/storage/${selectedReport.reporter.avatar_url}`}
                          alt={selectedReport.reporter.username}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        selectedReport.reporter?.username?.charAt(0) || "P"
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="font-bold text-xs text-zinc-900 dark:text-white truncate block">@{selectedReport.reporter?.username || "unknown"}</span>
                      <span className="text-[10px] text-zinc-400 block truncate">{selectedReport.reporter?.email || ""}</span>
                    </div>
                  </div>
                </div>

                {/* Pelaku Profile */}
                <div className="p-3 rounded-xl border border-zinc-200/60 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/40 space-y-2.5">
                  <span className="block text-[10px] font-bold uppercase text-zinc-400 tracking-wider">
                    {selectedReport.target_type === "user" ? "User Terlaporkan" : "Pembuat Konten"}
                  </span>
                  {selectedReport.target_type === "user" && selectedReport.user ? (
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center font-bold text-xs uppercase overflow-hidden shrink-0 relative">
                        {selectedReport.user.avatar_url ? (
                          <img
                            src={selectedReport.user.avatar_url.startsWith("http") ? selectedReport.user.avatar_url : `https://pegaduanmasyarakat.alwaysdata.net/storage/${selectedReport.user.avatar_url}`}
                            alt={selectedReport.user.username}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          selectedReport.user.username.charAt(0)
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="font-bold text-xs text-zinc-900 dark:text-white truncate block">@{selectedReport.user.username}</span>
                        <span className="text-[10px] text-zinc-400 block truncate">{selectedReport.user.email}</span>
                      </div>
                    </div>
                  ) : selectedReport.target_type === "post" && selectedReport.post ? (
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center text-zinc-450 shrink-0">
                        <FileText className="w-4 h-4 text-teal-500" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="font-bold text-xs text-zinc-900 dark:text-white truncate block">Objek Post</span>
                        <span className="text-[10px] text-zinc-400 block truncate">ID Penulis: {selectedReport.post.user_id.slice(0, 8)}...</span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-[11px] text-zinc-400 italic">Info pelaku tidak tersedia</div>
                  )}
                </div>
              </div>

              {/* Row 4: Detail Objek Deep Info */}
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

              {/* Row 5: Moderator Penanggung Jawab (Detailed Block) */}
              {selectedReport.resolved_by && (
                <div className="p-3.5 rounded-xl border border-emerald-500/20 bg-emerald-500/5 dark:bg-emerald-950/20 space-y-2.5">
                  <span className="block text-[10px] font-bold uppercase text-emerald-600 dark:text-emerald-400 tracking-wider flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> Moderator Penindak
                  </span>
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center font-bold text-xs uppercase overflow-hidden shrink-0 relative">
                      {typeof selectedReport.resolved_by === "object" && selectedReport.resolved_by.avatar_url ? (
                        <img
                          src={selectedReport.resolved_by.avatar_url.startsWith("http") ? selectedReport.resolved_by.avatar_url : `https://pegaduanmasyarakat.alwaysdata.net/storage/${selectedReport.resolved_by.avatar_url}`}
                          alt={selectedReport.resolved_by.username}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        (typeof selectedReport.resolved_by === "object" ? selectedReport.resolved_by.username : selectedReport.resolved_by)?.charAt(0) || "M"
                      )}
                    </div>
                    <div className="min-w-0 flex-1 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5">
                      <div>
                        <span className="font-bold text-xs text-zinc-900 dark:text-white truncate block">
                          @{typeof selectedReport.resolved_by === "object" ? selectedReport.resolved_by.username : selectedReport.resolved_by}
                        </span>
                        {typeof selectedReport.resolved_by === "object" && (
                          <span className="text-[10px] text-zinc-400 dark:text-zinc-500 block truncate">
                            {selectedReport.resolved_by.email}
                          </span>
                        )}
                      </div>
                      {selectedReport.resolved_at && (
                        <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-mono self-start sm:self-auto">
                          {formatDateTime(selectedReport.resolved_at)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}

            </div>

            {/* Modal Footer / Action Buttons */}
            <div className="p-4 border-t border-zinc-100 dark:border-zinc-800/80 bg-zinc-50 dark:bg-zinc-950/40 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              {/* Action Buttons to resolve, dismiss, review, pending */}
              <div className="space-y-1">
                <span className="block text-[9px] uppercase font-bold text-zinc-400 dark:text-zinc-500 tracking-wider">
                  Ubah Status Laporan (PATCH):
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {["resolved", "dismissed", "reviewed", "pending"].map((statusOption) => (
                    <button
                      key={statusOption}
                      disabled={submitting}
                      onClick={() => handleUpdateStatus(selectedReport.id, statusOption)}
                      className={`px-3 py-1 text-[10px] font-bold rounded-lg transition-all capitalize cursor-pointer disabled:opacity-50 ${
                        selectedReport.status === statusOption
                          ? statusOption === "resolved"
                            ? "bg-cyan-500 text-white shadow-sm shadow-cyan-500/20"
                            : statusOption === "dismissed"
                            ? "bg-red-500 text-white shadow-sm shadow-red-500/20"
                            : statusOption === "reviewed"
                            ? "bg-yellow-500 text-zinc-950 shadow-sm shadow-yellow-500/20"
                            : "bg-orange-500 text-white shadow-sm shadow-orange-500/20"
                          : "bg-white hover:bg-zinc-100 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700"
                      }`}
                    >
                      {statusOption}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={() => setSelectedReport(null)}
                className="self-end sm:self-auto px-4 py-1.5 text-xs font-bold text-white bg-cyan-500 hover:bg-cyan-600 rounded-lg transition-colors cursor-pointer"
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