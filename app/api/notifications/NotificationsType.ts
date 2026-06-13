export interface Actor {
  id: string;
  username: string;
  email: string;
  avatar_url: string | null;
  bio: string | null;
  reputation_points: number;
  level: number;
  is_banned: number;
  created_at: string;
  updated_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  actor_id?: string;
  type: string;
  reference_id: string | null;
  reference_type: string | null;
  is_read: number;
  created_at: string;
  updated_at?: string;
  actor?: Actor;
  // Compatibility fallbacks
  data?: any;
  read_at?: string | null;
}

export interface PaginationLink {
  url: string | null;
  label: string;
  active: boolean;
  page?: number | null;
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
