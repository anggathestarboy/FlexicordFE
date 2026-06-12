// ============================================================
// DOWNVOTE TYPES
// ============================================================

export interface DownvoteRequest {
  target_id: string;
}

export interface DownvoteData {
  id: string;
  user_id: string;
  target_id: string;
  target_type: string;
  vote_type: string;
  created_at: string;
}

export interface DownvoteResponse {
  message: string;
  data?: DownvoteData;
  action?: "downvoted" | "unvoted";
  vote_score?: number;
}

// ============================================================
// API ERROR TYPE
// ============================================================

export interface ApiErrorResponse {
  message: string;
  error?: string;
}

export type DownvoteApiResponse = DownvoteResponse | ApiErrorResponse;
