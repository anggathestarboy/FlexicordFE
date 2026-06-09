"use client";

import React from "react";
import {
  Mail,
  Lock,
  ArrowRight,
  Eye,
  EyeOff,
  ShieldAlert,
  MessageSquare,
  Trophy,
} from "lucide-react";
import FlexicordLogo from "@/components/FlexicordLogo";
import { useApp } from "@/context/AppContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";

const features = [
  {
    icon: <MessageSquare className="h-4 w-4 text-sky-400" />,
    title: "Tanya apa saja",
    desc: "Bug, arsitektur, deployment — semua bisa didiskusikan.",
  },
  {
    icon: <Trophy className="h-4 w-4 text-sky-400" />,
    title: "Kumpulkan reputasi",
    desc: "Jawab pertanyaan, raih poin, dan naik peringkat.",
  },
];

// ── API function ──
const loginApi = async (values: { username: string; password: string }) => {
  const { data } = await axios.post("/api/login", values);
  return data;
};

// ── Yup validation schema ──
const loginSchema = Yup.object({
  username: Yup.string().required("Username wajib diisi"),
  password: Yup.string()
    .min(4, "Kata sandi minimal 4 karakter")
    .required("Kata sandi wajib diisi"),
});

export default function LoginPage() {
  const { setCurrentUser, showNotification } = useApp();
  const router = useRouter();
  const [showPassword, setShowPassword] = React.useState(false);

  // ── React Query mutation ──
  const mutation = useMutation({
    mutationFn: loginApi,
    onSuccess: (data) => {
      const loggedInUser = data.user;
      setCurrentUser(loggedInUser);
      window.location.href = "/";
      
    },
  });

  // ── Formik ──
  const formik = useFormik({
    initialValues: { username: "", password: "" },
    validationSchema: loginSchema,
    onSubmit: (values) => {
      mutation.mutate(values);
    },
  });

  const inputBase =
    "w-full text-sm py-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-brand-blue/40 focus:border-brand-blue transition-all";

  const isLoading = mutation.isPending;

  // Error: dari mutation (server) atau dari Formik (client) — prioritaskan server
  const serverError = mutation.isError
    ? axios.isAxiosError(mutation.error)
      ? (mutation.error.response?.data?.message ?? "Terjadi kesalahan")
      : (mutation.error as Error).message
    : null;

  return (
    <div className="w-full min-h-[580px] bg-white dark:bg-zinc-950 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-md grid grid-cols-1 lg:grid-cols-12">
      {/* ── Kiri ── */}
      <div className="col-span-12 lg:col-span-4 bg-zinc-950 p-8 sm:p-10 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-zinc-800">
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-zinc-900 rounded-lg border border-zinc-800">
              <FlexicordLogo size={25} className="text-sky-400" />
            </div>
            <span className="text-lg font-black text-white tracking-tight">
              Flexi<span className="text-sky-400">cord</span>
            </span>
          </div>

          <div className="h-px bg-zinc-800" />

          <div>
            <h2 className="text-2xl font-black text-white leading-tight tracking-tight">
              Tempat terbaik
              <br />
              tanya &amp; jawab
              <br />
              sesama dev.
            </h2>
            <p className="text-sm text-zinc-500 mt-2.5 leading-relaxed">
              Komunitas pengembang Indonesia yang saling bantu memecahkan
              masalah teknis setiap hari.
            </p>
          </div>

          <div className="flex flex-col gap-4">
            {features.map((f) => (
              <div key={f.title} className="flex items-start gap-3">
                <div className="p-1.5 bg-zinc-900 rounded-lg border border-zinc-800 shrink-0">
                  {f.icon}
                </div>
                <div>
                  <p className="text-sm font-semibold text-zinc-200 leading-tight">
                    {f.title}
                  </p>
                  <p className="text-xs text-zinc-500 mt-0.5 leading-relaxed">
                    {f.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="h-px bg-zinc-800 mb-4" />
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-zinc-600 font-mono">
              © Flexicord
            </span>
          </div>
        </div>
      </div>

      {/* ── Kanan — Form ── */}
      <div className="lg:col-span-8 p-8 sm:p-12 md:p-16 flex flex-col justify-center bg-white dark:bg-zinc-950">
        <div className="max-w-md w-full mx-auto space-y-6">
          <div>
            <h3 className="text-xl font-bold text-zinc-900 dark:text-white tracking-tight">
              Selamat datang kembali
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              Masukkan kredensial akun Anda untuk melanjutkan.
            </p>
          </div>

          {/* Server error */}
          {serverError && (
            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 text-xs text-red-600 dark:text-red-400 flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 shrink-0" />
              <span>{serverError}</span>
            </div>
          )}

          <form onSubmit={formik.handleSubmit} className="space-y-4">
            {/* Username */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-widest block">
                Username <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 pointer-events-none" />
                <input
                  type="text"
                  name="username"
                  placeholder="Masukkan username Anda"
                  value={formik.values.username}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={`${inputBase} pl-10 pr-4 ${
                    formik.touched.username && formik.errors.username
                      ? "border-red-400 focus:ring-red-300"
                      : ""
                  }`}
                  disabled={isLoading}
                />
              </div>
              {formik.touched.username && formik.errors.username && (
                <p className="text-xs text-red-500 mt-1">
                  {formik.errors.username}
                </p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-widest block">
                  Kata Sandi <span className="text-red-500">*</span>
                </label>
                <a
                  href="#reset"
                  className="text-xs text-brand-blue hover:underline font-medium"
                >
                  Lupa sandi?
                </a>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 pointer-events-none" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Masukkan kata sandi Anda"
                  value={formik.values.password}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={`${inputBase} pl-10 pr-10 ${
                    formik.touched.password && formik.errors.password
                      ? "border-red-400 focus:ring-red-300"
                      : ""
                  }`}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 cursor-pointer"
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {formik.touched.password && formik.errors.password && (
                <p className="text-xs text-red-500 mt-1">
                  {formik.errors.password}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-brand-blue hover:bg-brand-blue-hover text-white text-sm font-semibold py-2.5 rounded-lg active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <span>Memproses...</span>
                </>
              ) : (
                <>
                  Masuk Sekarang
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          <div className="pt-4 border-t border-zinc-100 dark:border-zinc-900 text-center text-xs text-zinc-500 dark:text-zinc-400">
            Belum punya akun?{" "}
            <Link
              href="/register"
              className="text-brand-blue hover:underline font-semibold"
            >
              Daftar akun gratis
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
