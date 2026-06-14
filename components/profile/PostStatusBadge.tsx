"use client";

import React from "react";
import { CheckCircle2, CircleDot } from "lucide-react";
import { Post, LikePost } from "./types";

interface PostStatusBadgeProps {
  post: Post | LikePost;
}

export default function PostStatusBadge({ post }: PostStatusBadgeProps) {
  // Renders a badge indicating whether the post is answered, open, or closed
  if (post.is_answered) {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 px-1.5 py-0.5 rounded">
        <CheckCircle2 className="h-2.5 w-2.5" />
        Terjawab
      </span>
    );
  }
  if (post.status === "open") {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-sky-100 text-sky-600 dark:bg-sky-900/30 dark:text-sky-400 px-1.5 py-0.5 rounded">
        <CircleDot className="h-2.5 w-2.5" />
        Terbuka
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400 px-1.5 py-0.5 rounded">
      Ditutup
    </span>
  );
}
