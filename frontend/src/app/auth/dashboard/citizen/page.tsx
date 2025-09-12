'use client';

import RoleGuard from '@/components/RoleGuard';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function CitizenDashboard() {
  const router = useRouter();
  const [userStats, setUserStats] = useState({
    level: 12,
    xp: 2450,
    xpToNext: 3000,
    streak: 7,
    completedModules: 8,
    totalModules: 15,
    achievements: ['First Steps', 'Quiz Master', 'Eco Warrior']
  });

  const [particles, setParticles] = useState<Array<{id: number, x: number, y: number, delay: number}>>([]);

  useEffect(() => {
    const newParticles = Array.from({length: 20}, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 6
    }));
    setParticles(newParticles);
  }, []);

  const xpPercentage = (userStats.xp / userStats.xpToNext) * 100;
  const moduleProgress = (userStats.completedModules / userStats.totalModules) * 100;

  return (
    <RoleGuard role="CITIZEN">
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
        {/* Floating Particles */}
        <div className="particles">
          {particles.map(p => (
            <div
              key={p.id}
              className="particle"
              style={{ left: `${p.x}%`, top: `${p.y}%`, animationDelay: `${p.delay}s` }}
            />
          ))}
        </div>

        <div className="relative z-10 p-6 space-y-8">
          {/* Header with Stats */}
          <div className="slide-in-up">
            <div className="game-card p-8">
              <div className="flex flex-col lg:flex-row items-center justify-between space-y-6 lg:space-y-0">
                <div className="text-center lg:text-left">
                  <h1 className="text-4xl font-bold text-white mb-2">
                    Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">Eco Champion!</span>
                  </h1>
                  <p className="text-gray-300 text-lg">Ready to level up your environmental impact? 🌱</p>
                </div>
                <div className="flex items-center space-x-6">
                  <div className="text-center">
                    <div className="level-badge text-xl px-4 py-2">Level {userStats.level}</div>
                  </div>
                  <div className="streak-counter">🔥 {userStats.streak} Day Streak</div>
                </div>
              </div>

              {/* XP Bar */}
              <div className="mt-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-white font-semibold">Experience Points</span>
                  <span className="text-purple-300">{userStats.xp} / {userStats.xpToNext} XP</span>
                </div>
                <div className="xp-bar">
                  <div className="xp-fill" style={{ width: `${xpPercentage}%` }} />
                </div>
              </div>

              {/* Achievements */}
              <div className="mt-6">
                <h3 className="text-white font-semibold mb-3">Recent Achievements</h3>
                <div className="flex flex-wrap gap-2">
                  {userStats.achievements.map((a, i) => (
                    <div key={i} className="achievement-badge">🏆 {a}</div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 slide-in-left">
            <div className="game-card p-6 text-center">
              <div className="text-4xl mb-3">📚</div>
              <div className="text-2xl font-bold text-white mb-1">{userStats.completedModules}/{userStats.totalModules}</div>
              <div className="text-gray-300">Modules Completed</div>
              <div className="mt-3 w-full bg-slate-700 rounded-full h-2">
                <div className="bg-gradient-to-r from-green-400 to-blue-500 h-2 rounded-full transition-all duration-1000" style={{ width: `${moduleProgress}%` }} />
              </div>
            </div>

            <div className="game-card p-6 text-center">
              <div className="text-4xl mb-3">⚡</div>
              <div className="text-2xl font-bold text-white mb-1">{userStats.xp}</div>
              <div className="text-gray-300">Total XP Earned</div>
              <div className="mt-3 text-sm text-purple-300">+150 XP today!</div>
            </div>

            <div className="game-card p-6 text-center">
              <div className="text-4xl mb-3">🎯</div>
              <div className="text-2xl font-bold text-white mb-1">87%</div>
              <div className="text-gray-300">Quiz Accuracy</div>
              <div className="mt-3 text-sm text-green-300">Excellent performance!</div>
            </div>
          </div>

          {/* Main Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 slide-in-right">
            <div
              className="game-card p-8 cursor-pointer group hover:scale-105 transition-all duration-500"
              onClick={() => router.push('/auth/dashboard/citizen/training')}
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-3xl font-bold text-white mb-2">🎮 Training Quest</h2>
                  <p className="text-gray-300">Continue your learning adventure</p>
                </div>
                <div className="text-6xl group-hover:scale-110 transition-transform duration-300">🚀</div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-white">Progress</span>
                  <span className="text-purple-300">{moduleProgress.toFixed(0)}%</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-3">
                  <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full transition-all duration-1000" style={{ width: `${moduleProgress}%` }} />
                </div>
                <div className="text-sm text-gray-400">{userStats.totalModules - userStats.completedModules} modules remaining</div>
              </div>

              <div className="mt-6">
                <button className="game-button w-full py-4 text-lg font-bold">
                  Continue Learning Journey →
                </button>
              </div>
            </div>

            <div className="game-card p-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-3xl font-bold text-white mb-2">⚔️ Daily Challenges</h2>
                  <p className="text-gray-300">Complete today's missions</p>
                </div>
                <div className="text-6xl">🎯</div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl border border-green-500/30">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">✓</div>
                    <span className="text-white">Complete 1 Quiz</span>
                  </div>
                  <div className="text-green-400 font-bold">+50 XP</div>
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl border border-yellow-500/30">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">2/3</div>
                    <span className="text-white">Watch 3 Videos</span>
                  </div>
                  <div className="text-yellow-400 font-bold">+30 XP</div>
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl border border-purple-500/30">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-slate-600 rounded-full flex items-center justify-center">0/5</div>
                    <span className="text-white">Review 5 Flashcards</span>
                  </div>
                  <div className="text-purple-400 font-bold">+25 XP</div>
                </div>
              </div>

              <div className="mt-6">
                <button 
                  className="game-button-secondary w-full py-4 text-lg font-bold"
                  onClick={() => router.push('/auth/dashboard/citizen/training')}
                >
                  Start Challenges 🎮
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </RoleGuard>
  );
}

