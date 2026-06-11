// ==========================================
// Unlike — Delete
// ==========================================

type UUID = string;

/** Body request — DELETE /api/unlikes */
export interface UnlikeDeleteRequest {
  target_id: UUID; // id dari Post
}

/** Response dari DELETE /api/unlikes */
export interface UnlikeDeleteResponse {
  message: string; // "Unliked successfully"
}
