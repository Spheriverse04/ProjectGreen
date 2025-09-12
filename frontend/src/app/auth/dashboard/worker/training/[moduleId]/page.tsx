'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/utils/axiosInstance';
import RoleGuard from '@/components/RoleGuard';
import clsx from 'clsx';

type Flashcard = { id: string; question: string; answer: string };
type Video = { id: string; title: string; url: string };
type QuizOption = { id: string; text: string; isCorrect: boolean };
type QuizQuestion = { id: string; question: string; type: 'MCQ' | 'SUBJECTIVE'; options?: QuizOption[]; answer?: string };
type Quiz = { id: string; title: string; questions: QuizQuestion[] };

export default function WorkerModulePage() {
  const router = useRouter();
  const { moduleId } = useParams();

  const [moduleTitle, setModuleTitle] = useState('');
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  // Flashcards
  const [flipped, setFlipped] = useState<Record<string, boolean>>({});

  // Quiz gamification
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [showScore, setShowScore] = useState(false);

  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;

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
      setLoading(false);
    } catch (err: any) {
      setMessage(err.response?.data?.message || 'Failed to fetch module');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchModule();
  }, [moduleId]);

  const handleFlip = (id: string) => {
    setFlipped((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleOptionSelect = (optionId: string) => {
    if (!submitted) setSelectedOption(optionId);
  };

  const handleSubmitAnswer = () => {
    if (!selectedOption) return;
    const currentQ = quizzes[currentQuizIndex].questions[currentQuestionIndex];
    const isCorrect = currentQ.options?.find((o) => o.id === selectedOption)?.isCorrect;
    if (isCorrect) setScore((prev) => prev + 1);
    setSubmitted(true);
  };

  const handleNextQuestion = () => {
    const quiz = quizzes[currentQuizIndex];
    if (currentQuestionIndex + 1 < quiz.questions.length) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setSelectedOption(null);
      setSubmitted(false);
    } else {
      setShowScore(true);
    }
  };

  if (loading) return <p className="p-6">Loading module...</p>;

  const currentQuiz = quizzes[currentQuizIndex];
  const currentQ = currentQuiz?.questions[currentQuestionIndex];

  return (
    <RoleGuard role="WORKER">
      <div className="p-6 space-y-6">
        <button onClick={() => router.back()} className="text-blue-600 underline">← Back</button>
        <h1 className="text-3xl font-bold">{moduleTitle}</h1>

        {/* Flashcards */}
        {flashcards.length > 0 && (
          <section className="p-4 border rounded shadow bg-white">
            <h2 className="text-xl font-semibold mb-2">Flashcards</h2>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {flashcards.map((f) => (
                <li key={f.id} className="relative perspective cursor-pointer" onClick={() => handleFlip(f.id)}>
                  <div className={clsx(
                    'transition-transform duration-500 transform rounded shadow p-4 text-center',
                    flipped[f.id] ? 'rotate-y-180 bg-blue-100' : 'bg-white'
                  )}>
                    {flipped[f.id] ? <p><strong>A:</strong> {f.answer}</p> : <p><strong>Q:</strong> {f.question}</p>}
                    <p className="text-sm text-gray-400 mt-2">(click to flip)</p>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Videos */}
        {videos.length > 0 && (
          <section className="p-4 border rounded shadow bg-white">
            <h2 className="text-xl font-semibold mb-2">Videos</h2>
            <ul className="space-y-4">
              {videos.map((v) => {
                const getEmbedUrl = (url: string) => {
                  const ytMatch = url.match(/(?:youtu\.be\/|youtube\.com\/watch\?v=)([\w-]+)/);
                  return ytMatch ? `https://www.youtube.com/embed/${ytMatch[1]}` : null;
                };
                const embedUrl = getEmbedUrl(v.url);

                return (
                  <li key={v.id} className="p-2 border rounded hover:shadow-lg transition">
                    <p className="font-semibold mb-2">{v.title}</p>
                    {embedUrl ? (
                      <div className="relative aspect-video w-full">
                        <iframe
                          src={embedUrl}
                          title={v.title}
                          className="absolute inset-0 w-full h-full rounded"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      </div>
                    ) : (
                      <video src={v.url} controls className="w-full rounded" />
                    )}
                  </li>
                );
              })}
            </ul>
          </section>
        )}

        {/* Gamified Quiz */}
        {currentQuiz && currentQ && (
          <section className="p-4 border rounded shadow bg-white">
            <h2 className="text-xl font-semibold mb-2">Quiz: {currentQuiz.title}</h2>

            {!showScore ? (
              <div className="p-4 rounded border bg-gray-50">
                <p className="mb-4"><strong>Q{currentQuestionIndex + 1}:</strong> {currentQ.question}</p>
                
                {currentQ.type === 'MCQ' && (
                  <ul className="space-y-2">
                    {currentQ.options?.map((o) => {
                      const isSelected = selectedOption === o.id;
                      let optionClass = 'p-2 border rounded cursor-pointer hover:bg-gray-100 transition';
                      if (submitted) {
                        if (o.isCorrect) optionClass += ' bg-green-300 animate-pulse';
                        else if (isSelected && !o.isCorrect) optionClass += ' bg-red-300 animate-shake';
                      } else if (isSelected) optionClass += ' bg-blue-200';
                      return (
                        <li key={o.id} className={optionClass} onClick={() => handleOptionSelect(o.id)}>
                          {o.text}
                        </li>
                      );
                    })}
                  </ul>
                )}

                {!submitted ? (
                  <button
                    onClick={handleSubmitAnswer}
                    className="mt-4 px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                  >
                    Submit Answer
                  </button>
                ) : (
                  <button
                    onClick={handleNextQuestion}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Next Question
                  </button>
                )}

                <p className="mt-2 text-sm text-gray-500">
                  Progress: {currentQuestionIndex + 1} / {currentQuiz.questions.length}
                </p>
              </div>
            ) : (
              <div className="text-center animate-pulse">
                <p className="text-2xl font-bold text-green-600">🎉 Quiz Completed!</p>
                <p className="text-xl mt-2">
                  Your Score: {score} / {currentQuiz.questions.filter(q => q.type === 'MCQ').length}
                </p>
                <button
                  onClick={() => {
                    setCurrentQuestionIndex(0);
                    setSelectedOption(null);
                    setSubmitted(false);
                    setShowScore(false);
                    setScore(0);
                  }}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Retry Quiz
                </button>
              </div>
            )}
          </section>
        )}

        {message && <p className="text-red-500">{message}</p>}
      </div>
    </RoleGuard>
  );
}

