import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import {
  HospitalCensusResponseDto,
  HospitalMetricsResponseDto,
  DiagnosticTatResponseDto,
  DoctorWorkloadItemDto,
} from './dto/analytics.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/constants/enums';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';

@ApiTags('Hospital Analytics & Census Telemetry')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('census')
  @Roles(
    UserRole.ADMINISTRATOR,
    UserRole.PHYSICIAN,
    UserRole.RECEPTIONIST,
    UserRole.LABORATORY_USER,
  )
  @ApiOperation({ summary: 'Get real-time hospital bed and examination room census' })
  @ApiResponse({
    status: 200,
    description: 'Room occupancy and department census retrieved successfully',
    type: HospitalCensusResponseDto,
  })
  async getCensus() {
    const data = await this.analyticsService.getCensus();
    return {
      statusCode: 200,
      message: 'Hospital census retrieved successfully',
      data,
    };
  }

  @Get('metrics')
  @Roles(
    UserRole.ADMINISTRATOR,
    UserRole.PHYSICIAN,
    UserRole.RECEPTIONIST,
    UserRole.LABORATORY_USER,
  )
  @ApiOperation({ summary: 'Get overall hospital throughput and flow metrics' })
  @ApiResponse({
    status: 200,
    description: 'Hospital throughput metrics retrieved successfully',
    type: HospitalMetricsResponseDto,
  })
  async getMetrics() {
    const data = await this.analyticsService.getMetrics();
    return {
      statusCode: 200,
      message: 'Hospital metrics retrieved successfully',
      data,
    };
  }

  @Get('diagnostic-tat')
  @Roles(
    UserRole.ADMINISTRATOR,
    UserRole.PHYSICIAN,
    UserRole.LABORATORY_USER,
  )
  @ApiOperation({ summary: 'Get Diagnostic Turnaround Time (TAT) and category volume' })
  @ApiResponse({
    status: 200,
    description: 'Diagnostic turnaround benchmarks retrieved successfully',
    type: DiagnosticTatResponseDto,
  })
  async getDiagnosticTat() {
    const data = await this.analyticsService.getDiagnosticTat();
    return {
      statusCode: 200,
      message: 'Diagnostic TAT metrics retrieved successfully',
      data,
    };
  }

  @Get('doctor-workload')
  @Roles(UserRole.ADMINISTRATOR, UserRole.PHYSICIAN)
  @ApiOperation({ summary: 'Get physician consultation workload and average durations' })
  @ApiResponse({
    status: 200,
    description: 'Physician workload metrics retrieved successfully',
    type: [DoctorWorkloadItemDto],
  })
  async getDoctorWorkload() {
    const data = await this.analyticsService.getDoctorWorkload();
    return {
      statusCode: 200,
      message: 'Doctor workload metrics retrieved successfully',
      data,
    };
  }
}

