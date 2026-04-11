import { Injectable, NotFoundException } from '@nestjs/common';
import { AuditLogService } from '../audit-log/audit-log.service';
import { ClinicStoreService } from '../common/store/clinic-store.service';
import { GenerateFollowUpsDto } from './dto/generate-followups.dto';

@Injectable()
export class FollowUpsService {
  constructor(
    private readonly store: ClinicStoreService,
    private readonly auditLog: AuditLogService,
  ) {}

  list() {
    return this.store.listFollowUpTasks();
  }

  generate(dto: GenerateFollowUpsDto) {
    const triage = this.store.getTriageSuggestion(dto.triageId);

    if (!triage) {
      throw new NotFoundException('Triage suggestion not found.');
    }

    const tasks = this.store.createFollowUpTasks(
      [
        ...triage.missingInfoChecklist.map((item) => ({
          patientId: triage.patientId,
          appointmentId: triage.appointmentId,
          triageId: triage.id,
          title: `Collect ${item.toLowerCase()}`,
          dueDate: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
          status: 'todo' as const,
          owner: 'Front desk',
        })),
        {
          patientId: triage.patientId,
          appointmentId: triage.appointmentId,
          triageId: triage.id,
          title:
            triage.urgency === 'urgent'
              ? 'Confirm rapid-slot escalation'
              : 'Confirm follow-up call before visit',
          dueDate: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
          status: 'todo' as const,
          owner: 'Care coordinator',
        },
      ].slice(0, 3),
    );

    this.store.updateAppointmentStatus(triage.appointmentId, 'follow_up');
    this.auditLog.record('followup', triage.id, 'generated', 'ai-assistant', {
      generatedCount: tasks.length,
    });

    return {
      triageId: triage.id,
      generatedCount: tasks.length,
      tasks,
    };
  }
}
