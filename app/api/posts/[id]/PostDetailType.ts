export interface User {
  id: string;
  username: string;
  email: string;
  avatar_url: string;
  bio: string;
  reputation_points: number;
  level: number;
  is_banned: number;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  parent_id: string | null;
  created_at: string;
}

export interface Comment {
  id: string;
  post_id: string;
  user_id: string;
  parent_id: string | null;
  body: string;
  vote_score: number;
  is_accepted: number;
  created_at: string;
  updated_at: string;
  comments_count: number;
  likes_count: number;
  upvotes_count: number;
  downvotes_count: number;
  comments_upvotes_count: number;
  comments_downvotes_count: number;
  votes_count: number;
  is_edited: boolean;
  user_has_voted: boolean;
  user_vote_type: string | null;
  user_has_liked: boolean;
  user: User;
  votes: any[];
  likes: any[];
  comment_edit_histories: any[];
  replies: Comment[];
}

export interface Post {
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
  likes_count: number;
  bookmarks_count: number;
  comments_count: number;
  post_edit_histories_count: number;
  upvotes_count: number;
  downvotes_count: number;
  comments_upvotes_count: number;
  comments_downvotes_count: number;
  is_edited: boolean;
  user_has_voted: boolean;
  user_vote_type: string | null;
  user_has_liked: boolean;
  user_has_bookmarked: boolean;
  bookmark_id?: string | null;
  tags: any[];
  category: Category;
  user: User;
  comments: Comment[];
}

export interface PostDetailResponse {
  status: string;
  data: Post;
}