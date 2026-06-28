import { Injectable } from '@nestjs/common';
import { ClinicStoreService } from '../common/store/clinic-store.service';

@Injectable()
export class AuditLogService {
  constructor(private readonly store: ClinicStoreService) {}

  record(
    entityType: string,
    entityId: number,
    action: string,
    actor: string,
    payload: Record<string, unknown> = {},
  ) {
    return this.store.recordAudit({
      entityType,
      entityId,
      action,
      actor,
      payload,
    });
  }

  /** Synthesized operational activity feed derived from the in-memory store. */
  feed(limit = 50) {
    const patients = new Map(this.store.listPatients().map((p) => [p.id, p.fullName]));
    const name = (id: number) => patients.get(id) ?? `Patient #${id}`;
    const events: Array<{
      id: string;
      type: string;
      title: string;
      detail: string;
      severity: string;
      at: string;
    }> = [];

    for (const p of this.store.listPatients()) {
      events.push({
        id: `patient-${p.id}`,
        type: 'patient',
        title: 'Patient registered',
        detail: `${p.fullName} added to the directory`,
        severity: 'info',
        at: p.createdAt,
      });
    }
    for (const a of this.store.listAppointments()) {
      events.push({
        id: `appt-${a.id}`,
        type: 'appointment',
        title: `Appointment ${a.status.replace('_', ' ')}`,
        detail: `${name(a.patientId)} · ${a.visitType} · ${a.clinician}`,
        severity: a.urgency === 'urgent' ? 'warning' : 'info',
        at: a.createdAt,
      });
    }
    for (const i of this.store.listIntakes()) {
      events.push({
        id: `intake-${i.id}`,
        type: 'intake',
        title: 'Intake submitted',
        detail: `${name(i.patientId)} · ${i.symptoms.slice(0, 3).join(', ')}`,
        severity: 'info',
        at: i.createdAt,
      });
    }
    for (const t of this.store.listTriageSuggestions()) {
      events.push({
        id: `triage-${t.id}`,
        type: 'triage',
        title: 'Triage suggestion generated',
        detail: `${name(t.patientId)} · ${t.urgency} · ${Math.round(t.confidence * 100)}% confidence`,
        severity: t.urgency === 'urgent' ? 'warning' : 'info',
        at: t.createdAt,
      });
      if (t.reviewStatus !== 'pending') {
        events.push({
          id: `triage-review-${t.id}`,
          type: 'triage',
          title: `Triage ${t.reviewStatus}`,
          detail: `${name(t.patientId)} · reviewed by clinician`,
          severity: t.reviewStatus === 'rejected' ? 'warning' : 'success',
          at: t.updatedAt,
        });
      }
    }
    for (const f of this.store.listFollowUpTasks()) {
      if (f.status === 'done') {
        events.push({
          id: `followup-${f.id}`,
          type: 'followup',
          title: 'Follow-up completed',
          detail: `${name(f.patientId)} · ${f.title} (${f.owner})`,
          severity: 'success',
          at: f.dueDate,
        });
      }
    }

    return events.sort((a, b) => (a.at < b.at ? 1 : -1)).slice(0, limit);
  }
}
