export interface UserInfo {
  id: string;
  username: string;
  email: string;
  avatar_url: string;
  bio: string | null;
  reputation_points: number;
  level: number;
  is_banned: number;
  created_at: string;
  updated_at: string;
}

export interface PostInfo {
  id: string;
  user_id: string;
  category_id: string;
  title: string;
  body: string;
  status: string;
  view_count: number;
  vote_score: number;
  is_answered: number;
  accepted_answer_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Report {
  id: string;
  reporter_id: string;
  target_id: string;
  target_type: "user" | "post" | "comment" | string;
  reason: string;
  description: string;
  status: "resolved" | "dismissed" | "reviewed" | "pending" | "open" | string;
  resolved_by: UserInfo | string | null;
  created_at: string;
  resolved_at: string | null;
  reporter?: UserInfo;
  post?: PostInfo | null;
  comment?: any | null;
  user?: UserInfo | null;
}

export interface PaginationLink {
  url: string | null;
  label: string;
  active: boolean;
}

export interface ReportsPaginatedData {
  current_page: number;
  data: Report[];
  first_page_url: string;
  from: number | null;
  last_page: number;
  last_page_url: string;
  links: PaginationLink[];
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number | null;
  total: number;
}

export interface ReportsApiResponse {
  message: string;
  data: ReportsPaginatedData;
}

export interface ReportsSuccessResponse {
  success: true;
  message: string;
  data: ReportsPaginatedData;
}

export interface ReportsErrorResponse {
  success: false;
  message: string;
  error?: string;
}

export type ReportsResponse = ReportsSuccessResponse | ReportsErrorResponse;

export interface ReportResolveRequest {
  status: "resolved" | "dismissed" | "reviewed" | "pending";
}

export interface ReportResolveResponse {
  success: boolean;
  message: string;
  data?: Report;
  error?: string;
}