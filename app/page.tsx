"use client";

import { useEffect, useState } from "react";
import {
  Search,
  SlidersHorizontal,
  Inbox,
  Eye,
  ArrowBigUp,
  CheckCircle,
} from "lucide-react";

type Post = {
  id: string;
  title: string;
  body: string;
  status: string;
  view_count: number;
  vote_score: number;
  is_answered: number;
  created_at: string;
};

export default function HomePage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPosts();
  }, []);

  const getPosts = async () => {
    try {
      const res = await fetch("/api/posts");
      const data = await res.json();

      setPosts(data.data ?? []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPosts = posts.filter(
    (post) =>
      post.title.toLowerCase().includes(search.toLowerCase()) ||
      post.body.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">
            Semua Pengaduan
          </h1>

          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Daftar seluruh pengaduan masyarakat yang telah dikirim.
          </p>
        </div>
      </div>

      {/* SEARCH */}
      <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4">
        <div className="relative">
          <Search className="absolute left-3 top-3.5 h-4 w-4 text-zinc-400" />

          <input
            type="text"
            placeholder="Cari pengaduan..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900"
          />
        </div>
      </div>

      {/* FILTER INFO */}
      <div className="flex items-center gap-2 bg-zinc-100/60 dark:bg-zinc-900/40 p-3 rounded-xl border border-zinc-200/50 dark:border-zinc-800">
        <SlidersHorizontal className="h-4 w-4 text-zinc-500" />
        <span className="text-sm text-zinc-500">
          {filteredPosts.length} pengaduan ditemukan
        </span>
      </div>

      {/* LIST */}
      {loading ? (
        <div className="text-center py-20 text-zinc-500">
          Memuat data...
        </div>
      ) : filteredPosts.length > 0 ? (
        <div className="space-y-4">
          {filteredPosts.map((post) => (
            <div
              key={post.id}
              className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 hover:border-brand-blue transition-all cursor-pointer"
            >
              <div className="flex flex-col md:flex-row gap-5">
                {/* STATS */}
                <div className="flex gap-4 text-xs text-zinc-500">
                  <div className="flex items-center gap-1">
                    <ArrowBigUp className="h-4 w-4" />
                    {post.vote_score}
                  </div>

                  <div className="flex items-center gap-1">
                    <Eye className="h-4 w-4" />
                    {post.view_count}
                  </div>

                  <div
                    className={`flex items-center gap-1 ${
                      post.is_answered
                        ? "text-green-500"
                        : "text-zinc-500"
                    }`}
                  >
                    <CheckCircle className="h-4 w-4" />
                    {post.is_answered ? "Terjawab" : "Belum"}
                  </div>
                </div>

                {/* CONTENT */}
                <div className="flex-1">
                  <h2 className="text-lg font-bold text-zinc-900 dark:text-white hover:text-brand-blue">
                    {post.title}
                  </h2>

                  <p className="mt-2 text-sm text-zinc-500 line-clamp-2">
                    {post.body}
                  </p>

                  <div className="mt-4 flex items-center justify-between">
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        post.status === "open"
                          ? "bg-green-500/10 text-green-500"
                          : "bg-zinc-500/10 text-zinc-500"
                      }`}
                    >
                      {post.status}
                    </span>

                    <span className="text-xs text-zinc-400">
                      {new Date(post.created_at).toLocaleDateString(
                        "id-ID"
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-12 text-center rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
          <div className="mx-auto w-12 h-12 rounded-full bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center">
            <Inbox className="h-6 w-6 text-zinc-400" />
          </div>

          <h3 className="mt-4 text-base font-bold text-zinc-900 dark:text-white">
            Pengaduan tidak ditemukan
          </h3>

          <p className="mt-2 text-sm text-zinc-500">
            Tidak ada data yang sesuai dengan pencarian.
          </p>
        </div>
      )}
    </div>
  );
}