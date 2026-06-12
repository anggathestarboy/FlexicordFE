export interface Notification {
  id: string;
  user_id: string;
  type: string;
  data: any;
  read_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface PaginationLink {
  url: string | null;
  label: string;
  active: boolean;
}

export interface NotificationsPaginatedData {
  current_page: number;
  data: Notification[];
  first_page_url: string | null;
  from: number | null;
  last_page: number;
  last_page_url: string | null;
  links: PaginationLink[];
  next_page_url: string | null;
  path: string | null;
  per_page: number;
  prev_page_url: string | null;
  to: number | null;
  total: number;
}

export interface NotificationsApiResponse {
  status: string;
  data: NotificationsPaginatedData;
}
