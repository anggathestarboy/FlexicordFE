"use client";

import React from 'react';
import { Mail, Lock, User as UserIcon, ArrowRight, Eye, EyeOff, ShieldAlert, MessageSquare, Trophy } from 'lucide-react';
import FlexicordLogo from '@/components/FlexicordLogo';
import { useApp } from '@/context/AppContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';

const features = [
  {
    icon: <MessageSquare className="h-4 w-4 text-sky-400" />,
    title: 'Tanya apa saja',
    desc: 'Bug, arsitektur, deployment — semua bisa didiskusikan.',
  },
  {
    icon: <Trophy className="h-4 w-4 text-sky-400" />,
    title: 'Kumpulkan reputasi',
    desc: 'Jawab pertanyaan, raih poin, dan naik peringkat.',
  },
];

// ── API functions ──
const registerApi = async (values: { username: string; email: string; password_hash: string }) => {
  const { data } = await axios.post('/api/register', values);
  return data;
};

const getMeApi = async () => {
  const { data } = await axios.get('/api/me');
  return data;
};

// ── Yup validation schema ──
const registerSchema = Yup.object({
  username: Yup.string()
    .min(3, 'Username minimal 3 karakter')
    .matches(/^[a-z0-9_-]+$/, 'Username hanya boleh huruf kecil, angka, _ atau -')
    .required('Username wajib diisi'),
  email: Yup.string()
    .email('Format email tidak valid')
    .required('Email wajib diisi'),
  password: Yup.string()
    .min(5, 'Kata sandi minimal 5 karakter')
    .required('Kata sandi wajib diisi'),

});

export default function RegisterPage() {
  const { setCurrentUser, showNotification } = useApp();
  const router = useRouter();
  const [showPassword, setShowPassword] = React.useState(false);

  // ── Mutation: fetch /api/me setelah register berhasil ──
  const meMutation = useMutation({
    mutationFn: getMeApi,
    onSuccess: (data) => {
      if (data.user) {
        setCurrentUser(data.user);
      
      } else {
        setCurrentUser(null);
       
      }
      window.location.href = "/";
    },
    onError: () => {
      setCurrentUser(null);
      
      window.location.href = "/";
    },
  });

  // ── Mutation: register ──
  const registerMutation = useMutation({
    mutationFn: registerApi,
    onSuccess: () => meMutation.mutate(),
  });

  // ── Formik ──
  const formik = useFormik({
    initialValues: {
      username: '',
      email: '',
      password: '',
      agreeTerms: true,
    },
    validationSchema: registerSchema,
    onSubmit: (values) => {
      registerMutation.mutate({
        username: values.username.toLowerCase().trim().replace(/[^a-z0-9_-]/g, ''),
        email: values.email.trim(),
        password_hash: values.password,
      });
    },
  });

  const isLoading = registerMutation.isPending || meMutation.isPending;

  const serverError = registerMutation.isError
    ? axios.isAxiosError(registerMutation.error)
      ? registerMutation.error.response?.data?.errors
        ? Object.values(registerMutation.error.response.data.errors as Record<string, string[]>)[0][0]
        : registerMutation.error.response?.data?.message ?? 'Register gagal'
      : (registerMutation.error as Error).message
    : null;

  const inputBase =
    'w-full text-sm py-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-brand-blue/40 focus:border-brand-blue transition-all';

  const fieldError = (name: keyof typeof formik.errors) =>
    formik.touched[name] && formik.errors[name] ? formik.errors[name] as string : null;

  const errorBorder = (name: keyof typeof formik.errors) =>
    fieldError(name) ? 'border-red-400 focus:ring-red-300' : '';

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
              Tempat terbaik<br />tanya &amp; jawab<br />sesama dev.
            </h2>
            <p className="text-sm text-zinc-500 mt-2.5 leading-relaxed">
              Komunitas pengembang Indonesia yang saling bantu memecahkan masalah teknis setiap hari.
            </p>
          </div>
          <div className="flex flex-col gap-4">
            {features.map((f) => (
              <div key={f.title} className="flex items-start gap-3">
                <div className="p-1.5 bg-zinc-900 rounded-lg border border-zinc-800 shrink-0">{f.icon}</div>
                <div>
                  <p className="text-sm font-semibold text-zinc-200 leading-tight">{f.title}</p>
                  <p className="text-xs text-zinc-500 mt-0.5 leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div>
          <div className="h-px bg-zinc-800 mb-4" />
          <span className="text-[11px] text-zinc-600 font-mono">© Flexicord</span>
        </div>
      </div>

      {/* ── Kanan — Form ── */}
      <div className="lg:col-span-8 p-8 sm:p-12 flex flex-col justify-center bg-white dark:bg-zinc-950">
        <div className="max-w-md w-full mx-auto space-y-6">
          <div>
            <h3 className="text-xl font-bold text-zinc-900 dark:text-white tracking-tight">Daftar akun baru</h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">Isi data di bawah untuk membuat akun Flexicord.</p>
          </div>

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
                <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 pointer-events-none" />
                <input
                  type="text"
                  name="username"
                  placeholder="budisetiawan"
                  value={formik.values.username}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={`${inputBase} pl-10 pr-4 ${errorBorder('username')}`}
                  disabled={isLoading}
                />
              </div>
              {fieldError('username') && <p className="text-xs text-red-500">{fieldError('username')}</p>}
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-widest block">
                Email <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 pointer-events-none" />
                <input
                  type="email"
                  name="email"
                  placeholder="budi@example.com"
                  value={formik.values.email}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={`${inputBase} pl-10 pr-4 ${errorBorder('email')}`}
                  disabled={isLoading}
                />
              </div>
              {fieldError('email') && <p className="text-xs text-red-500">{fieldError('email')}</p>}
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-widest block">
                Kata Sandi <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="Buat sandi tangguh..."
                  value={formik.values.password}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={`${inputBase} pl-10 pr-10 ${errorBorder('password')}`}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 cursor-pointer"
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {fieldError('password') && <p className="text-xs text-red-500">{fieldError('password')}</p>}
            </div>

         

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-brand-blue hover:bg-brand-blue-hover disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-semibold py-2.5 rounded-lg active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <span>Mendaftarkan...</span>
                </>
              ) : (
                <>Daftarkan Akun <ArrowRight className="h-4 w-4" /></>
              )}
            </button>
          </form>

          <div className="pt-4 border-t border-zinc-100 dark:border-zinc-900 text-center text-xs text-zinc-500 dark:text-zinc-400">
            Sudah punya akun?{' '}
            <Link href="/login" className="text-brand-blue hover:underline font-semibold">Masuk di sini</Link>
          </div>
        </div>
      </div>
    </div>
  );
}