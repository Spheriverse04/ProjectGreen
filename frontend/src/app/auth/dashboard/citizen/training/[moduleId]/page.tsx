'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/utils/axiosInstance';
import RoleGuard from '@/components/RoleGuard';

// Type definitions for module content
type Flashcard = { id: string; question: string; answer: string };
type Video = { id: string; title: string; url: string };
type QuizOption = { id: string; text: string; isCorrect: boolean };
type QuizQuestion = { id: string; question: string; type: 'MCQ' | 'SUBJECTIVE'; options?: QuizOption[]; answer?: string };
type Quiz = { id: string; title: string; questions: QuizQuestion[] };

export default function CitizenModulePage() {
  const router = useRouter();
  const { moduleId } = useParams();

  // --- State Hooks ---
  const [moduleTitle, setModuleTitle] = useState('');
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  // Game state
  const [currentSection, setCurrentSection] = useState<'overview' | 'flashcards' | 'videos' | 'quiz'>('overview');
  const [userStats, setUserStats] = useState({
    xp: 0,
    streak: 0,
    accuracy: 0,
    completedItems: 0,
    totalItems: 0
  });

  // Flashcards state
  const [currentFlashcard, setCurrentFlashcard] = useState(0);
  const [flippedCards, setFlippedCards] = useState<Set<number>>(new Set());
  const [masteredCards, setMasteredCards] = useState<Set<number>>(new Set());

  // Quiz state
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [showScore, setShowScore] = useState(false);
  const [quizStarted, setQuizStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [showCelebration, setShowCelebration] = useState(false);

  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;

  // --- API Functions ---
  const recordProgress = async (type: 'FLASHCARD' | 'VIDEO' | 'QUIZ', itemId: string, status: 'COMPLETED' | 'MASTERED', xp: number) => {
    try {
      await api.post(
        `/training/progress`,
        { moduleId, type, itemId, status, xp },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (err) {
      console.error('Failed to record progress', err);
    }
  };

  const fetchModule = async () => {
    try {
      const res = await api.get(`/training/modules/${moduleId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const mod = res.data;
      setModuleTitle(mod.title);
      setFlashcards(mod.flashcards || []);
      setVideos(mod.videos || []);
      setQuizzes(mod.quizzes || []);

      const totalItems = (mod.flashcards?.length || 0) + (mod.videos?.length || 0) + (mod.quizzes?.length || 0);
      setUserStats(prev => ({ ...prev, totalItems }));

      setLoading(false);
    } catch (err: any) {
      setMessage(err.response?.data?.message || 'Failed to fetch module');
      setLoading(false);
    }
  };

  // --- Effects ---
  useEffect(() => {
    if (moduleId) {
      fetchModule();
    }
  }, [moduleId]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (quizStarted && !submitted && timeLeft > 0) {
      timer = setTimeout(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (timeLeft === 0 && !submitted) {
      handleSubmitAnswer();
    }
    return () => clearTimeout(timer);
  }, [quizStarted, submitted, timeLeft]);

  // --- Handlers ---
  const handleFlashcardFlip = (index: number) => {
    setFlippedCards(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) newSet.delete(index);
      else newSet.add(index);
      return newSet;
    });
  };

  const handleMasterCard = (index: number) => {
    if (masteredCards.has(index)) return; // prevent duplicate

    setMasteredCards(prev => new Set([...prev, index]));
    setUserStats(prev => ({ ...prev, xp: prev.xp + 10, completedItems: prev.completedItems + 1 }));
    recordProgress('FLASHCARD', flashcards[index].id, 'MASTERED', 10);

    setShowCelebration(true);
    setTimeout(() => setShowCelebration(false), 1000);
  };

  const handleVideoWatched = (videoId: string) => {
    setUserStats(prev => ({ ...prev, xp: prev.xp + 15, completedItems: prev.completedItems + 1 }));
    recordProgress('VIDEO', videoId, 'COMPLETED', 15);

    setShowCelebration(true);
    setTimeout(() => setShowCelebration(false), 1000);
  };

  const handleOptionSelect = (optionId: string) => {
    if (!submitted) setSelectedOption(optionId);
  };

  const handleSubmitAnswer = () => {
    if (!selectedOption && currentQuiz?.questions[currentQuestionIndex]?.type === 'MCQ') return;

    const currentQ = currentQuiz?.questions[currentQuestionIndex];
    const isCorrect = currentQ?.options?.find((o) => o.id === selectedOption)?.isCorrect;

    if (isCorrect) {
      setScore(prev => prev + 1);
      setUserStats(prev => ({ ...prev, xp: prev.xp + 25 }));
    }

    setSubmitted(true);
    setTimeLeft(30);
  };

  const handleNextQuestion = () => {
    const quiz = quizzes[currentQuizIndex];
    if (currentQuestionIndex + 1 < quiz.questions.length) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedOption(null);
      setSubmitted(false);
      setTimeLeft(30);
    } else {
      setShowScore(true);
      setQuizStarted(false);

      const accuracy = (score / quiz.questions.length) * 100;
      const bonusXP = accuracy >= 80 ? 50 : accuracy >= 60 ? 25 : 10;
      setUserStats(prev => ({
        ...prev,
        xp: prev.xp + bonusXP,
        accuracy,
        completedItems: prev.completedItems + 1
      }));

      recordProgress('QUIZ', quiz.id, 'COMPLETED', score * 25 + bonusXP);
    }
  };

  const startQuiz = () => {
    setQuizStarted(true);
    setCurrentQuestionIndex(0);
    setScore(0);
    setSelectedOption(null);
    setSubmitted(false);
    setShowScore(false);
    setTimeLeft(30);
  };

  // --- JSX Rendering ---
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="game-card p-8 text-center">
          <div className="animate-spin w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-white text-xl">Loading module...</p>
        </div>
      </div>
    );
  }

  const currentQuiz = quizzes[currentQuizIndex];
  const currentQ = currentQuiz?.questions[currentQuestionIndex];
  const progressPercentage = userStats.totalItems > 0 ? (userStats.completedItems / userStats.totalItems) * 100 : 0;

  return (
    <RoleGuard role="CITIZEN">
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
        {showCelebration && (
          <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
            <div className="text-6xl celebration">🎉</div>
          </div>
        )}

        <div className="relative z-10 p-6 space-y-6">
          {/* Header */}
          <div className="slide-in-up">
            <div className="game-card p-6">
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={() => router.back()}
                  className="game-button-secondary px-4 py-2"
                >
                  ← Back to Quest Map
                </button>

                <div className="flex items-center space-x-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-400">{userStats.xp}</div>
                    <div className="text-xs text-gray-400">XP Earned</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-400">{progressPercentage.toFixed(0)}%</div>
                    <div className="text-xs text-gray-400">Complete</div>
                  </div>
                </div>
              </div>

              <h1 className="text-4xl font-bold text-white mb-4 text-center">
                🎯 <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">{moduleTitle}</span>
              </h1>

              <div className="w-full bg-slate-700 rounded-full h-3 mb-4">
                <div
                  className="bg-gradient-to-r from-green-400 to-blue-500 h-3 rounded-full transition-all duration-1000"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>

              <div className="flex justify-center space-x-2">
                {['overview', 'flashcards', 'videos', 'quiz'].map((section) => (
                  <button
                    key={section}
                    onClick={() => setCurrentSection(section as any)}
                    className={`px-4 py-2 rounded-xl font-semibold transition-all duration-300 ${
                      currentSection === section
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                        : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                    }`}
                  >
                    {section.charAt(0).toUpperCase() + section.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Content Sections */}
          {currentSection === 'overview' && (
            <div className="slide-in-left">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="game-card p-6 text-center cursor-pointer hover:scale-105 transition-all duration-300"
                  onClick={() => setCurrentSection('flashcards')}>
                  <div className="text-5xl mb-4">🃏</div>
                  <h3 className="text-xl font-bold text-white mb-2">Flashcards</h3>
                  <p className="text-gray-300 mb-4">Master key concepts</p>
                  <div className="text-2xl font-bold text-blue-400">{flashcards.length}</div>
                  <div className="text-sm text-gray-400">Cards Available</div>
                </div>

                <div className="game-card p-6 text-center cursor-pointer hover:scale-105 transition-all duration-300"
                  onClick={() => setCurrentSection('videos')}>
                  <div className="text-5xl mb-4">🎬</div>
                  <h3 className="text-xl font-bold text-white mb-2">Videos</h3>
                  <p className="text-gray-300 mb-4">Watch and learn</p>
                  <div className="text-2xl font-bold text-green-400">{videos.length}</div>
                  <div className="text-sm text-gray-400">Videos Available</div>
                </div>

                <div className="game-card p-6 text-center cursor-pointer hover:scale-105 transition-all duration-300"
                  onClick={() => setCurrentSection('quiz')}>
                  <div className="text-5xl mb-4">🧠</div>
                  <h3 className="text-xl font-bold text-white mb-2">Quizzes</h3>
                  <p className="text-gray-300 mb-4">Test your knowledge</p>
                  <div className="text-2xl font-bold text-purple-400">{quizzes.length}</div>
                  <div className="text-sm text-gray-400">Quizzes Available</div>
                </div>
              </div>
            </div>
          )}

          {currentSection === 'flashcards' && flashcards.length > 0 && (
            <div className="slide-in-right">
              <div className="game-card p-8">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-3xl font-bold text-white">🃏 Flashcard Arena</h2>
                  <div className="text-purple-300">
                    {currentFlashcard + 1} / {flashcards.length}
                  </div>
                </div>

                <div className="max-w-2xl mx-auto">
                  <div className={`flashcard ${flippedCards.has(currentFlashcard) ? 'flipped' : ''} mb-6`}>
                    <div className="flashcard-inner" onClick={() => handleFlashcardFlip(currentFlashcard)}>
                      <div className="flashcard-front">
                        <div className="text-center">
                          <div className="text-2xl mb-4">🤔</div>
                          <h3 className="text-xl font-bold mb-4">Question</h3>
                          <p className="text-lg">{flashcards[currentFlashcard]?.question}</p>
                          <p className="text-sm mt-4 opacity-75">Click to reveal answer</p>
                        </div>
                      </div>
                      <div className="flashcard-back">
                        <div className="text-center">
                          <div className="text-2xl mb-4">💡</div>
                          <h3 className="text-xl font-bold mb-4">Answer</h3>
                          <p className="text-lg">{flashcards[currentFlashcard]?.answer}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Flashcard Controls */}
                  <div className="flex justify-between items-center">
                    <button
                      onClick={() => setCurrentFlashcard(Math.max(0, currentFlashcard - 1))}
                      disabled={currentFlashcard === 0}
                      className="game-button-secondary px-6 py-3 disabled:opacity-50"
                    >
                      ← Previous
                    </button>

                    {flippedCards.has(currentFlashcard) && !masteredCards.has(currentFlashcard) && (
                      <button
                        onClick={() => handleMasterCard(currentFlashcard)}
                        className="game-button-success px-6 py-3"
                      >
                        ✅ Mastered (+10 XP)
                      </button>
                    )}

                    {masteredCards.has(currentFlashcard) && (
                      <div className="px-6 py-3 bg-green-900/30 border border-green-500/50 rounded-xl text-green-400 font-bold">
                        ✅ Mastered!
                      </div>
                    )}

                    <button
                      onClick={() => setCurrentFlashcard(Math.min(flashcards.length - 1, currentFlashcard + 1))}
                      disabled={currentFlashcard === flashcards.length - 1}
                      className="game-button-secondary px-6 py-3 disabled:opacity-50"
                    >
                      Next →
                    </button>
                  </div>

                  {/* Progress */}
                  <div className="mt-6">
                    <div className="flex justify-between text-sm text-gray-400 mb-2">
                      <span>Mastered: {masteredCards.size}/{flashcards.length}</span>
                      <span>{((masteredCards.size / flashcards.length) * 100).toFixed(0)}%</span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-green-400 to-blue-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${(masteredCards.size / flashcards.length) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentSection === 'videos' && videos.length > 0 && (
            <div className="slide-in-up">
              <div className="game-card p-8">
                <h2 className="text-3xl font-bold text-white mb-6 text-center">🎬 Video Library</h2>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {videos.map((video, index) => {
                    const getEmbedUrl = (url: string) => {
                      const ytMatch = url.match(/(?:youtu\.be\/|youtube\.com\/watch\?v=)([\w-]+)/);
                      return ytMatch ? `https://www.youtube.com/embed/${ytMatch[1]}` : null;
                    };
                    const embedUrl = getEmbedUrl(video.url);

                    return (
                      <div key={video.id} className="game-card p-6 hover:scale-105 transition-all duration-300">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-xl font-bold text-white">{video.title}</h3>
                          <div className="text-2xl">🎥</div>
                        </div>

                        <div className="aspect-video rounded-xl overflow-hidden mb-4">
                          {embedUrl ? (
                            <iframe
                              src={embedUrl}
                              title={video.title}
                              className="w-full h-full"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                            />
                          ) : (
                            <video src={video.url} controls className="w-full h-full object-cover" />
                          )}
                        </div>

                        <button
                          className="game-button w-full py-3"
                          onClick={() => handleVideoWatched(video.id)}
                        >
                          Mark as Watched (+15 XP)
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {currentSection === 'quiz' && currentQuiz && (
            <div className="slide-in-left">
              <div className="game-card p-8">
                <div className="text-center mb-6">
                  <h2 className="text-3xl font-bold text-white mb-2">🧠 Quiz Arena</h2>
                  <p className="text-gray-300">{currentQuiz.title}</p>
                </div>

                {!quizStarted && !showScore ? (
                  <div className="text-center max-w-md mx-auto">
                    <div className="text-6xl mb-6">🎯</div>
                    <h3 className="text-2xl font-bold text-white mb-4">Ready for the Challenge?</h3>
                    <p className="text-gray-300 mb-6">
                      Test your knowledge with {currentQuiz.questions.length} questions.
                      Each correct answer earns you 25 XP!
                    </p>
                    <button onClick={startQuiz} className="game-button text-xl px-8 py-4">
                      🚀 Start Quiz
                    </button>
                  </div>
                ) : showScore ? (
                  <div className="text-center max-w-md mx-auto">
                    <div className="text-6xl mb-6">🎉</div>
                    <h3 className="text-3xl font-bold text-white mb-4">Quiz Complete!</h3>
                    <div className="space-y-4 mb-6">
                      <div className="text-2xl">
                        <span className="text-green-400 font-bold">{score}</span>
                        <span className="text-gray-400"> / {currentQuiz.questions.length}</span>
                      </div>
                      <div className="text-xl text-purple-400">
                        Accuracy: {((score / currentQuiz.questions.length) * 100).toFixed(0)}%
                      </div>
                      <div className="text-lg text-yellow-400">
                        +{score * 25 + (userStats.accuracy >= 80 ? 50 : userStats.accuracy >= 60 ? 25 : 10)} XP Earned!
                      </div>
                    </div>
                    <div className="space-y-3">
                      <button
                        onClick={() => {
                          setQuizStarted(false);
                          setShowScore(false);
                          setCurrentQuestionIndex(0);
                          setScore(0);
                        }}
                        className="game-button w-full py-3"
                      >
                        🔄 Retry Quiz
                      </button>
                      <button
                        onClick={() => setCurrentSection('overview')}
                        className="game-button-secondary w-full py-3"
                      >
                        📚 Back to Overview
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="max-w-2xl mx-auto">
                    {/* Timer */}
                    <div className="flex justify-between items-center mb-6">
                      <div className="text-white">
                        Question {currentQuestionIndex + 1} / {currentQuiz.questions.length}
                      </div>
                      <div className={`px-4 py-2 rounded-xl font-bold ${
                        timeLeft <= 10 ? 'bg-red-500 text-white animate-pulse' : 'bg-slate-700 text-gray-300'
                      }`}>
                        ⏰ {timeLeft}s
                      </div>
                    </div>

                    {/* Question */}
                    <div className="game-card p-6 mb-6">
                      <h3 className="text-xl font-bold text-white mb-4">{currentQ?.question}</h3>

                      {currentQ?.type === 'MCQ' && (
                        <div className="space-y-3">
                          {currentQ.options?.map((option) => {
                            const isSelected = selectedOption === option.id;
                            let optionClass = 'quiz-option';

                            if (submitted) {
                              if (option.isCorrect) optionClass += ' correct';
                              else if (isSelected && !option.isCorrect) optionClass += ' incorrect';
                            } else if (isSelected) {
                              optionClass += ' selected';
                            }

                            return (
                              <div
                                key={option.id}
                                className={optionClass}
                                onClick={() => handleOptionSelect(option.id)}
                              >
                                <div className="flex items-center space-x-3">
                                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                                    isSelected ? 'border-blue-400 bg-blue-400' : 'border-gray-500'
                                  }`}>
                                    {isSelected && <div className="w-3 h-3 bg-white rounded-full"></div>}
                                  </div>
                                  <span className="text-white">{option.text}</span>
                                </div>
                                {submitted && option.isCorrect && (
                                  <div className="text-green-400 font-bold">✓ Correct!</div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* Controls */}
                    <div className="text-center">
                      {!submitted ? (
                        <button
                          onClick={handleSubmitAnswer}
                          disabled={!selectedOption}
                          className="game-button px-8 py-4 text-lg disabled:opacity-50"
                        >
                          Submit Answer
                        </button>
                      ) : (
                        <button
                          onClick={handleNextQuestion}
                          className="game-button-success px-8 py-4 text-lg"
                        >
                          {currentQuestionIndex + 1 < currentQuiz.questions.length ? 'Next Question →' : 'Finish Quiz 🎉'}
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {message && (
            <div className="game-card p-4 border-red-500/50 bg-red-900/20">
              <p className="text-red-400 text-center">{message}</p>
            </div>
          )}
        </div>
      </div>
    </RoleGuard>
  );
}
