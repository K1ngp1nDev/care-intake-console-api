import { Injectable, NotFoundException } from '@nestjs/common';
import { AuditLogService } from '../audit-log/audit-log.service';
import { ClinicStoreService } from '../common/store/clinic-store.service';
import { AppointmentsQueryDto } from './dto/appointments-query.dto';
import { CreateAppointmentDto } from './dto/create-appointment.dto';

@Injectable()
export class AppointmentsService {
  constructor(
    private readonly store: ClinicStoreService,
    private readonly auditLog: AuditLogService,
  ) {}

  listAppointments(query: AppointmentsQueryDto) {
    return this.store.listAppointments({
      date: query.date,
      status: query.status,
    });
  }

  createAppointment(dto: CreateAppointmentDto) {
    const patient = this.store.findPatient(dto.patientId);
    if (!patient) {
      throw new NotFoundException('Patient not found.');
    }

    const appointment = this.store.createAppointment({
      patientId: dto.patientId,
      scheduledFor: dto.scheduledFor,
      visitType: dto.visitType,
      clinician: dto.clinician,
      location: dto.location,
      status: dto.status ?? 'scheduled',
      urgency: this.store.nextUrgencyFromNotes(dto.visitType),
    });

    this.auditLog.record('appointment', appointment.id, 'created', 'coordinator', {
      patientId: dto.patientId,
    });

    return appointment;
  }
}
