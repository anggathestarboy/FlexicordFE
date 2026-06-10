export interface Role {
  id: string;
  name: string;
  permissions: string | null;
  created_at: string;
  pivot?: {
    user_id: string;
    role_id: string;
  };
  parsedPermissions?: any;
}

export interface User {
  id: string;
  username: string;
  email?: string;
  avatar_url?: string | null;
  bio?: string | null;
  reputation_points?: number;
  level?: number;
  is_banned?: number;
  created_at?: string;
  updated_at?: string;
  roles?: Role[];
  primary_role?: Role;

  // Compatibility fields
  displayName?: string;
  avatarUrl?: string;
  reputation?: number;
  joinedDate?: string;
  location?: string;
  websiteUrl?: string;
  githubUrl?: string;
  badges?: {
    gold: number;
    silver: number;
    bronze: number;
  };
}





export interface Comment {
  id: string;
  author: User;
  body: string;
  votes: number;
  createdAt: string;
}

export interface Answer {
  id: string;
  questionId: string;
  author: User;
  body: string;
  votes: number;
  isAccepted: boolean;
  comments: Comment[];
  createdAt: string;
  voted?: 'up' | 'down' | null;
}

export interface Question {
  id: string;
  title: string;
  body: string;
  tags: string[];
  author: User;
  votes: number;
  views: number;
  answers: Answer[];
  comments: Comment[];
  createdAt: string;
  voted?: 'up' | 'down' | null;
}

export interface Post {
     id: string;
  title: string;
  body: string;
  status: string;
  view_count: number;
  vote_score: number;
  is_answered: number;
  comments_count: number;
  likes_count: number;
  bookmarks_count: number;
  created_at: string;
  is_edited: boolean;
  tags: Tag[];
  category: Category;
  user: User;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
  color: string;
};

export interface Category {
  id: string;
  name: string;
  slug: string;
};

export interface Link {
  url: string
  label: string
  active: boolean
}

export interface PostsResponse {
  data: Post[]
}

export interface ApiResponse {
  data: Post[];
  current_page: number;
  last_page: number;
  total: number;
  links: PaginationLink[];
};

export interface PaginationLink {
  url: string | null;
  label: string;
  page: number | null;
  active: boolean;
};




export type ViewType = 'home' | 'question-detail' | 'ask-question' | 'profile' | 'login' | 'register';
