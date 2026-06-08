"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Question, User, Answer, Comment, ViewType } from '@/lib/types';
import { MOCK_QUESTIONS, CURRENT_USER } from '@/lib/data';

interface AppContextType {
  questions: Question[];
  currentUser: User;
  setQuestions: React.Dispatch<React.SetStateAction<Question[]>>;
  setCurrentUser: React.Dispatch<React.SetStateAction<User>>;
  handleQuestionVote: (id: string, dir: 'up' | 'down') => void;
  handleAnswerVote: (questionId: string, answerId: string, dir: 'up' | 'down') => void;
  handleAddAnswer: (questionId: string, body: string) => void;
  handleAddCommentToQuestion: (questionId: string, body: string) => void;
  handleAddCommentToAnswer: (questionId: string, answerId: string, body: string) => void;
  handleAcceptAnswer: (questionId: string, answerId: string) => void;
  handlePostQuestion: (title: string, body: string, tags: string[]) => void;
  handleUpdateProfile: (updatedData: Partial<User>) => void;
  notification: { message: string; type: 'success' | 'info' } | null;
  showNotification: (message: string, type?: 'success' | 'info') => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedTag: string | null;
  setSelectedTag: (tag: string | null) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'info' } | null>(null);

  const [questions, setQuestions] = useState<Question[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('devoverflow-questions');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error('Failed to parse saved questions', e);
        }
      }
    }
    return MOCK_QUESTIONS;
  });

  const [currentUser, setCurrentUser] = useState<User>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('devoverflow-user');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error('Failed to parse saved user', e);
        }
      }
    }
    return CURRENT_USER;
  });

  useEffect(() => {
    localStorage.setItem('devoverflow-questions', JSON.stringify(questions));
  }, [questions]);

  useEffect(() => {
    localStorage.setItem('devoverflow-user', JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const showNotification = (message: string, type: 'success' | 'info' = 'success') => {
    setNotification({ message, type });
  };

  const handleQuestionVote = (id: string, dir: 'up' | 'down') => {
    setQuestions((prevQuestions) =>
      prevQuestions.map((q) => {
        if (q.id !== id) return q;

        let voteDiff = 0;
        let newVoted: 'up' | 'down' | null = dir;

        if (q.voted === dir) {
          voteDiff = dir === 'up' ? -1 : 1;
          newVoted = null;
        } else {
          if (q.voted === null) {
            voteDiff = dir === 'up' ? 1 : -1;
          } else {
            voteDiff = dir === 'up' ? 2 : -2;
          }
        }

        const updatedScore = q.votes + voteDiff;

        // Simulate StackOverflow Author reputation reward system (+10 on question upvote)
        const updatedAuthor = { ...q.author };
        if (updatedAuthor.id !== currentUser.id) {
          updatedAuthor.reputation += voteDiff * 10;
        }

        return {
          ...q,
          votes: updatedScore,
          voted: newVoted,
          author: updatedAuthor
        };
      })
    );
    showNotification(dir === 'up' ? 'Mendukung pertanyaan! Reputasi penulis dinaikkan.' : 'Menolak pertanyaan ini.');
  };

  const handleAnswerVote = (questionId: string, answerId: string, dir: 'up' | 'down') => {
    setQuestions((prevQuestions) =>
      prevQuestions.map((q) => {
        if (q.id !== questionId) return q;

        const updatedAnswers = q.answers.map((ans) => {
          if (ans.id !== answerId) return ans;

          let voteDiff = 0;
          let newVoted: 'up' | 'down' | null = dir;

          if (ans.voted === dir) {
            voteDiff = dir === 'up' ? -1 : 1;
            newVoted = null;
          } else {
            if (ans.voted === null) {
              voteDiff = dir === 'up' ? 1 : -1;
            } else {
              voteDiff = dir === 'up' ? 2 : -2;
            }
          }

          const updatedVotes = ans.votes + voteDiff;

          return {
            ...ans,
            votes: updatedVotes,
            voted: newVoted,
          };
        });

        return { ...q, answers: updatedAnswers };
      })
    );
    showNotification(dir === 'up' ? 'Menyukai jawaban ini! Reputasi pemberi solusi terangkat.' : 'Menolak kegunaan jawaban ini.');
  };

  const handleAddAnswer = (questionId: string, body: string) => {
    const newAnswer: Answer = {
      id: `a-${Date.now()}`,
      questionId,
      author: currentUser,
      body,
      votes: 0,
      isAccepted: false,
      comments: [],
      createdAt: 'Baru saja',
    };

    setQuestions((prevQuestions) =>
      prevQuestions.map((q) => {
        if (q.id !== questionId) return q;
        return {
          ...q,
          answers: [...q.answers, newAnswer],
        };
      })
    );

    setCurrentUser((prev) => ({
      ...prev,
      reputation: prev.reputation + 15,
      badges: {
        ...prev.badges,
        bronze: prev.badges.bronze + 1,
      },
    }));

    showNotification('Sukses memposting solusi! Anda memperoleh +15 Poin Reputasi! 🎉');
  };

  const handleAddCommentToQuestion = (questionId: string, body: string) => {
    const newComment: Comment = {
      id: `c-${Date.now()}`,
      author: currentUser,
      body,
      votes: 0,
      createdAt: 'Baru saja',
    };

    setQuestions((prevQuestions) =>
      prevQuestions.map((q) => {
        if (q.id !== questionId) return q;
        return {
          ...q,
          comments: [...q.comments, newComment],
        };
      })
    );
    showNotification('Komentar berhasil ditambahkan pada pertanyaan.');
  };

  const handleAddCommentToAnswer = (questionId: string, answerId: string, body: string) => {
    const newComment: Comment = {
      id: `c-${Date.now()}`,
      author: currentUser,
      body,
      votes: 0,
      createdAt: 'Baru saja',
    };

    setQuestions((prevQuestions) =>
      prevQuestions.map((q) => {
        if (q.id !== questionId) return q;

        const updatedAnswers = q.answers.map((ans) => {
          if (ans.id !== answerId) return ans;
          return {
            ...ans,
            comments: [...ans.comments, newComment],
          };
        });

        return { ...q, answers: updatedAnswers };
      })
    );
    showNotification('Komentar berhasil ditambahkan pada jawaban.');
  };

  const handleAcceptAnswer = (questionId: string, answerId: string) => {
    setQuestions((prevQuestions) =>
      prevQuestions.map((q) => {
        if (q.id !== questionId) return q;

        const updatedAnswers = q.answers.map((ans) => {
          if (ans.id === answerId) {
            return { ...ans, isAccepted: true };
          }
          return { ...ans, isAccepted: false };
        });

        return { ...q, answers: updatedAnswers };
      })
    );
    showNotification('Sempurna! Anda menerima solusi ini. Reputasi pemecah masalah dinaikkan +25! 🌟');
  };

  const handlePostQuestion = (title: string, body: string, tags: string[]) => {
    const newQuestion: Question = {
      id: `q-${Date.now()}`,
      title,
      body,
      tags,
      author: currentUser,
      votes: 1,
      views: 12,
      answers: [],
      comments: [],
      createdAt: 'Baru saja',
    };

    setQuestions((prev) => [newQuestion, ...prev]);
    showNotification('Pertanyaan publik baru Anda berhasil diterbitkan! 🚀');
  };

  const handleUpdateProfile = (updatedData: Partial<User>) => {
    setCurrentUser((prev) => ({
      ...prev,
      ...updatedData,
    }));
    showNotification('Informasi profil developer Anda sukses disimpan!');
  };

  return (
    <AppContext.Provider
      value={{
        questions,
        currentUser,
        setQuestions,
        setCurrentUser,
        handleQuestionVote,
        handleAnswerVote,
        handleAddAnswer,
        handleAddCommentToQuestion,
        handleAddCommentToAnswer,
        handleAcceptAnswer,
        handlePostQuestion,
        handleUpdateProfile,
        notification,
        showNotification,
        searchQuery,
        setSearchQuery,
        selectedTag,
        setSelectedTag,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
