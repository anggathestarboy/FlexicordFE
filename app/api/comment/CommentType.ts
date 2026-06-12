// ============================================================
// COMMENT TYPES
// ============================================================

export interface CommentRequest {
  post_id: string;
  parent_id?: string | null;
  body: string;
}

export interface CommentData {
  id: string;
  post_id: string;
  user_id: string;
  parent_id: string | null;
  body: string;
  vote_score: number;
  is_accepted: number;
  created_at: string;
  updated_at: string;
}

export interface CommentResponse {
  message: string;
  data?: CommentData;
}

// ============================================================
// API ERROR TYPE
// ============================================================

export interface ApiErrorResponse {
  message: string;
  error?: string;
}

export type CommentApiResponse = CommentResponse | ApiErrorResponse;
