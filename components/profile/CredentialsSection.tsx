"use client";

import React from "react";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  Shield,
  CheckCircle2,
  FileText,
  Mail,
  Star,
  Calendar,
  Users,
  Award,
  UserCheck,
} from "lucide-react";
import { UserDetail } from "./types";
import { primaryRole, roleBadgeStyle, formatDateFull } from "./helpers";

interface CredentialsSectionProps {
  user: UserDetail;
  onNavigatePoints?: () => void;
}

export default function CredentialsSection({
  user,
  onNavigatePoints,
}: CredentialsSectionProps) {
  const role = primaryRole(user.roles);
  const router = useRouter();

  // Renders the list of account details, security settings, and registration statistics
  return (
    <div className="space-y-5">
      <div className="p-4 bg-zinc-50 dark:bg-zinc-900/50 rounded-xl border border-zinc-200 dark:border-zinc-800 space-y-3">
        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1.5">
          <ShieldCheck className="h-3.5 w-3.5 text-brand-blue" />
          Identitas Akun
        </p>

        {[
          { icon: <FileText className="h-3.5 w-3.5" />, label: "ID Pengguna", value: user.id },
          { icon: <Mail className="h-3.5 w-3.5" />, label: "Email", value: user.email },
          { icon: <Star className="h-3.5 w-3.5" />, label: "Username", value: `@${user.username}` },
        ].map(({ icon, label, value }) => (
          <div key={label} className="flex items-start justify-between gap-3 text-xs py-1.5 border-b border-zinc-100 dark:border-zinc-800/60 last:border-0">
            <span className="flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400 shrink-0">
              <span className="text-zinc-400">{icon}</span>
              {label}
            </span>
            <span className="font-mono font-semibold text-zinc-900 dark:text-white text-right break-all">
              {value}
            </span>
          </div>
        ))}
      </div>

      <div className="p-4 bg-zinc-50 dark:bg-zinc-900/50 rounded-xl border border-zinc-200 dark:border-zinc-800 space-y-3">
        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1.5">
          <Shield className="h-3.5 w-3.5 text-brand-blue" />
          Status & Keamanan
        </p>

        <div className="flex items-center justify-between text-xs py-1.5 border-b border-zinc-100 dark:border-zinc-800/60">
          <span className="text-zinc-500 dark:text-zinc-400">Status Akun</span>
          {user.is_banned ? (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 px-2 py-0.5 rounded-full">
              <Shield className="h-3 w-3" /> Dibanned
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 px-2 py-0.5 rounded-full">
              <CheckCircle2 className="h-3 w-3" /> Aktif
            </span>
          )}
        </div>

        <div className="flex items-center justify-between text-xs py-1.5 border-b border-zinc-100 dark:border-zinc-800/60">
          <span className="text-zinc-500 dark:text-zinc-400">Role Utama</span>
          <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${roleBadgeStyle(role)}`}>
            {role}
          </span>
        </div>

        <div className="flex items-start justify-between gap-3 text-xs py-1.5 border-b border-zinc-100 dark:border-zinc-800/60">
          <span className="text-zinc-500 dark:text-zinc-400">Semua Role</span>
          <div className="flex flex-wrap gap-1 justify-end">
            {user.roles.length > 0 ? user.roles.map((r) => (
              <span key={r.id} className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${roleBadgeStyle(r.name)}`}>
                {r.name}
              </span>
            )) : (
              <span className="text-zinc-400 italic">Tidak ada role</span>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between text-xs py-1.5 border-b border-zinc-100 dark:border-zinc-800/60">
          <span className="text-zinc-500 dark:text-zinc-400">Level</span>
          <span className="font-mono font-bold text-brand-blue">Lv. {user.level}</span>
        </div>

        <div className="flex items-center justify-between text-xs py-1.5 border-b border-zinc-100 dark:border-zinc-800/60">
          <span className="text-zinc-500 dark:text-zinc-400">Reputasi</span>
          <span 
            className="font-mono font-black text-brand-blue text-sm cursor-pointer hover:underline"
            onClick={() => onNavigatePoints && onNavigatePoints()}
          >
            {user.reputation_points.toLocaleString()} pts
          </span>
        </div>

        <div className="flex items-center justify-between text-xs py-1.5">
          <span className="text-zinc-500 dark:text-zinc-400 font-medium">Kata Sandi</span>
          <button
            onClick={() => router.push("/profile/change-password")}
            className="text-[10px] font-bold text-brand-blue hover:underline cursor-pointer"
          >
            Ubah Password
          </button>
        </div>
      </div>

      <div className="p-4 bg-zinc-50 dark:bg-zinc-900/50 rounded-xl border border-zinc-200 dark:border-zinc-800 space-y-3">
        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1.5">
          <Calendar className="h-3.5 w-3.5 text-brand-blue" />
          Riwayat Akun
        </p>
        {[
          { label: "Tanggal Daftar", value: formatDateFull(user.created_at) },
          { label: "Terakhir Diperbarui", value: formatDateFull(user.updated_at) },
        ].map(({ label, value }) => (
          <div key={label} className="flex items-start justify-between gap-3 text-xs py-1.5 border-b border-zinc-100 dark:border-zinc-800/60 last:border-0">
            <span className="text-zinc-500 dark:text-zinc-400 shrink-0">{label}</span>
            <span className="font-mono font-semibold text-zinc-900 dark:text-white text-right">{value}</span>
          </div>
        ))}
      </div>

      <div className="p-4 bg-zinc-50 dark:bg-zinc-900/50 rounded-xl border border-zinc-200 dark:border-zinc-800 space-y-3">
        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1.5">
          <Users className="h-3.5 w-3.5 text-brand-blue" />
          Statistik Sosial
        </p>
        {[
          { label: "Total Pertanyaan", value: user.posts_count },
          { label: "Pengikut", value: user.followers_count },
          { label: "Mengikuti", value: user.following_count },
          { label: "Total Lencana", value: user.badges_count },
        ].map(({ label, value }) => (
          <div key={label} className="flex items-center justify-between text-xs py-1.5 border-b border-zinc-100 dark:border-zinc-800/60 last:border-0">
            <span className="text-zinc-500 dark:text-zinc-400">{label}</span>
            <span className="font-mono font-bold text-zinc-900 dark:text-white">{value.toLocaleString()}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
