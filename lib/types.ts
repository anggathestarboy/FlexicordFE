export interface Role {
  id: string;
  name: string;
  permissions: string | null;
  created_at: string;
  pivot: {
    user_id: string;
    role_id: string;
  };
  parsedPermissions?: {
    all?: boolean;
  };
}

export interface User {
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
  roles: Role[];
  primary_role: Role;
}

export interface LoginResponse {
  message: string;
  user: User;
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





export type ViewType = 'home' | 'question-detail' | 'ask-question' | 'profile' | 'login' | 'register';
