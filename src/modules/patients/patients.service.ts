import { Injectable } from '@nestjs/common';
import { AuditLogService } from '../audit-log/audit-log.service';
import { ClinicStoreService } from '../common/store/clinic-store.service';
import { CreatePatientDto } from './dto/create-patient.dto';

@Injectable()
export class PatientsService {
  constructor(
    private readonly store: ClinicStoreService,
    private readonly auditLog: AuditLogService,
  ) {}

  listPatients() {
    return this.store.listPatients();
  }

  createPatient(dto: CreatePatientDto) {
    const patient = this.store.createPatient({
      fullName: dto.fullName,
      dateOfBirth: dto.dateOfBirth,
      phone: dto.phone,
      email: dto.email,
      tags: dto.tags ?? [],
    });

    this.auditLog.record('patient', patient.id, 'created', 'coordinator', {
      fullName: patient.fullName,
    });

    return patient;
  }
}
