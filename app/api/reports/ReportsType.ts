export interface Report {
  id: string;
  reporter_id: string;
  target_id: string;
  target_type: string;
  reason: string;
  description: string;
  status: string;
  resolved_by: string | null;
  created_at: string;
  resolved_at: string | null;
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