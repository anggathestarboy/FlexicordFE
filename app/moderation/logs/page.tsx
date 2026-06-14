"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ScrollText, Search, Clock, ShieldAlert, User, Eye, X, Filter, RefreshCw, AlertTriangle, AlertCircle, CheckCircle, Trash2 } from "lucide-react";
import { useApp } from "@/context/AppContext";
import axios from "axios";

interface LogUser {
  id: string;
  username: string;
  email: string;
  avatar_url?: string | null;
  bio?: string | null;
  reputation_points?: number;
  level?: number;
  is_banned?: number;
  created_at?: string;
  updated_at?: string;
}

interface ModerationLog {
  id: string;
  moderator_id: string;
  target_user_id: string;
  action_type: string;
  reason: string;
  notes?: string | null;
  created_at: string;
  moderator: LogUser;
  user: LogUser;
}

export default function ModerationLogsPage() {
  const { currentUser } = useApp();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedActionFilter, setSelectedActionFilter] = useState("all");
  const [selectedLog, setSelectedLog] = useState<ModerationLog | null>(null);

  // Check role authorization (admin/moderator only)
  const isAuthorized =
    currentUser?.primary_role?.name === "admin" ||
    currentUser?.primary_role?.name === "moderator";

  const { data: logsData, isLoading, isError, error: queryError, refetch } = useQuery<ModerationLog[], Error>({
    queryKey: ["moderation-logs"],
    queryFn: async () => {
      const res = await axios.get("/api/moderation-logs");
      if (res.data?.data) return res.data.data;
      if (Array.isArray(res.data)) return res.data;
      throw new Error("Struktur log tidak dikenali.");
    },
    enabled: !!currentUser && isAuthorized,
  });

  const logs = logsData || [];
  const loading = isAuthorized ? isLoading : false;

  let error: string | null = null;
  if (currentUser && !isAuthorized) {
    error = "Akses ditolak. Halaman ini hanya untuk Moderator dan Admin.";
  } else if (isError && queryError) {
    const errObj: any = queryError;
    if (errObj?.response?.status === 401 || errObj?.response?.status === 403) {
      error = "Anda tidak memiliki akses untuk melihat log moderasi.";
    } else {
      error = errObj?.response?.data?.message || errObj?.message || "Gagal mengambil log moderasi dari server.";
    }
  }

  if (!currentUser) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4 select-none">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-cyan-500" />
        <p className="text-sm text-zinc-500 dark:text-zinc-400 font-medium">Memverifikasi sesi Anda...</p>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="p-12 text-center rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 max-w-2xl mx-auto space-y-4 select-none mt-10">
        <div className="mx-auto w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center text-red-500">
          <ShieldAlert className="h-6 w-6" />
        </div>
        <div className="space-y-1">
          <h3 className="text-base font-bold text-zinc-900 dark:text-white">Akses Ditolak</h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-md mx-auto leading-relaxed">
            Maaf, Anda tidak memiliki izin untuk melihat log aktivitas moderasi. Halaman ini terbatas untuk Admin dan Moderator.
          </p>
        </div>
      </div>
    );
  }

  // Format date helper
  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateStr;
    }
  };

  // Get Action Icon helper
  const getActionIcon = (actionType: string) => {
    const act = actionType.toLowerCase();
    switch (act) {
      case "delete_post":
        return <Trash2 className="h-3.5 w-3.5 text-red-500" />;
      case "ban":
        return <AlertCircle className="h-3.5 w-3.5 text-red-600" />;
      case "unban":
        return <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />;
      case "warning":
        return <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />;
      default:
        return <ScrollText className="h-3.5 w-3.5 text-cyan-500" />;
    }
  };

  // Get Action Badge Style helper
  const getActionBadgeStyle = (actionType: string) => {
    const act = actionType.toLowerCase();
    switch (act) {
      case "delete_post":
        return "bg-red-500/10 text-red-600 border-red-500/20 dark:bg-red-500/20 dark:text-red-400";
      case "ban":
        return "bg-red-600/10 text-red-700 border-red-600/20 dark:bg-red-600/25 dark:text-red-400";
      case "unban":
        return "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:bg-emerald-500/20 dark:text-emerald-400";
      case "warning":
        return "bg-amber-500/10 text-amber-600 border-amber-500/20 dark:bg-amber-500/20 dark:text-amber-400";
      default:
        return "bg-cyan-500/10 text-cyan-600 border-cyan-500/20 dark:bg-cyan-500/20 dark:text-cyan-400";
    }
  };

  // Format action text helper
  const formatActionText = (actionType: string) => {
    switch (actionType.toLowerCase()) {
      case "delete_post":
        return "Hapus Postingan";
      case "ban":
        return "Ban Anggota";
      case "unban":
        return "Buka Ban (Unban)";
      case "warning":
        return "Peringatan (Warning)";
      default:
        return actionType.replace(/_/g, " ");
    }
  };

  // Filter list
  const filteredLogs = logs.filter((log) => {
    const modName = (log.moderator?.username || "").toLowerCase();
    const userName = (log.user?.username || "").toLowerCase();
    const actionText = (log.action_type || "").toLowerCase();
    const reasonText = (log.reason || "").toLowerCase();
    const query = searchQuery.toLowerCase();

    const matchesSearch =
      modName.includes(query) ||
      userName.includes(query) ||
      actionText.includes(query) ||
      reasonText.includes(query);

    const matchesFilter =
      selectedActionFilter === "all" || log.action_type === selectedActionFilter;

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-zinc-200 dark:border-zinc-800">
        <div className="text-left">
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-zinc-900 to-zinc-600 dark:from-white dark:to-zinc-400 bg-clip-text text-transparent tracking-tight flex items-center gap-2">
            <ScrollText className="h-7 w-7 text-amber-500 shrink-0 animate-none" />
            <span>Log Aktivitas Moderasi</span>
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Pantau seluruh aktivitas moderasi yang dilakukan oleh staf moderator dan admin.
          </p>
        </div>

        <button
          onClick={() => refetch()}
          disabled={loading}
          className="flex items-center justify-center gap-2 px-4 py-2 text-xs font-bold rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white hover:bg-zinc-50 dark:bg-zinc-900 dark:hover:bg-zinc-800 transition-all cursor-pointer active:scale-97 disabled:opacity-50 shrink-0 select-none"
        >
          <RefreshCw className={`h-3.5 w-3.5 text-zinc-500 ${loading ? "animate-spin" : ""}`} />
          <span>Segarkan Log</span>
        </button>
      </div>

      {/* FILTER & SEARCH BAR */}
      {!loading && !error && (
        <div className="flex flex-col xl:flex-row gap-3 items-stretch xl:items-center justify-between bg-zinc-100/40 dark:bg-zinc-900/30 p-2 rounded-xl border border-zinc-200/60 dark:border-zinc-800/50 backdrop-blur-sm">
          {/* Search bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
            <input
              type="text"
              placeholder="Cari moderator, anggota target, atau deskripsi..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs pl-9 pr-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 transition-all"
            />
          </div>

          {/* Action Filter Pills */}
          <div className="flex flex-wrap gap-1.5 items-center select-none">
            <span className="text-[10px] uppercase tracking-wider text-zinc-400 dark:text-zinc-500 font-bold mr-1 flex items-center gap-1">
              <Filter className="h-3 w-3 text-cyan-500" />
              <span>Aksi:</span>
            </span>
            <button
              onClick={() => setSelectedActionFilter("all")}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                selectedActionFilter === "all"
                  ? "bg-cyan-500/10 text-cyan-600 border-cyan-400/40 dark:bg-cyan-500/20 dark:text-cyan-400 shadow-sm"
                  : "text-zinc-500 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900"
              }`}
            >
              Semua ({logs.length})
            </button>
            <button
              onClick={() => setSelectedActionFilter("delete_post")}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                selectedActionFilter === "delete_post"
                  ? "bg-red-500/10 text-red-600 border-red-500/40 dark:bg-red-500/20 dark:text-red-400 shadow-sm"
                  : "text-zinc-500 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900"
              }`}
            >
              Hapus Post
            </button>
            <button
              onClick={() => setSelectedActionFilter("ban")}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                selectedActionFilter === "ban"
                  ? "bg-red-600/10 text-red-700 border-red-600/40 dark:bg-red-600/20 dark:text-red-400 shadow-sm"
                  : "text-zinc-500 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900"
              }`}
            >
              Ban Anggota
            </button>
            <button
              onClick={() => setSelectedActionFilter("unban")}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                selectedActionFilter === "unban"
                  ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/40 dark:bg-emerald-500/20 dark:text-emerald-400 shadow-sm"
                  : "text-zinc-500 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900"
              }`}
            >
              Unban
            </button>
            <button
              onClick={() => setSelectedActionFilter("warning")}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                selectedActionFilter === "warning"
                  ? "bg-amber-500/10 text-amber-600 border-amber-500/40 dark:bg-amber-500/20 dark:text-amber-400 shadow-sm"
                  : "text-zinc-500 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900"
              }`}
            >
              Peringatan
            </button>
          </div>
        </div>
      )}

      {/* TABLE */}
      {loading ? (
        <div className="text-center py-20 text-zinc-500 text-sm animate-pulse select-none font-medium">Memuat log aktivitas...</div>
      ) : error ? (
        <div className="p-12 text-center rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 max-w-2xl mx-auto space-y-3">
          <p className="text-base font-bold text-zinc-900 dark:text-white">⚠️ Gagal Memuat Log</p>
          <p className="text-xs text-zinc-500">{error}</p>
        </div>
      ) : filteredLogs.length === 0 ? (
        <div className="p-12 text-center rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 max-w-md mx-auto space-y-2 select-none">
          <p className="text-sm font-bold text-zinc-900 dark:text-white">Tidak ada log aktivitas</p>
          <p className="text-xs text-zinc-500">Log tidak ditemukan untuk pencarian atau filter saat ini.</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-zinc-950 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden select-none">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-50/70 dark:bg-zinc-900/60 border-b border-zinc-200 dark:border-zinc-800 text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                  <th className="py-3.5 px-5">Tanggal & Waktu</th>
                  <th className="py-3.5 px-5">Staf Moderator</th>
                  <th className="py-3.5 px-5">Aksi Tindakan</th>
                  <th className="py-3.5 px-5">Anggota Target</th>
                  <th className="py-3.5 px-5">Alasan Tindakan</th>
                  <th className="py-3.5 px-5 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200/60 dark:divide-zinc-800/60">
                {filteredLogs.map((log) => {
                  const modName = log.moderator?.username || "Sistem";
                  const targetName = log.user?.username || "N/A";
                  return (
                    <tr
                      key={log.id}
                      className="text-xs text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50/50 dark:hover:bg-zinc-900/20 transition-colors"
                    >
                      {/* Date & Time */}
                      <td className="py-3.5 px-5 whitespace-nowrap">
                        <span className="flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400 font-medium">
                          <Clock className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
                          <span>{formatDate(log.created_at)}</span>
                        </span>
                      </td>

                      {/* Moderator */}
                      <td className="py-3.5 px-5 font-semibold">
                        <span className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center text-zinc-400 shrink-0 text-[10px] uppercase font-bold overflow-hidden relative">
                            {log.moderator?.avatar_url ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={log.moderator.avatar_url.startsWith("http") ? log.moderator.avatar_url : `https://pegaduanmasyarakat.alwaysdata.net/storage/${log.moderator.avatar_url}`}
                                alt={modName}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              modName.charAt(0)
                            )}
                          </div>
                          <span className="truncate max-w-[110px]" title={modName}>
                            {modName}
                          </span>
                        </span>
                      </td>

                      {/* Action Badge */}
                      <td className="py-3.5 px-5 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md border text-[10px] font-bold uppercase tracking-wider ${getActionBadgeStyle(log.action_type)}`}>
                          {getActionIcon(log.action_type)}
                          <span>{formatActionText(log.action_type)}</span>
                        </span>
                      </td>

                      {/* Target User */}
                      <td className="py-3.5 px-5 font-semibold">
                        <span className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center text-zinc-400 shrink-0 text-[10px] uppercase font-bold overflow-hidden relative">
                            {log.user?.avatar_url ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={log.user.avatar_url.startsWith("http") ? log.user.avatar_url : `https://pegaduanmasyarakat.alwaysdata.net/storage/${log.user.avatar_url}`}
                                alt={targetName}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              targetName.charAt(0)
                            )}
                          </div>
                          <span className="truncate max-w-[110px]" title={targetName}>
                            {targetName}
                          </span>
                        </span>
                      </td>

                      {/* Reason */}
                      <td className="py-3.5 px-5 text-zinc-500 dark:text-zinc-400 max-w-[200px] truncate" title={log.reason}>
                        <span className="font-normal">{log.reason}</span>
                      </td>

                      {/* Details View Trigger */}
                      <td className="py-3.5 px-5 text-center">
                        <button
                          onClick={() => setSelectedLog(log)}
                          className="p-1 hover:text-cyan-500 dark:hover:text-cyan-400 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800/80 transition-all cursor-pointer inline-flex items-center justify-center"
                          title="Lihat Detail Lengkap Log"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* DETAIL MODAL DRAWER */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-md transition-opacity duration-300 select-none">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden transform transition-all duration-300">
            {/* Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/5 dark:bg-zinc-900/5">
              <h2 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                <ScrollText className="h-4 w-4 text-cyan-500 animate-none" />
                <span>Detail Log Tindakan Moderasi</span>
              </h2>
              <button
                onClick={() => setSelectedLog(null)}
                className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-5 text-left max-h-[70vh] overflow-y-auto">
              {/* Primary action statement */}
              <div className="p-3 bg-zinc-500/5 dark:bg-zinc-950/50 rounded-xl border border-zinc-200/50 dark:border-zinc-800 text-xs flex items-start gap-3">
                <div className="mt-0.5">{getActionIcon(selectedLog.action_type)}</div>
                <div className="space-y-1">
                  <p className="font-semibold text-zinc-800 dark:text-zinc-100">
                    Moderator <span className="text-cyan-500 font-bold">@{selectedLog.moderator.username}</span> melakukan tindakan <span className="text-amber-500 font-extrabold uppercase tracking-wide text-[10px]">{formatActionText(selectedLog.action_type)}</span> kepada anggota <span className="text-cyan-500 font-bold">@{selectedLog.user.username}</span>.
                  </p>
                  <p className="text-[10px] text-zinc-400 font-mono">{formatDate(selectedLog.created_at)}</p>
                </div>
              </div>

              {/* Profiles layout side-by-side */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Moderator profile card */}
                <div className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/40 space-y-3">
                  <span className="block text-[10px] font-bold uppercase text-zinc-400 dark:text-zinc-500 tracking-wider">Profil Moderator</span>
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center font-bold text-xs uppercase overflow-hidden shrink-0 relative">
                      {selectedLog.moderator.avatar_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={selectedLog.moderator.avatar_url.startsWith("http") ? selectedLog.moderator.avatar_url : `https://pegaduanmasyarakat.alwaysdata.net/storage/${selectedLog.moderator.avatar_url}`}
                          alt={selectedLog.moderator.username}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        selectedLog.moderator.username.charAt(0)
                      )}
                    </div>
                    <div className="min-w-0">
                      <span className="font-bold text-xs text-zinc-900 dark:text-white truncate block">@{selectedLog.moderator.username}</span>
                      <span className="text-[10px] text-zinc-400 dark:text-zinc-500 block truncate">{selectedLog.moderator.email}</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[10px] pt-2 border-t border-zinc-200/50 dark:border-zinc-800/60 text-zinc-500">
                    <div>Level: <strong className="text-zinc-800 dark:text-zinc-300 font-bold">{selectedLog.moderator.level || 1}</strong></div>
                    <div>Reputasi: <strong className="text-zinc-800 dark:text-zinc-300 font-mono font-bold">{selectedLog.moderator.reputation_points || 0}</strong></div>
                  </div>
                </div>

                {/* Target profile card */}
                <div className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/40 space-y-3">
                  <span className="block text-[10px] font-bold uppercase text-zinc-400 dark:text-zinc-500 tracking-wider">Profil Anggota</span>
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center font-bold text-xs uppercase overflow-hidden shrink-0 relative">
                      {selectedLog.user.avatar_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={selectedLog.user.avatar_url.startsWith("http") ? selectedLog.user.avatar_url : `https://pegaduanmasyarakat.alwaysdata.net/storage/${selectedLog.user.avatar_url}`}
                          alt={selectedLog.user.username}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        selectedLog.user.username.charAt(0)
                      )}
                    </div>
                    <div className="min-w-0">
                      <span className="font-bold text-xs text-zinc-900 dark:text-white truncate block">@{selectedLog.user.username}</span>
                      <span className="text-[10px] text-zinc-400 dark:text-zinc-500 block truncate">{selectedLog.user.email}</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[10px] pt-2 border-t border-zinc-200/50 dark:border-zinc-800/60 text-zinc-500">
                    <div>Level: <strong className="text-zinc-800 dark:text-zinc-300 font-bold">{selectedLog.user.level || 1}</strong></div>
                    <div>Reputasi: <strong className="text-zinc-800 dark:text-zinc-300 font-mono font-bold">{selectedLog.user.reputation_points || 0}</strong></div>
                  </div>
                </div>
              </div>

              {/* Action reason */}
              <div className="space-y-1.5">
                <span className="block text-[10px] font-bold uppercase text-zinc-400 dark:text-zinc-500 tracking-wider">Alasan Moderasi</span>
                <div className="p-3 bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200/60 dark:border-zinc-850 rounded-xl text-xs text-zinc-700 dark:text-zinc-300 italic leading-relaxed">
                  "{selectedLog.reason}"
                </div>
              </div>

              {/* Action notes (catatan tambahan) */}
              {selectedLog.notes && (
                <div className="space-y-1.5">
                  <span className="block text-[10px] font-bold uppercase text-zinc-400 dark:text-zinc-500 tracking-wider">Catatan Tambahan (Notes)</span>
                  <div className="p-3 bg-zinc-550/5 dark:bg-zinc-950/60 border border-zinc-200/60 dark:border-zinc-800 rounded-xl text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed font-semibold">
                    {selectedLog.notes}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/5 dark:bg-zinc-900/5 text-right">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-4 py-2 text-xs font-bold border border-zinc-200 dark:border-zinc-800 bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 rounded-lg transition-all cursor-pointer active:scale-97"
              >
                Tutup Detail
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
