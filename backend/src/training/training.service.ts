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

  async getModules(role?: Role) {
    return this.prisma.trainingModule.findMany({
      where: role ? { role } : {},
      include: { flashcards: true, videos: true, quizzes: { include: { questions: true } } },
    });
  }

  async deleteModule(id: string) {
    return this.prisma.trainingModule.delete({ where: { id } });
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
  async addQuizQuestion(quizId: string, type: QuestionType, question: string, answer?: string) {
    return this.prisma.quizQuestion.create({ data: { quizId, type, question, answer } });
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

