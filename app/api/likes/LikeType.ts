// ==========================================
// Like — Post
// ==========================================

type UUID = string;

/** Body request — POST /api/likes */
export interface LikePostRequest {
  target_id: UUID; // id dari Post
}

/** Response dari POST /api/likes */
export interface LikePostResponse {
  message: string; // "Post liked successfully" | "Post unliked successfully"
  data: string;
}

// Field yang berubah di Post setelah like/unlike
// (untuk update local state / optimistic update)
export interface PostLikeState {
  likes_count: number;
  user_has_liked: boolean;
}