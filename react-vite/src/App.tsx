import { useState, useEffect } from 'react';
import { ViewType, Question, User, Answer, Comment } from './types';
import { MOCK_QUESTIONS, CURRENT_USER, POPULAR_TAGS } from './data';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import RightSidebar from './components/RightSidebar';
import HomeView from './views/HomeView';
import QuestionDetailView from './views/QuestionDetailView';
import AskQuestionView from './views/AskQuestionView';
import ProfileView from './views/ProfileView';
import LoginView from './views/LoginView';
import RegisterView from './views/RegisterView';
import { Sparkles, MessageSquare, Award, AlertCircle } from 'lucide-react';

export default function App() {
  const [currentView, setView] = useState<ViewType>('home');
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'info' } | null>(null);

  // Initialize state from LocalStorage or mock data
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

  // Save changes to LocalStorage
  useEffect(() => {
    localStorage.setItem('devoverflow-questions', JSON.stringify(questions));
  }, [questions]);

  useEffect(() => {
    localStorage.setItem('devoverflow-user', JSON.stringify(currentUser));
  }, [currentUser]);

  // Set up auto-dismiss navigation notice
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

  // Upvote / downvote question handlers
  const handleQuestionVote = (id: string, dir: 'up' | 'down') => {
    setQuestions((prevQuestions) =>
      prevQuestions.map((q) => {
        if (q.id !== id) return q;

        let voteDiff = 0;
        let newVoted: 'up' | 'down' | null = dir;

        if (q.voted === dir) {
          // Untoggle vote
          voteDiff = dir === 'up' ? -1 : 1;
          newVoted = null;
        } else {
          // Change vote or new vote
          if (q.voted === null) {
            voteDiff = dir === 'up' ? 1 : -1;
          } else {
            // Swapping upvote <-> downvote is worth 2 points
            voteDiff = dir === 'up' ? 2 : -2;
          }
        }

        const updatedScore = q.votes + voteDiff;

        // Simulate StackOverflow Author reputation reward system (+10 on question upvote)
        if (q.author.id !== currentUser.id) {
          q.author.reputation += voteDiff * 10;
        }

        return {
          ...q,
          votes: updatedScore,
          voted: newVoted,
        };
      })
    );
    showNotification(dir === 'up' ? 'Mendukung pertanyaan! Reputasi penulis dinaikkan.' : 'Menolak pertanyaan ini.');
  };

  // Upvote / downvote Answer handlers
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

          // Simulate reputation change (+15 on answer upvote)
          if (ans.author.id !== currentUser.id) {
            ans.author.reputation += voteDiff * 15;
          }

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

  // Add Answer handler
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

    // Reward active user for answering a query (+15 reputation points!)
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

  // Add Comment to question handler
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

  // Add Comment to Answer handler
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

  // Accept Answer as solver handler
  const handleAcceptAnswer = (questionId: string, answerId: string) => {
    setQuestions((prevQuestions) =>
      prevQuestions.map((q) => {
        if (q.id !== questionId) return q;

        const updatedAnswers = q.answers.map((ans) => {
          // If this is the chosen answer, toggle acceptance and reward points
          if (ans.id === answerId) {
            if (!ans.isAccepted && ans.author.id !== currentUser.id) {
              ans.author.reputation += 25; // Massive reward for accepted answers!
            }
            return { ...ans, isAccepted: true };
          }
          // Reset other responses to ensure only one solution is accepted
          return { ...ans, isAccepted: false };
        });

        return { ...q, answers: updatedAnswers };
      })
    );
    showNotification('Sempurna! Anda menerima solusi ini. Reputasi pemecah masalah dinaikkan +25! 🌟');
  };

  // Post new public question handler
  const handlePostQuestion = (title: string, body: string, tags: string[]) => {
    const newQuestion: Question = {
      id: `q-${Date.now()}`,
      title,
      body,
      tags,
      author: currentUser,
      votes: 1, // Author starts with self-support score
      views: 12,
      answers: [],
      comments: [],
      createdAt: 'Baru saja',
    };

    setQuestions((prev) => [newQuestion, ...prev]);
    setView('home');
    setSearchQuery('');
    setSelectedTag(null);
    showNotification('Pertanyaan publik baru Anda berhasil diterbitkan! 🚀');
  };

  const handleUpdateProfile = (updatedData: Partial<User>) => {
    setCurrentUser((prev) => ({
      ...prev,
      ...updatedData,
    }));
    showNotification('Informasi profil developer Anda sukses disimpan!');
  };

  const activeQuestion = questions.find((q) => q.id === selectedQuestionId);

  // Compute stats for RightSidebar
  const hotQuestions = [...questions].sort((a, b) => b.votes - a.votes).slice(0, 4);

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-zinc-950 font-sans antialiased text-zinc-900 dark:text-zinc-100 transition-colors duration-200">
      {/* Dynamic Float Notification Toast Alert */}
      {notification && (
        <div id="toast-notification" className="fixed bottom-6 right-6 z-50 p-4 rounded-xl border border-emerald-350 dark:border-emerald-900/50 bg-emerald-50 dark:bg-zinc-900 text-emerald-800 dark:text-emerald-400 text-xs sm:text-sm shadow-xl flex items-center gap-2.5 max-w-sm sm:max-w-md animate-slide-in">
          <Sparkles className="h-5 w-5 text-emerald-550 shrink-0" />
          <p className="font-semibold">{notification.message}</p>
        </div>
      )}

      {/* Global Navigation bar header */}
      <Navbar
        currentUser={currentUser}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        currentView={currentView}
        setView={setView}
        onAskQuestionClick={() => {
          setView('ask-question');
          setSelectedQuestionId(null);
        }}
        onLogout={() => {
          setView('login');
          showNotification('Berhasil keluar dari sesi Flexicord.', 'info');
        }}
      />

      {/* Main viewport Container */}
      <div className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {currentView === 'login' || currentView === 'register' ? (
          <div className="max-w-5xl mx-auto py-2">
            {currentView === 'login' ? (
              <LoginView
                onLoginSuccess={(user) => {
                  setCurrentUser(user);
                  setView('home');
                  showNotification(`Selamat datang kembali, ${user.displayName}! 👋`);
                }}
                onSwitchToRegister={() => setView('register')}
              />
            ) : (
              <RegisterView
                onRegisterSuccess={(user) => {
                  setCurrentUser(user);
                  setView('home');
                  showNotification(`Akun berhasil dibuat! Selamat bergabung, ${user.displayName}! 🎉`);
                }}
                onSwitchToLogin={() => setView('login')}
              />
            )}
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-6 sm:gap-8">
            {/* Left Sidebar navigation link list */}
            <Sidebar
              currentView={currentView}
              setView={(v) => {
                setView(v);
                if (v === 'home') setSelectedQuestionId(null);
              }}
              currentUser={currentUser}
              selectedTag={selectedTag}
              setSelectedTag={setSelectedTag}
            />

            {/* Major responsive main viewport view router */}
            <main className="flex-1 min-w-0">
              {currentView === 'home' && (
                <HomeView
                  questions={questions}
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                  selectedTag={selectedTag}
                  setSelectedTag={setSelectedTag}
                  onQuestionClick={(id) => {
                    setSelectedQuestionId(id);
                    setView('question-detail');
                    
                    // Simulate increasing views counter on select
                    setQuestions((prev) =>
                      prev.map((q) => (q.id === id ? { ...q, views: q.views + 1 } : q))
                    );
                  }}
                  onVoteUp={(id, e) => {
                    e.stopPropagation();
                    handleQuestionVote(id, 'up');
                  }}
                  onVoteDown={(id, e) => {
                    e.stopPropagation();
                    handleQuestionVote(id, 'down');
                  }}
                  onAskQuestionClick={() => setView('ask-question')}
                />
              )}

              {currentView === 'question-detail' && activeQuestion ? (
                <QuestionDetailView
                  question={activeQuestion}
                  currentUser={currentUser}
                  onBackClick={() => {
                    setView('home');
                    setSelectedQuestionId(null);
                  }}
                  onQuestionVote={handleQuestionVote}
                  onAnswerVote={handleAnswerVote}
                  onAddAnswer={handleAddAnswer}
                  onAddCommentToQuestion={handleAddCommentToQuestion}
                  onAddCommentToAnswer={handleAddCommentToAnswer}
                  onAcceptAnswer={handleAcceptAnswer}
                />
              ) : currentView === 'question-detail' ? (
                <div className="p-12 text-center text-zinc-500">
                  Pertanyaan tidak ditemukan atau telah dihapus.
                </div>
              ) : null}

              {currentView === 'ask-question' && (
                <AskQuestionView
                  currentUser={currentUser}
                  onPostQuestion={handlePostQuestion}
                  onCancel={() => {
                    setView('home');
                    setSelectedQuestionId(null);
                  }}
                />
              )}

              {currentView === 'profile' && (
                <ProfileView
                  currentUser={currentUser}
                  questions={questions}
                  onUpdateProfile={handleUpdateProfile}
                  onQuestionClick={(id) => {
                    setSelectedQuestionId(id);
                    setView('question-detail');
                  }}
                />
              )}
            </main>

            {/* Right Sidebar panel metrics, hidden on Ask and Profile screens and shown on list screens */}
            {(currentView === 'home' || currentView === 'question-detail') && (
              <RightSidebar
                hotQuestions={hotQuestions}
                popularTags={POPULAR_TAGS}
                selectedTag={selectedTag}
                onTagClick={(tag) => {
                  setSelectedTag(tag);
                  setView('home');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onQuestionClick={(id) => {
                  setSelectedQuestionId(id);
                  setView('question-detail');
                  
                  setQuestions((prev) =>
                    prev.map((q) => (q.id === id ? { ...q, views: q.views + 1 } : q))
                  );
                }}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
