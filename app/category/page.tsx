"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import axios from "axios";
import { ApiResponse, Post } from "@/lib/types";
import { Category } from "../api/categories/CategoryType";
import { useApp } from "@/context/AppContext";
import CategoryGrid from "@/components/CategoryGrid";
import CategoryPostList from "@/components/CategoryPostList";

type UUID = string;
type SortTab = "terpopuler" | "terbaru";

function CategoryPageContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { currentUser } = useApp();

  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [catSearchInput, setCatSearchInput] = useState("");

  const [posts, setPosts] = useState<Post[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);

  const slug = searchParams.get("slug") ?? "";
  const activeSort = (searchParams.get("sort_by") === "created_at" ? "terbaru" : "terpopuler") as SortTab;
  const currentPage = parseInt(searchParams.get("page") ?? "1", 10);
  const search = searchParams.get("search") ?? "";

  const [postSearchInput, setPostSearchInput] = useState(search);

  // Helper to synchronize changes with URLSearchParams
  const updateParams = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([key, value]) => {
        if (value === null || value === "") {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      });
      router.push(`${pathname}?${params.toString()}`);
    },
    [searchParams, pathname, router]
  );

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    setPostSearchInput(search);
  }, [search]);

  useEffect(() => {
    if (!slug) return;
    if (postSearchInput === search) return;

    const timer = setTimeout(() => {
      updateParams({ search: postSearchInput || null, page: "1" });
    }, 400);
    return () => clearTimeout(timer);
  }, [postSearchInput, slug, search, updateParams]);

  useEffect(() => {
    if (slug) {
      getPosts();
    }
  }, [slug, activeSort, currentPage, search]);

  // Fetches list of categories from the API using Axios
  const fetchCategories = async () => {
    setLoadingCategories(true);
    try {
      const res = await axios.get("/api/categories");
      if (res.status === 200) {
        setCategories(res.data.data || []);
      }
    } catch (err) {
      console.error("Gagal mengambil kategori:", err);
    } finally {
      setLoadingCategories(false);
    }
  };

  // Maps UI sort active state to API query parameter
  const getSortParam = (): string => {
    return activeSort === "terbaru" ? "created_at" : "view_count";
  };

  // Fetches list of posts for the active category slug using Axios
  const getPosts = async () => {
    setLoadingPosts(true);
    try {
      const params = new URLSearchParams({
        sort_by: getSortParam(),
        page: String(currentPage),
      });
      if (search) params.set("search", search);

      const res = await axios.get(`/api/posts/category/${slug}?${params.toString()}`);
      if (res.status !== 200) {
        throw new Error("Gagal mengambil postingan kategori");
      }
      const data: ApiResponse = res.data;
      const fetchedPosts = data.data ?? [];

      try {
        const bookmarksRes = await axios.get("/api/bookmark");
        if (bookmarksRes.status === 200) {
          const bookmarksJson = bookmarksRes.data;
          const bookmarksList = bookmarksJson.data ?? [];
          const bookmarkMap = new Map<string, string>();
          bookmarksList.forEach((b: any) => {
            if (b.post_id && b.id) {
              bookmarkMap.set(b.post_id, b.id);
            }
          });
          fetchedPosts.forEach((post) => {
            if (bookmarkMap.has(post.id)) {
              post.bookmark_id = bookmarkMap.get(post.id);
            }
          });
        }
      } catch (err) {
        console.error("Gagal mencocokkan bookmark_id:", err);
      }

      setPosts(fetchedPosts);
      setLastPage(data.last_page || 1);
      setTotal(data.total || 0);
    } catch (error) {
      console.error(error);
      setPosts([]);
      setTotal(0);
      setLastPage(1);
    } finally {
      setLoadingPosts(false);
    }
  };

  // Triggers change in sort tab
  const handleSortChange = (sort: SortTab) => {
    updateParams({
      sort_by: sort === "terbaru" ? "created_at" : "view_count",
      page: "1",
    });
  };

  // Triggers change in active page index
  const handlePageChange = (page: number) => {
    updateParams({ page: String(page) });
  };

  // Handles adding or removing a like on a post using Axios
  const handleLike = async (e: React.MouseEvent, postId: UUID) => {
    e.stopPropagation();
    if (!currentUser) {
      router.push("/login");
      return;
    }

    const targetPost = posts.find((p) => p.id === postId);
    if (!targetPost) return;

    const isLiked = targetPost.user_has_liked;
    const prevPosts = posts;

    setPosts((prev) =>
      prev.map((post) =>
        post.id === postId
          ? {
              ...post,
              likes_count: isLiked
                ? (post.likes_count ?? 1) - 1
                : (post.likes_count ?? 0) + 1,
              user_has_liked: !isLiked,
            }
          : post
      )
    );

    try {
      if (isLiked) {
        const res = await axios.delete("/api/unlikes", {
          data: { target_id: postId },
        });
        if (res.status !== 200) {
          console.error("Unlike error:", res.data.message);
          setPosts(prevPosts);
        }
      } else {
        const res = await axios.post("/api/likes", { target_id: postId });
        if (res.status !== 200) {
          console.error("Like error:", res.data.message);
          setPosts(prevPosts);
        }
      }
    } catch (error: any) {
      console.error("Like/Unlike error:", error);
      setPosts(prevPosts);
    }
  };

  // Handles bookmark toggle logic using Axios
  const handleBookmark = async (e: React.MouseEvent, postId: UUID) => {
    e.stopPropagation();
    if (!currentUser) {
      router.push("/login");
      return;
    }

    const targetPost = posts.find((p) => p.id === postId);
    if (!targetPost) return;

    const isBookmarked = targetPost.user_has_bookmarked;
    const prevPosts = posts;

    setPosts((prev) =>
      prev.map((post) =>
        post.id === postId
          ? {
              ...post,
              bookmarks_count: isBookmarked
                ? (post.bookmarks_count ?? 1) - 1
                : (post.bookmarks_count ?? 0) + 1,
              user_has_bookmarked: !isBookmarked,
              bookmark_id: isBookmarked ? null : post.bookmark_id,
            }
          : post
      )
    );

    try {
      if (isBookmarked) {
        const bookmarkId = targetPost.bookmark_id;
        if (!bookmarkId) {
          console.error("Unbookmark error: bookmark_id tidak ditemukan");
          setPosts(prevPosts);
          return;
        }

        const res = await axios.delete(`/api/bookmark/${bookmarkId}`);
        if (res.status !== 200) {
          console.error("Unbookmark error:", res.data.message);
          setPosts(prevPosts);
        }
      } else {
        const res = await axios.post("/api/bookmark", { post_id: postId });
        if (res.status !== 200) {
          console.error("Bookmark error:", res.data.message);
          setPosts(prevPosts);
          return;
        }

        const data = res.data;
        const newBookmarkId = data.data?.id ?? data.data ?? null;

        setPosts((prev) =>
          prev.map((post) =>
            post.id === postId
              ? { ...post, bookmark_id: newBookmarkId }
              : post
          )
        );
      }
    } catch (error: any) {
      console.error("Bookmark/Unbookmark error:", error);
      setPosts(prevPosts);
    }
  };

  const activeCategory = categories.find((c) => c.slug === slug) ||
    categories.flatMap((c) => c.children || []).find((child: any) => child.slug === slug);

  const activeCategoryName = activeCategory ? activeCategory.name : slug;
  const activeCategoryDescription = activeCategory ? activeCategory.description || "" : "";

  const filteredCategories = categories.filter((cat) => {
    const term = catSearchInput.toLowerCase();
    const matchParent = cat.name.toLowerCase().includes(term) || (cat.description && cat.description.toLowerCase().includes(term));
    const matchChildren = cat.children && cat.children.some((child) => child.name.toLowerCase().includes(term));
    return matchParent || matchChildren;
  });

  if (slug) {
    return (
      <CategoryPostList
        activeCategoryName={activeCategoryName}
        activeCategoryDescription={activeCategoryDescription}
        postSearchInput={postSearchInput}
        setPostSearchInput={setPostSearchInput}
        posts={posts}
        loadingPosts={loadingPosts}
        total={total}
        activeSort={activeSort}
        handleSortChange={handleSortChange}
        currentPage={currentPage}
        lastPage={lastPage}
        handlePageChange={handlePageChange}
        handleLike={handleLike}
        handleBookmark={handleBookmark}
        onBack={() => updateParams({ slug: null, page: null, sort_by: null, search: null })}
        onNavigatePost={(id) => router.push(`/posts/${id}`)}
      />
    );
  }

  return (
    <CategoryGrid
      catSearchInput={catSearchInput}
      setCatSearchInput={setCatSearchInput}
      filteredCategories={filteredCategories}
      loadingCategories={loadingCategories}
      onSelectCategory={(selectedSlug) => updateParams({ slug: selectedSlug, page: "1" })}
    />
  );
}

export default function CategoryPage() {
  return (
    <Suspense fallback={<div className="text-center py-20 text-zinc-500 text-sm">Memuat data...</div>}>
      <CategoryPageContent />
    </Suspense>
  );
}
