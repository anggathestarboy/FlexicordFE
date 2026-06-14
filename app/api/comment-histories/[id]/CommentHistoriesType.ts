export interface CommentEditHistory {
  id: string;
  comment_id: string;
  edited_by: string;
  body_before: string;
  body_after: string;
  edited_at: string;
}

export interface CommentHistoriesApiResponse {
  histories: CommentEditHistory[];
}
