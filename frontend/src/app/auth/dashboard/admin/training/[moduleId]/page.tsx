'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/utils/axiosInstance';

type Flashcard = { id: string; question: string; answer: string };
type Video = { id: string; title: string; url: string };
type Quiz = { id: string; title: string; questions: QuizQuestion[] };

type QuizQuestion = {
  id: string;
  question: string;
  type: 'MCQ' | 'SUBJECTIVE';
  options?: { id: string; text: string; isCorrect: boolean }[];
  answer?: string;
};

export default function ModuleDetailPage() {
  const router = useRouter();
  const { moduleId } = useParams();

  const [moduleTitle, setModuleTitle] = useState('');
  const [role, setRole] = useState('');
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  // Flashcard form
  const [flashQuestion, setFlashQuestion] = useState('');
  const [flashAnswer, setFlashAnswer] = useState('');

  // Video form
  const [videoTitle, setVideoTitle] = useState('');
  const [videoUrl, setVideoUrl] = useState('');

  // Quiz form
  const [quizTitle, setQuizTitle] = useState('');
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);

  // Question form
  const [questionText, setQuestionText] = useState('');
  const [questionType, setQuestionType] = useState<'MCQ' | 'SUBJECTIVE'>('MCQ');
  const [options, setOptions] = useState<{ text: string; isCorrect: boolean }[]>([
    { text: '', isCorrect: false },
  ]);
  const [subjectiveAnswer, setSubjectiveAnswer] = useState('');

  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;

  const fetchModule = async () => {
    try {
      const res = await api.get(`/training/modules/${moduleId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const mod = res.data;
      setModuleTitle(mod.title);
      setRole(mod.role);
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
    const userRole = localStorage.getItem('role');
    if (userRole !== 'ADMIN') router.push('/auth/dashboard');
    else fetchModule();
  }, [moduleId]);

  // ----------------- CRUD Actions -----------------
  // Flashcards
  const addFlashcard = async () => {
    if (!flashQuestion || !flashAnswer) return setMessage('Both fields required');
    try {
      await api.post(
        '/training/flashcards',
        { moduleId, question: flashQuestion, answer: flashAnswer },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setFlashQuestion('');
      setFlashAnswer('');
      fetchModule();
    } catch (err: any) {
      setMessage(err.response?.data?.message || 'Failed to add flashcard');
    }
  };
  const deleteFlashcard = async (id: string) => {
    try {
      await api.delete(`/training/flashcards/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      fetchModule();
    } catch {
      setMessage('Failed to delete flashcard');
    }
  };

  // Videos
  const addVideo = async () => {
    if (!videoTitle || !videoUrl) return setMessage('Both fields required');
    try {
      await api.post(
        '/training/videos',
        { moduleId, title: videoTitle, url: videoUrl },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setVideoTitle('');
      setVideoUrl('');
      fetchModule();
    } catch {
      setMessage('Failed to add video');
    }
  };
  const deleteVideo = async (id: string) => {
    try {
      await api.delete(`/training/videos/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      fetchModule();
    } catch {
      setMessage('Failed to delete video');
    }
  };

  // Quizzes
  const addQuiz = async () => {
    if (!quizTitle) return setMessage('Quiz title required');
    try {
      await api.post(
        '/training/quizzes',
        { moduleId, title: quizTitle },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setQuizTitle('');
      fetchModule();
    } catch {
      setMessage('Failed to add quiz');
    }
  };
  const deleteQuiz = async (id: string) => {
    try {
      await api.delete(`/training/quizzes/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      fetchModule();
    } catch {
      setMessage('Failed to delete quiz');
    }
  };

  // Quiz Question
  const addQuizQuestion = async (quizId: string) => {
    if (!questionText) return setMessage('Question required');
    try {
      const body: any = { quizId, type: questionType, question: questionText };
      if (questionType === 'MCQ') body.options = options;
      if (questionType === 'SUBJECTIVE') body.answer = subjectiveAnswer;

      await api.post('/training/questions', body, { headers: { Authorization: `Bearer ${token}` } });
      setQuestionText('');
      setOptions([{ text: '', isCorrect: false }]);
      setSubjectiveAnswer('');
      fetchModule();
    } catch {
      setMessage('Failed to add question');
    }
  };
  const deleteQuestion = async (id: string) => {
    try {
      await api.delete(`/training/questions/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      fetchModule();
    } catch {
      setMessage('Failed to delete question');
    }
  };

  if (loading) return <p className="p-6">Loading...</p>;

  return (
    <div className="p-6 space-y-6">
      <button onClick={() => router.back()} className="text-blue-600 underline">← Back</button>

      <h1 className="text-3xl font-bold">{moduleTitle} ({role})</h1>

      {/* Flashcards */}
      <section className="p-4 border rounded shadow bg-white">
        <h2 className="text-xl font-semibold mb-2">Flashcards</h2>
        <div className="flex flex-col md:flex-row gap-2 mb-2">
          <input
            type="text"
            placeholder="Question"
            value={flashQuestion}
            onChange={(e) => setFlashQuestion(e.target.value)}
            className="flex-1 p-2 border rounded"
          />
          <input
            type="text"
            placeholder="Answer"
            value={flashAnswer}
            onChange={(e) => setFlashAnswer(e.target.value)}
            className="flex-1 p-2 border rounded"
          />
          <button onClick={addFlashcard} className="px-4 py-2 bg-blue-600 text-white rounded">Add</button>
        </div>
        <ul className="space-y-1">
          {flashcards.map((f) => (
            <li key={f.id} className="p-2 border rounded flex justify-between items-center">
              <span><strong>Q:</strong> {f.question} <br /> <strong>A:</strong> {f.answer}</span>
              <button onClick={() => deleteFlashcard(f.id)} className="px-2 py-1 bg-red-500 text-white rounded">Delete</button>
            </li>
          ))}
        </ul>
      </section>

      {/* Videos */}
      <section className="p-4 border rounded shadow bg-white">
        <h2 className="text-xl font-semibold mb-2">Videos</h2>
        <div className="flex flex-col md:flex-row gap-2 mb-2">
          <input
            type="text"
            placeholder="Title"
            value={videoTitle}
            onChange={(e) => setVideoTitle(e.target.value)}
            className="flex-1 p-2 border rounded"
          />
          <input
            type="text"
            placeholder="URL"
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            className="flex-1 p-2 border rounded"
          />
          <button onClick={addVideo} className="px-4 py-2 bg-blue-600 text-white rounded">Add</button>
        </div>
        <ul className="space-y-1">
          {videos.map((v) => (
            <li key={v.id} className="p-2 border rounded flex justify-between items-center">
              <span><strong>{v.title}</strong>: <a href={v.url} target="_blank" className="text-blue-600 underline">{v.url}</a></span>
              <button onClick={() => deleteVideo(v.id)} className="px-2 py-1 bg-red-500 text-white rounded">Delete</button>
            </li>
          ))}
        </ul>
      </section>

      {/* Quizzes */}
      <section className="p-4 border rounded shadow bg-white">
        <h2 className="text-xl font-semibold mb-2">Quizzes</h2>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            placeholder="Quiz Title"
            value={quizTitle}
            onChange={(e) => setQuizTitle(e.target.value)}
            className="flex-1 p-2 border rounded"
          />
          <button onClick={addQuiz} className="px-4 py-2 bg-blue-600 text-white rounded">Add Quiz</button>
        </div>

        {quizzes.map((q) => (
          <div key={q.id} className="p-2 border rounded mb-4 space-y-2">
            <div className="flex justify-between items-center">
              <strong className="text-lg">{q.title}</strong>
              <button onClick={() => deleteQuiz(q.id)} className="px-2 py-1 bg-red-500 text-white rounded">Delete</button>
            </div>

            <div>
              <button
                className="mt-1 px-2 py-1 bg-green-600 text-white rounded"
                onClick={() => setSelectedQuiz(q)}
              >
                ➕ Add Question
              </button>
            </div>

            {/* List existing questions */}
            <ul className="space-y-3 mt-3">
              {q.questions?.map((qq) => (
                <li key={qq.id} className="p-3 border rounded bg-gray-50">
                  <div className="flex justify-between items-start">
                    <span>
                      <strong>Q:</strong> {qq.question} ({qq.type})
                      {qq.type === 'MCQ' ? (
                        <ul className="ml-6 list-disc mt-2">
                          {qq.options?.map((o) => (
                            <li key={o.id} className={o.isCorrect ? 'text-green-600 font-semibold' : ''}>
                              {o.text} {o.isCorrect && '✅'}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="ml-4 mt-2 text-gray-700">Answer: {qq.answer}</p>
                      )}
                    </span>
                    <button onClick={() => deleteQuestion(qq.id)} className="px-2 py-1 bg-red-500 text-white rounded">Delete</button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ))}

        {/* Question form for selected quiz */}
        {selectedQuiz && (
          <div className="mt-4 p-4 border rounded bg-gray-50">
            <h3 className="font-semibold mb-2">Add Question to: {selectedQuiz.title}</h3>
            <input
              type="text"
              placeholder="Question Text"
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              className="w-full p-2 border rounded mb-2"
            />
            <select
              value={questionType}
              onChange={(e) => setQuestionType(e.target.value as 'MCQ' | 'SUBJECTIVE')}
              className="w-full p-2 border rounded mb-2"
            >
              <option value="MCQ">MCQ</option>
              <option value="SUBJECTIVE">Subjective</option>
            </select>

            {questionType === 'MCQ' ? (
              <div className="space-y-2 mb-2">
                {options.map((opt, idx) => (
                  <div key={idx} className="flex gap-2 items-center">
                    <input
                      type="text"
                      placeholder={`Option ${idx + 1}`}
                      value={opt.text}
                      onChange={(e) => {
                        const newOptions = [...options];
                        newOptions[idx].text = e.target.value;
                        setOptions(newOptions);
                      }}
                      className="flex-1 p-2 border rounded"
                    />
                    <label className="flex items-center gap-1">
                      <input
                        type="checkbox"
                        checked={opt.isCorrect}
                        onChange={(e) => {
                          const newOptions = [...options];
                          newOptions[idx].isCorrect = e.target.checked;
                          setOptions(newOptions);
                        }}
                      />
                      Correct
                    </label>
                    <button
                      onClick={() => setOptions(options.filter((_, i) => i !== idx))}
                      className="px-2 py-1 bg-red-500 text-white rounded"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => setOptions([...options, { text: '', isCorrect: false }])}
                  className="px-4 py-2 bg-blue-600 text-white rounded"
                >
                  Add Option
                </button>
              </div>
            ) : (
              <input
                type="text"
                placeholder="Answer"
                value={subjectiveAnswer}
                onChange={(e) => setSubjectiveAnswer(e.target.value)}
                className="w-full p-2 border rounded mb-2"
              />
            )}

            <button
              onClick={() => addQuizQuestion(selectedQuiz.id)}
              className="px-4 py-2 bg-green-600 text-white rounded"
            >
              Submit Question
            </button>
          </div>
        )}
      </section>

      {message && <p className="mt-4 text-red-500">{message}</p>}
    </div>
  );
}

