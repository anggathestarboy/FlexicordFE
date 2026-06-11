// ==========================================
// Bookmark Detail — Delete (Unbookmark)
// ==========================================

/** Params route — DELETE /api/bookmark/[id] */
export interface BookmarkDeleteParams {
  id: string; // id dari bookmark yang akan dihapus
}

/** Response dari DELETE /api/bookmark/[id] */
export interface BookmarkDeleteResponse {
  message: string; // "Bookmark removed successfully"
}
