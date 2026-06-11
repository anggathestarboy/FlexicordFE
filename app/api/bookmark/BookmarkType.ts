// ============================================================
// BOOKMARK TYPES
// ============================================================

export interface Bookmark {
  id: string;
  user_id: string;
  post_id: string;
  created_at: string;
}

export interface BookmarksResponse {
  message: string;
  data: Bookmark[];
}

export interface BookmarkSingleResponse {
  message: string;
  data: Bookmark;
}

// ============================================================
// API ERROR TYPE
// ============================================================

export interface ApiErrorResponse {
  message: string;
  error?: string;
}

// ============================================================
// NEXT.JS ROUTE HANDLER RETURN TYPES
// ============================================================

export type BookmarksApiResponse = BookmarksResponse | ApiErrorResponse;
export type BookmarkApiResponse = BookmarkSingleResponse | ApiErrorResponse;