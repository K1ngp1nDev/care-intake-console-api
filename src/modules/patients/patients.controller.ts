import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreatePatientDto } from './dto/create-patient.dto';
import { PatientsService } from './patients.service';

@ApiTags('patients')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('patients')
export class PatientsController {
  constructor(private readonly patientsService: PatientsService) {}

  @Get()
  @ApiOperation({ summary: 'List synthetic patients' })
  listPatients() {
    return {
      data: this.patientsService.listPatients(),
    };
  }

  @Post()
  @ApiOperation({ summary: 'Create a patient record' })
  createPatient(@Body() dto: CreatePatientDto) {
    return {
      data: this.patientsService.createPatient(dto),
    };
  }
}
