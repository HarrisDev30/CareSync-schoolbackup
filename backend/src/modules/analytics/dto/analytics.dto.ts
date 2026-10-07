import { ApiProperty } from '@nestjs/swagger';

export class WingCensusDto {
  @ApiProperty({ example: 'Outpatient Clinic' })
  name: string;

  @ApiProperty({ example: 4 })
  total: number;

  @ApiProperty({ example: 2 })
  inUse: number;

  @ApiProperty({ example: 1 })
  available: number;

  @ApiProperty({ example: 1 })
  sanitizing: number;

  @ApiProperty({ example: 0 })
  statEmergency: number;

  @ApiProperty({ example: 50.0 })
  occupancyRate: number;
}

export class HospitalCensusResponseDto {
  @ApiProperty({ example: 11 })
  totalRooms: number;

  @ApiProperty({ example: 6 })
  inUseCount: number;

  @ApiProperty({ example: 4 })
  availableCount: number;

  @ApiProperty({ example: 1 })
  sanitizingCount: number;

  @ApiProperty({ example: 1 })
  statEmergencyCount: number;

  @ApiProperty({ example: 54.5 })
  occupancyRatePercent: number;

  @ApiProperty({ type: [WingCensusDto] })
  wings: WingCensusDto[];
}

export class HospitalMetricsResponseDto {
  @ApiProperty({ example: 14 })
  todayPatientIntake: number;

  @ApiProperty({ example: 128 })
  totalRegisteredPatients: number;

  @ApiProperty({ example: 4 })
  activeWaitingQueue: number;

  @ApiProperty({ example: 3 })
  inConsultationCount: number;

  @ApiProperty({ example: 7 })
  completedConsultationsToday: number;

  @ApiProperty({ example: 2 })
  criticalLabAlertsCount: number;

  @ApiProperty({ example: 22.4 })
  averageConsultationDurationMinutes: number;
}

export class DiagnosticTatResponseDto {
  @ApiProperty({ example: 24.6 })
  overallMeanTatMinutes: number;

  @ApiProperty({ example: 11.2 })
  statEmergencyMeanTatMinutes: number;

  @ApiProperty({ example: 38.0 })
  routineMeanTatMinutes: number;

  @ApiProperty({ example: 45 })
  totalOrdersCount: number;

  @ApiProperty({ example: 38 })
  verifiedOrdersCount: number;

  @ApiProperty({ example: 96.2 })
  targetComplianceRatePercent: number;

  @ApiProperty({
    example: {
      'Clinical Chemistry': 26,
      Hematology: 18,
      'Cardiac Biomarkers': 9,
      Coagulation: 6,
    },
  })
  volumeByCategory: Record<string, number>;
}

export class DoctorWorkloadItemDto {
  @ApiProperty({ example: 'u-1' })
  physicianId: string;

  @ApiProperty({ example: 'Dr. Sarah Chen, MD' })
  physicianName: string;

  @ApiProperty({ example: 'Outpatient Clinic' })
  department: string;

  @ApiProperty({ example: 'General Practice & Internal Med' })
  specialty: string;

  @ApiProperty({ example: 8 })
  completedConsultations: number;

  @ApiProperty({ example: 2 })
  activeConsultations: number;

  @ApiProperty({ example: 21.5 })
  averageDurationMinutes: number;
}

