// ============================================================
// VOTE TYPES
// ============================================================

export interface VoteRequest {
  target_id: string;
  vote_type: "upvote" | "downvote";
}

export interface VoteData {
  id: string;
  user_id: string;
  target_id: string;
  target_type: string;
  vote_type: string;
  created_at: string;
}

export interface VoteResponse {
  message: string;
  data?: VoteData;
  action?: "upvoted" | "downvoted" | "unvoted";
  vote_score?: number;
}

// ============================================================
// API ERROR TYPE
// ============================================================

export interface ApiErrorResponse {
  message: string;
  error?: string;
}

export type VoteApiResponse = VoteResponse | ApiErrorResponse;
