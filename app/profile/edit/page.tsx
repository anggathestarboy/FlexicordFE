"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import {
  Camera,
  ChevronLeft,
  Loader2,
  User as UserIcon,
  Mail as MailIcon,
  FileText as BioIcon,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import {
  validateUsername,
  validateEmail,
} from "@/app/api/profile/update/ProfileUpdateType";

const STORAGE_BASE = "https://pegaduanmasyarakat.alwaysdata.net/storage/";

function avatarSrc(url: string | null | undefined): string | null {
  if (!url) return null;
  return url.startsWith("http") ? url : `${STORAGE_BASE}${url}`;
}

export default function EditProfilePage() {
  const router = useRouter();
  const { currentUser, setCurrentUser, showNotification } = useApp();

  // Form states
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [bio, setBio] = useState("");
  
  // Avatar states
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  // UI states
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  const fileInputRef = useRef<HTMLInputElement>(null);

  // 1. Authenticate and populate form
  useEffect(() => {
    // If the global state already has the user, use it
    if (currentUser) {
      setUsername(currentUser.username || "");
      setEmail(currentUser.email || "");
      setBio(currentUser.bio || "");
      setPreviewUrl(avatarSrc(currentUser.avatar_url));
      setCheckingAuth(false);
    } else {
      // Otherwise, double check by fetching /api/me directly to prevent false redirects
      const checkSession = async () => {
        try {
          const res = await fetch("/api/me");
          if (res.ok) {
            const data = await res.json();
            if (data.user) {
              setCurrentUser(data.user);
              setUsername(data.user.username || "");
              setEmail(data.user.email || "");
              setBio(data.user.bio || "");
              setPreviewUrl(avatarSrc(data.user.avatar_url));
            } else {
              router.push("/login");
            }
          } else {
            router.push("/login");
          }
        } catch (err) {
          console.error("Error checking auth:", err);
          router.push("/login");
        } finally {
          setCheckingAuth(false);
        }
      };
      checkSession();
    }
  }, [currentUser, router, setCurrentUser]);

  // Clean up object URL to prevent memory leaks
  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  // 2. Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type (must be image)
    if (!file.type.startsWith("image/")) {
      setErrorMsg("File harus berupa gambar.");
      return;
    }

    // Validate size (max 2MB for example)
    if (file.size > 2 * 1024 * 1024) {
      setErrorMsg("Ukuran file maksimal adalah 2MB.");
      return;
    }

    // Update file state and preview
    setAvatarFile(file);
    const blobUrl = URL.createObjectURL(file);
    setPreviewUrl(blobUrl);
    setErrorMsg(null); // Clear errors if file is valid
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  // 3. Form Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setFieldErrors({});

    // Client-side validations
    const userErr = validateUsername(username);
    if (userErr) {
      setErrorMsg(userErr);
      return;
    }

    const emailErr = validateEmail(email);
    if (emailErr) {
      setErrorMsg(emailErr);
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("username", username.trim());
      formData.append("email", email.trim());
      formData.append("bio", bio.trim());
      
      if (avatarFile) {
        formData.append("avatar_url", avatarFile);
      }

      const response = await fetch("/api/profile/update", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setSuccessMsg(data.message || "Profil berhasil diperbarui!");
        
        // Sync context state by re-fetching /api/me
        const meRes = await fetch("/api/me");
        if (meRes.ok) {
          const meData = await meRes.json();
          if (meData.user) {
            setCurrentUser(meData.user);
          }
        }

        if (showNotification) {
          showNotification(data.message || "Profil berhasil diperbarui! 🎉");
        }

        // Wait a bit to show success message, then redirect back to profile
        setTimeout(() => {
          router.push("/profile");
        }, 1500);
      } else {
        if (response.status === 422 && data.errors) {
          // Validation error from backend
          setFieldErrors(data.errors);
          setErrorMsg(data.message || "Validasi gagal. Periksa kembali isian Anda.");
        } else {
          setErrorMsg(data.message || "Gagal memperbarui profil.");
        }
      }
    } catch (err) {
      console.error("Submit profile error:", err);
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
    <div className="max-w-2xl mx-auto space-y-6 pb-10">
      {/* Header with back navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.push("/profile")}
          className="inline-flex items-center gap-1 text-xs font-semibold text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors cursor-pointer"
        >
          <ChevronLeft className="h-4 w-4" />
          Kembali ke Profil
        </button>
        <span className="text-[10px] text-zinc-400 font-mono">Pengaturan Akun</span>
      </div>

      <div className="bg-white dark:bg-zinc-950 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
        {/* Decorative Header Bar */}
        <div className="h-3 bg-gradient-to-r from-brand-blue to-sky-500" />

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="border-b border-zinc-150 dark:border-zinc-800 pb-4">
            <h1 className="text-lg font-bold text-zinc-900 dark:text-white">
              Edit Profil Anda
            </h1>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              Perbarui kredensial akun, bio, dan foto profil Anda.
            </p>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-xl text-red-700 dark:text-red-400 text-xs sm:text-sm flex items-start gap-2.5">
              <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-semibold">{errorMsg}</p>
                {Object.keys(fieldErrors).length > 0 && (
                  <ul className="list-disc list-inside text-xs mt-1 space-y-0.5 opacity-90">
                    {Object.entries(fieldErrors).map(([field, errors]) => (
                      <li key={field}>
                        <span className="capitalize font-semibold">{field}</span>: {errors.join(", ")}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}

          {/* Success Message */}
          {successMsg && (
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-250 dark:border-emerald-900/50 rounded-xl text-emerald-800 dark:text-emerald-400 text-xs sm:text-sm flex items-center gap-2.5">
              <CheckCircle2 className="h-5 w-5 text-emerald-550 shrink-0" />
              <p className="font-semibold">{successMsg}</p>
            </div>
          )}

          {/* 1. Avatar Upload Section */}
          <div className="flex flex-col items-center gap-3 py-2">
            <div
              onClick={triggerFileSelect}
              className="relative group cursor-pointer w-24 h-24 rounded-2xl overflow-hidden border-4 border-zinc-100 dark:border-zinc-900 shadow-md bg-zinc-100 dark:bg-zinc-800 transition-transform hover:scale-[1.02]"
              title="Klik untuk mengubah foto profil"
            >
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt="Avatar Preview"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-brand-blue text-white font-black text-3xl uppercase">
                  {username ? username.charAt(0) : <UserIcon className="h-8 w-8" />}
                </div>
              )}
              {/* Overlay on hover */}
              <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <Camera className="w-6 h-6 text-white mb-1" />
                <span className="text-[10px] text-white font-semibold uppercase tracking-wider">
                  Ubah Foto
                </span>
              </div>
            </div>
            
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />
            
            <div className="text-center">
              <button
                type="button"
                onClick={triggerFileSelect}
                className="text-xs text-brand-blue hover:underline font-semibold"
              >
                Unggah Foto Baru
              </button>
              <p className="text-[10px] text-zinc-400 mt-0.5">
                PNG, JPG, atau GIF. Maks 2MB.
              </p>
            </div>
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            {/* Username Input */}
            <div className="space-y-1.5">
              <label
                htmlFor="username"
                className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider"
              >
                Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-400 dark:text-zinc-600">
                  <UserIcon className="h-4 w-4" />
                </div>
                <input
                  id="username"
                  type="text"
                  required
                  maxLength={12}
                  value={username}
                  onChange={(e) => setUsername(e.target.value.replace(/\s+/g, ""))} // Auto-remove spaces
                  placeholder="Masukkan username baru..."
                  className="block w-full pl-10 pr-3 py-2.5 text-sm bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue text-zinc-900 dark:text-white transition-all font-mono"
                />
              </div>
              <div className="flex justify-between items-center text-[10px] text-zinc-400 px-1">
                <span>Hanya huruf, angka, dan underscore (_).</span>
                <span className={username.length > 12 ? "text-red-500 font-bold" : ""}>
                  {username.length}/12
                </span>
              </div>
            </div>

            {/* Email Input */}
            <div className="space-y-1.5">
              <label
                htmlFor="email"
                className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider"
              >
                Alamat Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-400 dark:text-zinc-600">
                  <MailIcon className="h-4 w-4" />
                </div>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Masukkan alamat email..."
                  className="block w-full pl-10 pr-3 py-2.5 text-sm bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue text-zinc-900 dark:text-white transition-all"
                />
              </div>
            </div>

            {/* Bio TextArea */}
            <div className="space-y-1.5">
              <label
                htmlFor="bio"
                className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider"
              >
                Bio Singkat
              </label>
              <div className="relative">
                <div className="absolute top-3 left-0 pl-3 pointer-events-none text-zinc-400 dark:text-zinc-600">
                  <BioIcon className="h-4 w-4" />
                </div>
                <textarea
                  id="bio"
                  rows={4}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Ceritakan sedikit tentang diri Anda (opsional)..."
                  className="block w-full pl-10 pr-3 py-2.5 text-sm bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue text-zinc-900 dark:text-white transition-all resize-none"
                />
              </div>
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
                "Simpan Perubahan"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
