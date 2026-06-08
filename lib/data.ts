import { Question, User } from './types';

export const CURRENT_USER: User = {
  id: 'user-0',
  username: 'andev99',
  displayName: 'Anggara Dev',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80',
  reputation: 1450,
  bio: 'Fullstack Web Developer yang gemar mecahkan masalah React, Next.js, dan Tailwind CSS. Sedang belajar Rust dan AI Engineering.',
  joinedDate: 'Joined 3 years ago',
  location: 'Jakarta, Indonesia',
  websiteUrl: 'https://anggaradev.id',
  githubUrl: 'https://github.com/anggaradev',
  badges: {
    gold: 2,
    silver: 8,
    bronze: 24,
  },
};

export const MOCK_USERS: User[] = [
  {
    id: 'user-1',
    username: 'budi_react',
    displayName: 'Budi Santoso',
    avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80',
    reputation: 12400,
    joinedDate: 'Joined 5 years ago',
    location: 'Bandung, Indonesia',
    badges: { gold: 12, silver: 45, bronze: 102 },
  },
  {
    id: 'user-2',
    username: 'siti_nextjs',
    displayName: 'Siti Rahma',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80',
    reputation: 3820,
    joinedDate: 'Joined 2 years ago',
    location: 'Yogyakarta, Indonesia',
    badges: { gold: 3, silver: 15, bronze: 42 },
  },
  {
    id: 'user-3',
    username: 'eko_tailwind',
    displayName: 'Eko Wijaya',
    avatarUrl: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=150&h=150&q=80',
    reputation: 980,
    joinedDate: 'Joined 1 year ago',
    location: 'Surabaya, Indonesia',
    badges: { gold: 0, silver: 4, bronze: 15 },
  },
];

