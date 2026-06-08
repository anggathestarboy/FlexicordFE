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

export type ViewType = 'home' | 'question-detail' | 'ask-question' | 'profile' | 'login' | 'register';
