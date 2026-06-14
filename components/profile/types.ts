export interface RolePivot {
  user_id: string;
  role_id: string;
}

export interface Role {
  id: string;
  name: string;
  permissions: string | null;
  created_at: string;
  pivot: RolePivot;
}

export interface BadgePivot {
  user_id: string;
  badge_id: string;
  created_at: string;
  updated_at: string;
}

export type BadgeTier = "bronze" | "silver" | "gold" | "platinum";

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon_url: string | null;
  tier: BadgeTier;
  condition_type: string;
  condition_value: number;
  pivot: BadgePivot;
}

export interface TagPivot {
  post_id: string;
  tag_id: string;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
  color: string;
  usage_count: number;
  created_at: string;
  pivot: TagPivot;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  parent_id: string | null;
  created_at: string;
}

export interface Post {
  id: string;
  user_id: string;
  category_id: string;
  title: string;
  body: string;
  status: "open" | "closed" | "archived";
  view_count: number;
  vote_score: number;
  is_answered: 0 | 1;
  accepted_answer_id: string | null;
  created_at: string;
  updated_at: string;
  likes_count: number;
  bookmarks_count: number;
  comments_count: number;
  upvotes_count: number;
  downvotes_count: number;
  votes_count: number;
  user_has_liked: boolean;
  user_has_bookmarked: boolean;
  tags: Tag[];
  category: Category;
}

export interface UserDetail {
  id: string;
  username: string;
  email: string;
  avatar_url: string | null;
  bio: string | null;
  reputation_points: number;
  level: number;
  is_banned: 0 | 1;
  created_at: string;
  updated_at: string;
  posts_count: number;
  followers_count: number;
  following_count: number;
  badges_count: number;
  roles: Role[];
  badges: Badge[];
  posts: Post[];
}

export interface UserDetailResponse {
  message: string;
  user: UserDetail;
  is_following: boolean;
}

export interface LikeComment {
  id: string;
  post_id: string;
  body: string;
  vote_score: number;
  is_accepted: 0 | 1;
  created_at: string;
}

export interface LikePost {
  id: string;
  title: string;
  body: string;
  status: "open" | "closed";
  view_count: number;
  vote_score: number;
  is_answered: 0 | 1;
  created_at: string;
}

export interface LikeItem {
  id: string;
  user_id: string;
  target_id: string;
  target_type: "post" | "comment";
  created_at: string;
  post: LikePost | null;
  comment: LikeComment | null;
}

export interface LikesApiResponse {
  likes: LikeItem[];
}

export interface BookmarkItem {
  id: string;
  user_id: string;
  post_id: string;
  created_at: string;
}

export interface BookmarksApiResponse {
  message: string;
  data: BookmarkItem[];
}

export interface BookmarkPostDetail {
  id: string;
  title: string;
  body: string;
  status: string;
  view_count: number;
  vote_score: number;
  is_answered: number;
  likes_count: number;
  comments_count: number;
  upvotes_count: number;
  created_at: string;
  category: { id: string; name: string; slug: string };
  tags: { id: string; name: string; color: string }[];
  user: { id: string; username: string; avatar_url: string | null };
}

export interface PointLog {
  id: string;
  user_id: string;
  points: number;
  action_type: string;
  reference_id: string;
  description: string;
  created_at: string;
}

export interface PointsLogsResponse {
  status: string;
  username: string;
  reputation_points: number;
  data: PointLog[];
}

export interface ReportItem {
  id: string;
  reporter_id: string;
  target_id: string;
  target_type: "user" | "post" | "comment" | string;
  reason: string;
  description: string | null;
  status: string;
  resolved_by: UserDetail | null;
  created_at: string;
  resolved_at: string | null;
  reporter: UserDetail;
  user: UserDetail | null;
  post: any | null;
  comment: any | null;
}

export interface ReportsApiResponse {
  success: boolean;
  message: string;
  data: {
    current_page: number;
    data: ReportItem[];
    last_page: number;
    total: number;
  };
}

export interface SelfWarningItem {
  id: string;
  moderator_id: string;
  target_user_id: string;
  action_type: string;
  reason: string;
  notes: string | null;
  created_at: string;
  moderator: UserDetail;
  user: UserDetail;
}

export interface SelfWarningResponse {
  success: boolean;
  message: string;
  data: SelfWarningItem[];
}

export type TabKey = "posts" | "activity" | "likes" | "bookmarks" | "credentials" | "points" | "reports" | "warnings";
