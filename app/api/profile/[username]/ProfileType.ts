// ============================================================
// Profile API Types
// Based on: GET /api/detail-user/{username}
// ============================================================

export interface RolePivot {
  user_id: string;
  role_id: string;
}

export interface Role {
  id: string;
  name: string;
  permissions: string | null; // e.g. "null" or '{"all": true}'
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

export type BadgeConditionType = "reputation_points" | "posts_count" | string;

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon_url: string | null;
  tier: BadgeTier;
  condition_type: BadgeConditionType;
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

export interface PostUser {
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
}

export type PostStatus = "open" | "closed" | "archived";

export interface Post {
  id: string;
  user_id: string;
  category_id: string;
  title: string;
  body: string;
  status: PostStatus;
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
  user: PostUser;
}

export interface UserDetail extends PostUser {
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

// ============================================================
// Route-level types
// ============================================================

export interface ProfileRouteParams {
  params: Promise<{ username: string }>;
}

export interface ProfileRouteErrorResponse {
  error: string;
  status?: number;
}