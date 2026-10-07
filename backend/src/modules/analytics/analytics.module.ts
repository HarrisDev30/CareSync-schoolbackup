import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnalyticsService } from './analytics.service';
import { AnalyticsController } from './analytics.controller';
import { Patient } from '../patients/entities/patient.entity';
import { Appointment } from '../appointments/entities/appointment.entity';
import { Consultation } from '../consultations/entities/consultation.entity';
import { DiagnosticOrder } from '../diagnostics/entities/diagnostic-order.entity';
import { DiagnosticResult } from '../diagnostics/entities/diagnostic-result.entity';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Patient,
      Appointment,
      Consultation,
      DiagnosticOrder,
      DiagnosticResult,
      User,
    ]),
  ],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}

