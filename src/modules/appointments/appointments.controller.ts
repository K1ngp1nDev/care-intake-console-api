import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AppointmentsQueryDto } from './dto/appointments-query.dto';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { AppointmentsService } from './appointments.service';

@ApiTags('appointments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('appointments')
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Get()
  @ApiOperation({ summary: 'List appointments with optional date/status filters' })
  listAppointments(@Query() query: AppointmentsQueryDto) {
    return {
      data: this.appointmentsService.listAppointments(query),
    };
  }

  @Post()
  @ApiOperation({ summary: 'Create an appointment' })
  createAppointment(@Body() dto: CreateAppointmentDto) {
    return {
      data: this.appointmentsService.createAppointment(dto),
    };
  }
}
