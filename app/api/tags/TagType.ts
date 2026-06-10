export interface Tag {
  id: string;
  name: string;
  slug: string;
  color: string;
  usage_count: number;
  created_at: string;
}

export interface TagsResponse {
  message: string;
  data: Tag[];
}

export interface TagDetailResponse {
  message: string;
  data: Tag;
}