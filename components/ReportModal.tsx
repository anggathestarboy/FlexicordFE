"use client";

import React, { useState, useEffect } from "react";
import { X, Flag, Loader2, CheckCircle2, AlertCircle } from "lucide-react";

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetId: string;
  targetType: "post" | "comment" | "user";
  onSuccess?: () => void;
}

export default function ReportModal({
  isOpen,
  onClose,
  targetId,
  targetType,
  onSuccess,
}: ReportModalProps) {
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Reset form states when modal opens/closes or target changes
  useEffect(() => {
    if (isOpen) {
      setReason("");
      setDescription("");
      setError(null);
      setSuccess(false);
      setLoading(false);
    }
  }, [isOpen, targetId, targetType]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      setError("Alasan wajib diisi.");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          target_id: targetId,
          target_type: targetType,
          reason: reason.trim(),
          description: description.trim() ? description.trim() : null,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.message || `Gagal mengirim laporan. Kode error: ${res.status}`);
      }

      setSuccess(true);
      if (onSuccess) {
        onSuccess();
      }
      setTimeout(() => {
        onClose();
      }, 1800);
    } catch (err: any) {
      console.error("Report submit error:", err);
      setError(err.message || "Terjadi kesalahan jaringan atau server.");
    } finally {
      setLoading(false);
    }
  };

  const getTargetLabel = () => {
    if (targetType === "post") return "Postingan";
    if (targetType === "comment") return "Komentar / Balasan";
    return "Pengguna";
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-md transition-opacity duration-300">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden transform transition-all duration-300 select-none animate-in scale-in duration-200">
        
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/20">
          <h2 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2">
            <Flag className="h-4.5 w-4.5 text-orange-500" />
            <span>Laporkan {getTargetLabel()}</span>
          </h2>
          <button
            onClick={onClose}
            disabled={loading}
            className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-205 p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer disabled:opacity-50"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {success ? (
            <div className="text-center py-6 space-y-3">
              <div className="mx-auto w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <h3 className="text-sm font-bold text-emerald-600 dark:text-emerald-400">Laporan Terkirim!</h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed max-w-xs mx-auto">
                Terima kasih atas laporan Anda. Moderator kami akan memeriksa pengaduan ini secepatnya.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-left">
              {error && (
                <div className="p-3 text-xs bg-red-500/10 text-red-500 border border-red-500/20 rounded-lg flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0 text-red-500 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {/* Target ID preview (shortened) */}
              <div className="bg-zinc-50 dark:bg-zinc-950/40 p-3 rounded-lg border border-zinc-200/50 dark:border-zinc-850 text-[10px] font-mono text-zinc-450 dark:text-zinc-500">
                <span>TARGET ID: </span>
                <span className="font-bold text-zinc-700 dark:text-zinc-300">{targetId}</span>
              </div>

              {/* Reason Input */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
                  Alasan Laporan <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  maxLength={255}
                  placeholder="Cth: Spam, ujaran kebencian, sara..."
                  className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-zinc-250 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 transition-all font-medium"
                  required
                  disabled={loading}
                />
              </div>

              {/* Description textarea */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
                    Deskripsi Detail (Opsional)
                  </label>
                  <span className={`text-[10px] ${description.length > 500 ? "text-red-500 font-bold" : "text-zinc-400"}`}>
                    {description.length}/500
                  </span>
                </div>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  maxLength={500}
                  rows={4}
                  placeholder="Berikan penjelasan lebih detail tentang dugaan pelanggaran..."
                  className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-zinc-250 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 transition-all resize-none font-medium"
                  disabled={loading}
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-3 border-t border-zinc-150 dark:border-zinc-850/80 mt-6">
                <button
                  type="submit"
                  disabled={loading || !reason.trim() || description.length > 500}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-orange-600 hover:bg-orange-550 disabled:bg-orange-500/50 disabled:cursor-not-allowed rounded-xl transition-colors cursor-pointer shadow-sm active:scale-97"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span>Mengirim...</span>
                    </>
                  ) : (
                    <span>Kirim Laporan</span>
                  )}
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  disabled={loading}
                  className="flex-1 px-4 py-2.5 text-xs font-bold border border-zinc-200 dark:border-zinc-800 bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-950 dark:hover:bg-zinc-900 text-zinc-800 dark:text-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-colors cursor-pointer active:scale-97"
                >
                  Batal
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
