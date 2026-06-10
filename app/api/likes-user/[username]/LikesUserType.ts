// ============================================================
// Likes API Types
// Based on: GET /api/likes/{username}
// ============================================================

export type LikeTargetType = "post" | "comment" | string;

export interface Like {
  id: string;
  user_id: string;
  target_id: string;
  target_type: LikeTargetType;
  created_at: string;
}

export interface LikesResponse {
  likes: Like[];
}

// ─── Route-level types ───────────────────────────────────────

export interface LikesRouteParams {
  params: Promise<{ username: string }>;
}

export interface LikesRouteErrorResponse {
  error: string;
  status?: number;
}