export const MOCK_QUESTIONS: Question[] = [
  {
    id: 'q-1',
    title: 'Bagaimana cara mengatasi error "Hydration failed because the initial UI does not match" di Next.js App Router?',
    body: `Saya sedang menggunakan Next.js 14 App Router dan mendapatkan error hydration yang sangat mengganggu di console browser saya:
\`\`\`
Error: Hydration failed because the initial UI does not match what was rendered on the server.
\`\`\`
Error ini terjadi ketika saya mencoba merender waktu real-time atau format tanggal yang didapatkan dari komputer client, atau ketika menggunakan \`localStorage\` di dalam component.

Berikut adalah potongan kode saya di \`src/app/page.tsx\`:
\`\`\`tsx
export default function Page() {
  const isDarkMode = localStorage.getItem('theme') === 'dark';
  const currentDate = new Date().toLocaleDateString();

  return (
    <div className={isDarkMode ? 'dark' : ''}>
      <p>Tanggal sekarang: {currentDate}</p>
    </div>
  );
}
\`\`\`

Bagaimana cara paling best-practice untuk menyelesaikan masalah ini tanpa melanggar prinsip SSR (Server-Side Rendering) di Next.js?`,
    tags: ['next.js', 'react', 'hydration', 'ssr'],
    author: MOCK_USERS[1],
    votes: 42,
    views: 1845,
    createdAt: '3 hours ago',
    comments: [
      {
        id: 'c-1-1',
        author: MOCK_USERS[2],
        body: 'Apakah kamu sudah coba menjalankan code tersebut hanya di client-side menggunakan useEffect?',
        votes: 5,
        createdAt: '2 hours ago',
      },
      {
        id: 'c-1-2',
        author: MOCK_USERS[0], // current user
        body: 'Setuju dengan Siti, masalah utama di sini adalah component SSR mencoba menebak isi localStorage dan Date() server yang berbeda dengan client.',
        votes: 2,
        createdAt: '1 hour ago',
      }
    ],
    answers: [
      {
        id: 'a-1-1',
        questionId: 'q-1',
        author: MOCK_USERS[2],
        votes: 28,
        isAccepted: true,
        createdAt: '2 hours ago',
        comments: [
          {
            id: 'c-1-a1',
            author: MOCK_USERS[1], // asker
            body: 'Terima kasih, Siti! Solusi nomor 1 (useEffect) langsung menyelesaikan masalah saya tanpa error lagi.',
            votes: 3,
            createdAt: '1 hour ago',
          }
        ],
        body: `Masalah ini terjadi karena kode server-side Next.js merender template HTML statis, namun setelah mendarat di browser client, runtime React mendapati bahwa isi markup-nya berbeda (karena di server \`localStorage\` bernilai undefined dan \`currentDate\` merupakan waktu server).

Ada tiga cara umum untuk mengatasinya:

### Solusi 1: Menggunakan \`useEffect\` untuk menunda eksekusi ke client (Direkomendasikan)
Gunakan state lokal dan \`useEffect\` agar kode client-only hanya dieksekusi setelah komponen selesai dimuat (*mounted*) di browser.

\`\`\`tsx
"use client";

import { useEffect, useState } from 'react';

export default function Page() {
  const [mounted, setMounted] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [currentDate, setCurrentDate] = useState('');

  // Selesai mounted, aman menggunakan localStorage dan Object Client-specifc
  useEffect(() => {
    setMounted(true);
    setIsDarkMode(localStorage.getItem('theme') === 'dark');
    setCurrentDate(new Date().toLocaleDateString());
  }, []);

  // Selama phase SSR, return dummy skeleton agar cocok
  if (!mounted) {
    return <div className="animate-pulse">Loading...</div>;
  }

  return (
    <div className={isDarkMode ? 'dark bg-zinc-950 text-white' : 'bg-white text-zinc-950'}>
      <p>Tanggal sekarang: {currentDate}</p>
    </div>
  );
}
\`\`\`

---

### Solusi 2: Menggunakan Dynamic Import dengan \`ssr: false\`
Kamu bisa mengemas seluruh UI yang bergantung pada client-side environment ke dalam component tersendiri lalu meng-import memakai dynamic import di Next.js dengan menonaktifkan SSR.

\`\`\`tsx
import dynamic from 'next/dynamic';

const ClientOnlyComponent = dynamic(
  () => import('@/components/ClientOnly'),
  { ssr: false }
);

export default function Page() {
  return <ClientOnlyComponent />;
}
\`\`\`

---

### Solusi 3: Menambahkan attribute \`suppressHydrationWarning\`
Jika perbedaannya hanya sepele (seperti tag waktu statis) dan kamu tidak peduli jika render pertama melenceng sedikit, tambahkan warning suppressor:

\`\`\`tsx
<p suppressHydrationWarning>Tanggal sekarang: {currentDate}</p>
\`\`\``,
      },
      {
        id: 'a-1-2',
        questionId: 'q-1',
        author: MOCK_USERS[0], // current user
        votes: 9,
        isAccepted: false,
        createdAt: '1 hour ago',
        comments: [],
        body: `Selain solusi di atas, kamu juga dipersilakan untuk menggunakan state manager atau 3rd party hooks seperti \`useSyncExternalStore\` jika ingin mengalirkan state localStorage secara reaktif dan menghindari hydration-mismatch secara elegan di React.

Berikut contoh sederhana jika menggunakan Custom Hook:
\`\`\`ts
function useLocalStorage(key: string, initialValue: any) {
  const [value, setValue] = useState(initialValue);
  
  useEffect(() => {
    const val = localStorage.getItem(key);
    if (val) setValue(val);
  }, [key]);
  
  return value;
}
\`\`\``
      }
    ]
  },
  {
    id: 'q-2',
    title: 'Apa perbedaan mendasar antara useEffect dan useLayoutEffect di React, dan kapan harus pakai masing-masing?',
    body: `Saya sering melihat tutorial menyarankan \`useLayoutEffect\` ketika ada glitch visual pada transisi UI atau ketika mengukur layout DOM, tapi saya tidak terlalu paham apa yang terjadi di balik layar.

Bisa tolong jelaskan:
1. Kapan tepatnya browser melakukan repainting?
2. Kenapa \`useEffect\` bisa memicu kedipan (*flicker*) visual sedangkan \`useLayoutEffect\` tidak?
3. Adakah dampak buruk performa jika saya menggunakan \`useLayoutEffect\` untuk segala macam urusan side-effect?`,
    tags: ['react', 'hooks', 'performance', 'dom'],
    author: MOCK_USERS[2],
    votes: 18,
    views: 654,
    createdAt: '1 day ago',
    comments: [],
    answers: [
      {
        id: 'a-2-1',
        questionId: 'q-2',
        author: MOCK_USERS[1],
        votes: 15,
        isAccepted: true,
        createdAt: '18 hours ago',
        comments: [],
        body: `Perbedaan krusial antara keduanya terletak pada **kapan waktu eksekusinya** didelegasikan dalam siklus rendering React ke browser.

### 1. Perbedaan Waktu Eksekusi

Let's trace the order of execution:
1. **React State Change** -> State berubah.
2. **React Renders Component** -> Menghitung DOM virtual.
3. **React Updates DOM** -> Memperbarui elemen DOM di memori browser (belum digambar ke layar).
4. **\`useLayoutEffect\` dipanggil** -> React menjalankan useLayoutEffect **SECARA SINKRON (synchronous)** sebelum browser benar-benar menggambar (paint) layar.
5. **Browser Paints Screen** -> Browser memvisualisasikan elemen. Layar berubah.
6. **\`useEffect\` dipanggil** -> React menjalankan useEffect **SECARA ASINKRON (asynchronous)** setelah layar selesai digambar oleh browser.

---

### 2. Mengapa Terjadi Flicker Kedipan?

Jika kamu mengubah state di dalam \`useEffect\`:
- Komponen di-render $\\rightarrow$ DOM diperbarui $\\rightarrow$ Browser menggambar frame $\\rightarrow$ \`useEffect\` berjalan $\\rightarrow$ State diubah $\\rightarrow$ Komponen di-render ulang $\\rightarrow$ DOM diperbarui $\\rightarrow$ Browser menggambar frame baru.
- Browser menggambar **dua kali**, sehingga user melihat kedipan cepat (*flash / layout shift*).

Jika kamu mengubah state di dalam \`useLayoutEffect\`:
- Komponen di-render $\\rightarrow$ DOM diperbarui $\\rightarrow$ \`useLayoutEffect\` berjalan sinkron dan langsung mengubah state lagi sebelum browser menggambar $\\rightarrow$ Komponen render ulang $\\rightarrow$ DOM baru $\\rightarrow$ Browser menggambar frame baru sekali saja.
- User hanya melihat frame final, **bebas kedipan**.

---

### 3. Kapan Harus Menggunakan Masing-masing?

- **Gunakan \`useEffect\` untuk 99% kasus:** API Fetching, Event listeners setup, logging, analytics, memicu timeout/intervals. Karena asinkron, ia tidak memblokir browser rendering.
- **Gunakan \`useLayoutEffect\` HANYA saat:**
  - Kamu perlu mengukur koordinat DOM yang akurat (memakai \`getBoundingClientRect\`, scroll offset, dll).
  - Mengubah tampilan UI secara instan (misal positioning popup, chat box sticky scroll, animasi transisi murni koordinat) agar tidak ada kedipan visual.

*Peringatan:* Menggunakan \`useLayoutEffect\` di setiap tempat akan membuat website melambat karena setiap render akan diblokir eksekusinya hingga JavaScript selesai berjalan!`
      }
    ]
  },
  {
    id: 'q-3',
    title: 'Bagaimana cara menambahkan custom Google Font menggunakan Tailwind CSS v4 di project React/Vite?',
    body: `Saya melihat bahwa cara kerja Tailwind CSS v4 berubah drastis dibanding v3, di mana file config \`tailwind.config.js\` sudah ditiadakan dan diganti dengan konfigurasi direktif \`@theme\` langsung di dalam file CSS utama.

Bagaimana cara paling bersih untuk:
1. Melakukan import file font Google Fonts di CSS.
2. Mendeklarasikan font tersebut di Tailwind v4 agar bisa diakses lewat class utilitas seperti \`font-custom\`?`,
    tags: ['tailwindcss', 'vite', 'fonts', 'css'],
    author: MOCK_USERS[0], // current user's old post
    votes: 31,
    views: 1102,
    createdAt: '3 days ago',
    comments: [
      {
        id: 'c-3-1',
        author: MOCK_USERS[1],
        body: 'Sangat menyukai v4, setup-nya jauh lebih ringkas tanpa file js config yang rumit!',
        votes: 8,
        createdAt: '2 days ago',
      }
    ],
    answers: [
      {
        id: 'a-3-1',
        questionId: 'q-3',
        author: MOCK_USERS[1],
        votes: 22,
        isAccepted: true,
        createdAt: '2 days ago',
        comments: [],
        body: `Ya, benar sekali! Di Tailwind CSS v4, semua kustomisasi dipindahkan murni ke CSS menggunakan sintaks modern \`@theme\`.

Berikut adalah petunjuk langkah demi langkah yang paling bersih untuk dilakukan:

### Langkah 1: Tambahkan Import Google Fonts di bagian paling atas file css kamu

Letakkan directive \`@import\` eksternal di atas file CSS utama sebelum meng-import tailwind:

\`\`\`css
/* index.css */
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap');
@import "tailwindcss";
\`\`\`

### Langkah 2: Definisikan CSS Font Family di directive \`@theme\`

Tambahkan custom font family di dalam block \`@theme\`. Kamu bisa menimpanya ke \`--font-sans\` bawaan atau membuat utility class baru:

\`\`\`css
@theme {
  /* Taktik A: Menimpa default font sans agar berlaku menyeluruh */
  --font-sans: "Plus Jakarta Sans", ui-sans-serif, system-ui, sans-serif;

  /* Taktik B: Membuat utilitas class baru (font-display) */
  --font-display: "Plus Jakarta Sans", ui-sans-serif, sans-serif;
}
\`\`\`

### Langkah 3: Gunakan di kode HTML/JSX kamu

Jika kamu menggunakan Taktik B:
\`\`\`tsx
export default function Heading() {
  return (
    <h1 className="font-display font-bold text-3xl">
      Ini menggunakan Plus Jakarta Sans!
    </h1>
  );
}
\`\`\`

Tailwind secara otomatis mengkompilasi file CSS ke output utility class tanpa perlu merestart dev server.`
      }
    ]
  }
];

export const POPULAR_TAGS = [
  { name: 'react', count: 14502 },
  { name: 'next.js', count: 8320 },
  { name: 'tailwindcss', count: 5210 },
  { name: 'typescript', count: 12010 },
  { name: 'javascript', count: 24200 },
  { name: 'vite', count: 1840 },
  { name: 'hydration', count: 532 },
  { name: 'performance', count: 2120 },
];
