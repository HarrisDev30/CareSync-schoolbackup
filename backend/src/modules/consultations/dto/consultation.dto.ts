import {
  IsUUID,
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsEnum,
  Min,
  Max,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CorrectionReason } from '../../../common/constants/enums';

export class VitalSignsDto {
  @ApiPropertyOptional({ example: 120 })
  @IsOptional()
  @IsNumber()
  @Min(40, { message: 'Systolic blood pressure cannot be below 40 mmHg' })
  @Max(300, { message: 'Systolic blood pressure cannot exceed 300 mmHg' })
  bloodPressureSystolic?: number;

  @ApiPropertyOptional({ example: 80 })
  @IsOptional()
  @IsNumber()
  @Min(20, { message: 'Diastolic blood pressure cannot be below 20 mmHg' })
  @Max(200, { message: 'Diastolic blood pressure cannot exceed 200 mmHg' })
  bloodPressureDiastolic?: number;

  @ApiPropertyOptional({ example: 72 })
  @IsOptional()
  @IsNumber()
  @Min(20, { message: 'Heart rate cannot be below 20 bpm' })
  @Max(300, { message: 'Heart rate cannot exceed 300 bpm' })
  heartRate?: number;

  @ApiPropertyOptional({ example: 16 })
  @IsOptional()
  @IsNumber()
  @Min(4, { message: 'Respiratory rate cannot be below 4 breaths/min' })
  @Max(80, { message: 'Respiratory rate cannot exceed 80 breaths/min' })
  respiratoryRate?: number;

  @ApiPropertyOptional({ example: 36.8 })
  @IsOptional()
  @IsNumber()
  @Min(25.0, { message: 'Temperature cannot be below 25.0°C' })
  @Max(45.0, { message: 'Temperature cannot exceed 45.0°C' })
  temperatureCelsius?: number;

  @ApiPropertyOptional({ example: 98 })
  @IsOptional()
  @IsNumber()
  @Min(50, { message: 'Oxygen saturation cannot be below 50%' })
  @Max(100, { message: 'Oxygen saturation cannot exceed 100%' })
  oxygenSaturation?: number;
}

export class CreateConsultationDto {
  @ApiProperty({ example: 'e4f5a6b7-8901-2345-6789-0123456789ab' })
  @IsUUID()
  patientId: string;

  @ApiPropertyOptional({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  @IsOptional()
  @IsUUID()
  appointmentId?: string;

  @ApiProperty({ example: 'Shortness of breath and fever for 3 days' })
  @IsString()
  @IsNotEmpty()
  chiefComplaint: string;

  @ApiPropertyOptional({ type: VitalSignsDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => VitalSignsDto)
  vitalSigns?: VitalSignsDto;

  @ApiProperty({ example: 'Community-acquired pneumonia' })
  @IsString()
  @IsNotEmpty()
  primaryDiagnosisDescription: string;

  @ApiPropertyOptional({ example: 'J18.9' })
  @IsOptional()
  @IsString()
  primaryDiagnosisCode?: string;

  @ApiProperty({ example: 'Amoxicillin 500mg TID for 7 days, chest X-ray follow-up' })
  @IsString()
  @IsNotEmpty()
  treatmentPlan: string;
}

export class UpdateConsultationDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  chiefComplaint?: string;

  @ApiPropertyOptional({ type: VitalSignsDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => VitalSignsDto)
  vitalSigns?: VitalSignsDto;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  primaryDiagnosisDescription?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  primaryDiagnosisCode?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  treatmentPlan?: string;
}

export class CreateCorrectionDto {
  @ApiProperty({ enum: CorrectionReason, example: CorrectionReason.DIAGNOSTIC_REVISION })
  @IsEnum(CorrectionReason)
  reason: CorrectionReason;

  @ApiPropertyOptional({ example: 'Sputum culture confirmed bacterial etiology' })
  @IsOptional()
  @IsString()
  justificationNotes?: string;

  @ApiProperty({ example: 'primaryDiagnosisDescription' })
  @IsString()
  @IsNotEmpty()
  fieldModified: string;

  @ApiProperty({ example: 'Bacterial lobar pneumonia' })
  @IsString()
  @IsNotEmpty()
  correctedValue: string;
}

