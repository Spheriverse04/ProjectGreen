import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { SupabaseModule } from './supabase/supabase.module';
import { TrainingModule } from './training/training.module';
import { CivicReportModule } from './civic-report/civic-report.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }), // make process.env available via ConfigService
    PrismaModule,
    UserModule,
    AuthModule,
    SupabaseModule,
    TrainingModule,
    CivicReportModule,
  ],
})
export class AppModule {}

