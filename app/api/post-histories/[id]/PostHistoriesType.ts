export interface PostEditHistory {
  id: string;
  post_id: string;
  edited_by: string;
  body_before: string;
  body_after: string;
  reason: string | null;
  edited_at: string;
}

export interface PostHistoriesApiResponse {
  histories: PostEditHistory[];
}
