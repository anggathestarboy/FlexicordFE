export interface User {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string;
  reputation: number;
  bio?: string;
  joinedDate: string;
  location?: string;
  websiteUrl?: string;
  githubUrl?: string;
  badges: {
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

// type posts GET
export interface PostsType {
  current_page: number
  data: Posts[]
  first_page_url: string
  from: number
  last_page_url: string
  last_page: number
  links: Link[]
  next_page_url: string
  path: string
  per_page: number
  prev_page_url: string
  to: number
  total: number
}

export interface PostsResponse {
  data: Posts[]
}

export interface Posts {
  id: string
  user_id: string
  category_id: string
  title: string
  body: string
  status: string
  view_count: number
  vote_score: number
  is_answered: number
  accepted_answer_id: string
  created_at: string
  updated_at: string
}

export interface Link {
  url: string
  label: string
  active: boolean
}





export type ViewType = 'home' | 'question-detail' | 'ask-question' | 'profile' | 'login' | 'register';
