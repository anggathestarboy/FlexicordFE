"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import {
  Key,
  Lock,
  ChevronLeft,
  Loader2,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

export default function ChangePasswordPage() {
  const router = useRouter();
  const { currentUser, showNotification } = useApp();

  // Form states
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPasswordConfirmation, setNewPasswordConfirmation] = useState("");

  // Password visibility states
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // UI states
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // 1. Session check to protect the route
  useEffect(() => {
    // If not checking anymore and currentUser is null, redirect
    const checkSession = async () => {
      try {
        const res = await fetch("/api/me");
        if (!res.ok) {
          router.push("/login");
        }
      } catch (err) {
        console.error("Session check error:", err);
        router.push("/login");
      } finally {
        setCheckingAuth(false);
      }
    };
    checkSession();
  }, [router]);

  // 2. Client-side field-by-field validation
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!currentPassword) {
      errors.current_password = "Password saat ini wajib diisi.";
    }

    if (!newPassword) {
      errors.new_password = "Password baru wajib diisi.";
    } else if (newPassword.length < 6) {
      errors.new_password = "Password baru minimal harus 6 karakter.";
    }

    if (!newPasswordConfirmation) {
      errors.new_password_confirmation = "Konfirmasi password baru wajib diisi.";
    } else if (newPassword !== newPasswordConfirmation) {
      errors.new_password_confirmation = "Konfirmasi password baru tidak cocok.";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // 3. Handle Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setFieldErrors({});

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          current_password: currentPassword,
          new_password: newPassword,
          new_password_confirmation: newPasswordConfirmation,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSuccessMsg(data.message || "Password berhasil diperbarui!");
        
        if (showNotification) {
          showNotification(data.message || "Password berhasil diperbarui! 🎉", "success");
        }

        // Reset fields
        setCurrentPassword("");
        setNewPassword("");
        setNewPasswordConfirmation("");

        // Redirect back to profile after a short delay
        setTimeout(() => {
          router.push("/profile");
        }, 1500);
      } else {
        // Handle validation/API errors
        setErrorMsg(data.message || "Gagal mengubah password.");
      }
    } catch (err) {
      console.error("Change password error:", err);
      setErrorMsg("Terjadi kesalahan jaringan atau server.");
    } finally {
      setLoading(false);
    }
  };

  if (checkingAuth) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <Loader2 className="animate-spin h-9 w-9 text-brand-blue" />
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Memverifikasi sesi Anda…
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto space-y-6 pb-10">
      {/* Header with back navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.push("/profile")}
          className="inline-flex items-center gap-1 text-xs font-semibold text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors cursor-pointer"
        >
          <ChevronLeft className="h-4 w-4" />
          Kembali ke Profil
        </button>
        <span className="text-[10px] text-zinc-400 font-mono">Keamanan</span>
      </div>

      <div className="bg-white dark:bg-zinc-950 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
        {/* Decorative Header Bar */}
        <div className="h-3 bg-gradient-to-r from-brand-blue to-sky-500" />

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="border-b border-zinc-150 dark:border-zinc-800 pb-4">
            <h1 className="text-lg font-bold text-zinc-900 dark:text-white">
              Ubah Password
            </h1>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              Demi keamanan, disarankan untuk memperbarui password Anda secara berkala.
            </p>
          </div>

          {/* General Error Alert */}
          {errorMsg && (
            <div className="p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-xl text-red-700 dark:text-red-400 text-xs sm:text-sm flex items-start gap-2.5">
              <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
              <p className="font-semibold">{errorMsg}</p>
            </div>
          )}

          {/* Success Message Alert */}
          {successMsg && (
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-250 dark:border-emerald-900/50 rounded-xl text-emerald-800 dark:text-emerald-400 text-xs sm:text-sm flex items-center gap-2.5">
              <CheckCircle2 className="h-5 w-5 text-emerald-550 shrink-0" />
              <p className="font-semibold">{successMsg}</p>
            </div>
          )}

          {/* Form Fields */}
          <div className="space-y-4">
            {/* Current Password */}
            <div className="space-y-1.5">
              <label
                htmlFor="current_password"
                className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider"
              >
                Password Saat Ini
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-400 dark:text-zinc-600">
                  <Key className="h-4 w-4" />
                </div>
                <input
                  id="current_password"
                  type={showCurrent ? "text" : "password"}
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Masukkan password saat ini..."
                  className="block w-full pl-10 pr-10 py-2.5 text-sm bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue text-zinc-900 dark:text-white transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent(!showCurrent)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-400 dark:text-zinc-600 hover:text-zinc-600 dark:hover:text-zinc-400"
                >
                  {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {fieldErrors.current_password && (
                <p className="text-[11px] text-red-500 font-semibold px-1">
                  {fieldErrors.current_password}
                </p>
              )}
            </div>

            {/* New Password */}
            <div className="space-y-1.5">
              <label
                htmlFor="new_password"
                className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider"
              >
                Password Baru
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-400 dark:text-zinc-600">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  id="new_password"
                  type={showNew ? "text" : "password"}
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Masukkan password baru..."
                  className="block w-full pl-10 pr-10 py-2.5 text-sm bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue text-zinc-900 dark:text-white transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-400 dark:text-zinc-600 hover:text-zinc-600 dark:hover:text-zinc-400"
                >
                  {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <div className="flex justify-between items-center text-[10px] text-zinc-400 px-1">
                <span>Minimal harus 6 karakter.</span>
              </div>
              {fieldErrors.new_password && (
                <p className="text-[11px] text-red-500 font-semibold px-1">
                  {fieldErrors.new_password}
                </p>
              )}
            </div>

            {/* New Password Confirmation */}
            <div className="space-y-1.5">
              <label
                htmlFor="new_password_confirmation"
                className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider"
              >
                Konfirmasi Password Baru
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-400 dark:text-zinc-600">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  id="new_password_confirmation"
                  type={showConfirm ? "text" : "password"}
                  required
                  value={newPasswordConfirmation}
                  onChange={(e) => setNewPasswordConfirmation(e.target.value)}
                  placeholder="Konfirmasi password baru..."
                  className="block w-full pl-10 pr-10 py-2.5 text-sm bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue text-zinc-900 dark:text-white transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-400 dark:text-zinc-600 hover:text-zinc-600 dark:hover:text-zinc-400"
                >
                  {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {fieldErrors.new_password_confirmation && (
                <p className="text-[11px] text-red-500 font-semibold px-1">
                  {fieldErrors.new_password_confirmation}
                </p>
              )}
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-150 dark:border-zinc-800">
            <button
              type="button"
              disabled={loading}
              onClick={() => router.push("/profile")}
              className="px-4 py-2 text-xs font-semibold rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-750 dark:text-zinc-300 bg-transparent hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-all cursor-pointer disabled:opacity-50"
            >
              Batalkan
            </button>
            
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-semibold rounded-xl bg-brand-blue hover:bg-brand-blue/90 text-white shadow-sm transition-all cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin h-3.5 w-3.5" />
                  Menyimpan...
                </>
              ) : (
                "Ubah Password"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
