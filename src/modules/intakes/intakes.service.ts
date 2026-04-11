import { Injectable } from '@nestjs/common';
import { AuditLogService } from '../audit-log/audit-log.service';
import { ClinicStoreService } from '../common/store/clinic-store.service';
import { CreateIntakeDto } from './dto/create-intake.dto';

@Injectable()
export class IntakesService {
  constructor(
    private readonly store: ClinicStoreService,
    private readonly auditLog: AuditLogService,
  ) {}

  createIntake(dto: CreateIntakeDto) {
    const intake = this.store.createIntake({
      patientId: dto.patientId,
      appointmentId: dto.appointmentId,
      symptoms: dto.symptoms,
      notes: dto.notes,
      answers: dto.answers,
    });

    this.store.updateAppointmentStatus(dto.appointmentId, 'checked_in');
    this.auditLog.record('intake', intake.id, 'created', 'front-desk', {
      appointmentId: dto.appointmentId,
    });

    return intake;
  }
}
