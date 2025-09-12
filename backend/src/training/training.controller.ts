import { Controller, Post, Body, Get, Query, Delete, Param, Put, UseGuards } from '@nestjs/common';
import { TrainingService } from './training.service';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Role, QuestionType } from '@prisma/client';

@Controller('training')
export class TrainingController {
  constructor(private trainingService: TrainingService) {}

  // ------------------ MODULES ------------------

  // Create module - ADMIN only
  @Post('modules')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async createModule(@Body() dto: { title: string; role: Role }) {
    return this.trainingService.createModule(dto.title, dto.role);
  }

  // Get all modules - accessible by any authenticated user
  @Get('modules')
  @UseGuards(JwtAuthGuard)
  async getModules(@Query('role') role?: Role) {
    return this.trainingService.getModules(role);
  }

  // Delete module - ADMIN only
  @Delete('modules/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async deleteModule(@Param('id') id: string) {
    return this.trainingService.deleteModule(id);
  }

  // ------------------ FLASHCARDS ------------------

  @Post('flashcards')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async addFlashcard(@Body() dto: { moduleId: string; question: string; answer: string }) {
    return this.trainingService.addFlashcard(dto.moduleId, dto.question, dto.answer);
  }

  @Put('flashcards/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async updateFlashcard(@Param('id') id: string, @Body() dto: { question: string; answer: string }) {
    return this.trainingService.updateFlashcard(id, dto.question, dto.answer);
  }

  @Delete('flashcards/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async deleteFlashcard(@Param('id') id: string) {
    return this.trainingService.deleteFlashcard(id);
  }

  // ------------------ VIDEOS ------------------

  @Post('videos')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async addVideo(@Body() dto: { moduleId: string; title: string; url: string }) {
    return this.trainingService.addVideo(dto.moduleId, dto.title, dto.url);
  }

  @Put('videos/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async updateVideo(@Param('id') id: string, @Body() dto: { title: string; url: string }) {
    return this.trainingService.updateVideo(id, dto.title, dto.url);
  }

  @Delete('videos/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async deleteVideo(@Param('id') id: string) {
    return this.trainingService.deleteVideo(id);
  }

  // ------------------ QUIZZES ------------------

  @Post('quizzes')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async addQuiz(@Body() dto: { moduleId: string; title: string }) {
    return this.trainingService.addQuiz(dto.moduleId, dto.title);
  }

  @Delete('quizzes/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async deleteQuiz(@Param('id') id: string) {
    return this.trainingService.deleteQuiz(id);
  }

  // ------------------ QUIZ QUESTIONS ------------------

  @Post('questions')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async addQuizQuestion(@Body() dto: { quizId: string; type: QuestionType; question: string; answer?: string }) {
    return this.trainingService.addQuizQuestion(dto.quizId, dto.type, dto.question, dto.answer);
  }

  @Delete('questions/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async deleteQuizQuestion(@Param('id') id: string) {
    return this.trainingService.deleteQuizQuestion(id);
  }

  // ------------------ QUIZ OPTIONS ------------------

  @Post('options')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async addQuizOption(@Body() dto: { questionId: string; text: string; isCorrect: boolean }) {
    return this.trainingService.addQuizOption(dto.questionId, dto.text, dto.isCorrect);
  }

  @Delete('options/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async deleteQuizOption(@Param('id') id: string) {
    return this.trainingService.deleteQuizOption(id);
  }
}

