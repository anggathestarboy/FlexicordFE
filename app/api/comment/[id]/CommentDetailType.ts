// ============================================================
// COMMENT DETAIL EDIT TYPES
// ============================================================

export interface EditCommentRequest {
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

export interface EditHistory {
  id: string;
  comment_id: string;
  edited_by: string;
  body_before: string;
  body_after: string;
  edited_at: string;
}

export interface CommentDetailResponse {
  message: string;
  data: CommentData;
  edit_history?: EditHistory;
}

// ============================================================
// API ERROR TYPE
// ============================================================

export interface ApiErrorResponse {
  message: string;
  error?: string;
}

export type CommentDetailApiResponse = CommentDetailResponse | ApiErrorResponse;

export interface DeleteCommentResponse {
  message: string;
}
