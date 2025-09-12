import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Role, QuestionType } from '@prisma/client';

@Injectable()
export class TrainingService {
  constructor(private prisma: PrismaService) {}

  // ------------------ MODULES ------------------
  async createModule(title: string, role: Role) {
    return this.prisma.trainingModule.create({ data: { title, role } });
  }

  async getModules(role?: Role, userId?: string) {
    const modules = await this.prisma.trainingModule.findMany({
      where: role ? { role } : {},
      include: {
        flashcards: true,
        videos: true,
        quizzes: { include: { questions: { include: { options: true } } } },
        userProgress: userId ? { where: { userId } } : undefined,
      },
    });

    if (userId) {
      return modules.map((module) => {
        const progress = module.userProgress?.[0];
        return {
          ...module,
          userProgress: progress ? [progress] : [],
        };
      });
    }
    return modules;
  }

  async getModuleById(id: string, userId?: string) {
    const module = await this.prisma.trainingModule.findUnique({
      where: { id },
      include: {
        flashcards: true,
        videos: true,
        quizzes: { include: { questions: { include: { options: true } } } },
        userProgress: userId ? { where: { userId } } : undefined,
      },
    });

    if (!module) return null;

    if (userId) {
      const progress = module.userProgress?.[0];
      return {
        ...module,
        userProgress: progress ? [progress] : [],
      };
    }

    return module;
  }

  async deleteModule(id: string) {
    return this.prisma.trainingModule.delete({ where: { id } });
  }

  // ------------------ USER PROGRESS ------------------
  async getUserProgress(userId: string) {
    const modules = await this.prisma.trainingModule.findMany({
      include: {
        userProgress: { where: { userId } },
      },
    });

    const completedModules = modules.filter(m => m.userProgress?.[0]?.completed).length;
    const totalModules = modules.length;

    const xp = modules.reduce(
      (acc, m) => acc + (m.userProgress?.[0]?.xpEarned || 0),
      0
    );

    const level = Math.floor(xp / 100); // 100 XP = level up
    const xpToNext = 100 - (xp % 100);

    return {
      level,
      xp,
      xpToNext,
      completedModules,
      totalModules,
      streak: 0,
      achievements: [],
    };
  }

  async upsertModuleProgress(
    userId: string,
    moduleId: string,
    completed = false,
    xpEarned = 0,
  ) {
    return this.prisma.userModuleProgress.upsert({
      where: { userId_moduleId: { userId, moduleId } },
      update: { completed, xpEarned, completedAt: completed ? new Date() : null },
      create: { userId, moduleId, completed, xpEarned, completedAt: completed ? new Date() : null },
    });
  }

async recordProgress(
  userId: string,
  moduleId: string,
  type: string,
  itemId: string,
  status: string,
  xp: number,
  score?: number,
) {
  switch (type) {
    case 'MODULE':
      return this.upsertModuleProgress(userId, moduleId, status === 'COMPLETED', xp);

    case 'FLASHCARD':
      return this.prisma.userFlashcardProgress.upsert({
        where: { userId_flashcardId: { userId, flashcardId: itemId } },
        update: {
          mastered: status === 'MASTERED',
          xpEarned: xp,
          completedAt: status === 'MASTERED' ? new Date() : null,
        },
        create: {
          userId,
          flashcardId: itemId,
          mastered: status === 'MASTERED',
          xpEarned: xp,
          completedAt: status === 'MASTERED' ? new Date() : null,
        },
      });

    case 'VIDEO':
      return this.prisma.userVideoProgress.upsert({
        where: { userId_videoId: { userId, videoId: itemId } },
        update: {
          watched: status === 'COMPLETED', // ✅ fixed
          xpEarned: xp,
          completedAt: status === 'COMPLETED' ? new Date() : null,
        },
        create: {
          userId,
          videoId: itemId,
          watched: status === 'COMPLETED', // ✅ fixed
          xpEarned: xp,
          completedAt: status === 'COMPLETED' ? new Date() : null,
        },
      });

    case 'QUIZ':
      return this.prisma.userQuizProgress.upsert({
        where: { userId_quizId: { userId, quizId: itemId } },
        update: {
          score: status === 'COMPLETED' ? score ?? 0 : null, // ✅ fixed
          xpEarned: xp,
          completedAt: status === 'COMPLETED' ? new Date() : null,
        },
        create: {
          userId,
          quizId: itemId,
          score: status === 'COMPLETED' ? score ?? 0 : null,
          xpEarned: xp,
          completedAt: status === 'COMPLETED' ? new Date() : null,
        },
      });

    default:
      throw new Error(`Unsupported progress type: ${type}`);
  }
}


  // ------------------ FLASHCARDS ------------------
  async addFlashcard(moduleId: string, question: string, answer: string) {
    return this.prisma.flashcard.create({ data: { moduleId, question, answer } });
  }

  async updateFlashcard(id: string, question: string, answer: string) {
    return this.prisma.flashcard.update({ where: { id }, data: { question, answer } });
  }

  async deleteFlashcard(id: string) {
    return this.prisma.flashcard.delete({ where: { id } });
  }

  // ------------------ VIDEOS ------------------
  async addVideo(moduleId: string, title: string, url: string) {
    return this.prisma.video.create({ data: { moduleId, title, url } });
  }

  async updateVideo(id: string, title: string, url: string) {
    return this.prisma.video.update({ where: { id }, data: { title, url } });
  }

  async deleteVideo(id: string) {
    return this.prisma.video.delete({ where: { id } });
  }

  // ------------------ QUIZZES ------------------
  async addQuiz(moduleId: string, title: string) {
    return this.prisma.quiz.create({ data: { moduleId, title } });
  }

  async deleteQuiz(id: string) {
    return this.prisma.quiz.delete({ where: { id } });
  }

  // ------------------ QUIZ QUESTIONS ------------------
  async addQuizQuestion(
    quizId: string,
    type: QuestionType,
    question: string,
    answer?: string,
    options?: { text: string; isCorrect: boolean }[],
  ) {
    const createdQuestion = await this.prisma.quizQuestion.create({
      data: { quizId, type, question, answer },
    });

    if (type === 'MCQ' && options?.length) {
      await this.prisma.quizOption.createMany({
        data: options.map(o => ({
          questionId: createdQuestion.id,
          text: o.text,
          isCorrect: o.isCorrect,
        })),
      });
    }

    return this.prisma.quizQuestion.findUnique({
      where: { id: createdQuestion.id },
      include: { options: true },
    });
  }

  async deleteQuizQuestion(id: string) {
    return this.prisma.quizQuestion.delete({ where: { id } });
  }

  // ------------------ QUIZ OPTIONS ------------------
  async addQuizOption(questionId: string, text: string, isCorrect: boolean) {
    return this.prisma.quizOption.create({ data: { questionId, text, isCorrect } });
  }

  async deleteQuizOption(id: string) {
    return this.prisma.quizOption.delete({ where: { id } });
  }
}

