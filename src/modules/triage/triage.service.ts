import { Injectable, NotFoundException } from '@nestjs/common';
import { AuditLogService } from '../audit-log/audit-log.service';
import { ClinicStoreService } from '../common/store/clinic-store.service';
import { SourceRef, TriageSuggestionRecord } from '../common/types/care-intake.types';
import { SuggestTriageDto } from './dto/suggest-triage.dto';
import { UpdateTriageDecisionDto } from './dto/update-triage-decision.dto';

@Injectable()
export class TriageService {
  constructor(
    private readonly store: ClinicStoreService,
    private readonly auditLog: AuditLogService,
  ) {}

  list() {
    return this.store.listTriageSuggestions();
  }

  suggest(dto: SuggestTriageDto): TriageSuggestionRecord {
    const intake = this.store.getIntake(dto.intakeId);

    if (!intake) {
      throw new NotFoundException('Intake not found.');
    }

    const urgency = this.store.nextUrgencyFromNotes(intake.notes);
    const missingInfoChecklist = [
      intake.answers.duration ? null : 'Symptom duration',
      intake.answers.allergies ? null : 'Allergy history',
      intake.answers.medications ? null : 'Current medications',
    ].filter(Boolean) as string[];

    const followUpQuestions =
      urgency === 'urgent'
        ? [
            'Is the patient short of breath at rest?',
            'Any chest pain, fainting, or confusion?',
          ]
        : [
            'Has the symptom severity changed since yesterday?',
            'Any fever or oxygen saturation changes?',
          ];

    const visitPrepChecklist =
      urgency === 'urgent'
        ? ['Move patient to rapid triage slot', 'Confirm emergency contact']
        : ['Verify insurance', 'Prepare medication reconciliation'];

    const sourceRefs: SourceRef[] = [
      { id: `intake:${intake.id}:notes`, label: 'Symptom notes' },
      ...Object.keys(intake.answers).map((key) => ({
        id: `intake:${intake.id}:${key}`,
        label: key,
      })),
    ];

    const suggestion = this.store.createTriageSuggestion({
      patientId: intake.patientId,
      appointmentId: intake.appointmentId,
      intakeId: intake.id,
      urgency,
      summary:
        urgency === 'urgent'
          ? 'Red-flag phrasing detected; keep patient in same-day queue and confirm escalation path.'
          : urgency === 'soon'
            ? 'Symptoms should be seen promptly in outpatient flow, but no automatic emergency escalation is suggested.'
            : 'Current intake reads as routine and appropriate for the scheduled workflow.',
      reasoningSnippet:
        urgency === 'urgent'
          ? 'Escalated because symptom notes contain emergency-adjacent language.'
          : urgency === 'soon'
            ? 'Escalated to "soon" because notes mention persistent or worsening symptoms.'
            : 'No high-risk terms were found in the intake notes.',
      confidence: urgency === 'urgent' ? 0.89 : urgency === 'soon' ? 0.83 : 0.72,
      sourceRefs,
      reviewStatus: 'pending',
      missingInfoChecklist,
      followUpQuestions,
      visitPrepChecklist,
    });

    this.store.updateAppointmentStatus(intake.appointmentId, 'triaged');
    this.auditLog.record('triage', suggestion.id, 'suggested', 'ai-assistant', {
      urgency,
      intakeId: intake.id,
    });

    return suggestion;
  }

  updateDecision(id: number, dto: UpdateTriageDecisionDto) {
    const updated = this.store.updateTriageSuggestion(id, {
      reviewStatus: dto.reviewStatus,
      clinicianSummary: dto.clinicianSummary,
      clinicianNote: dto.clinicianNote,
      summary: dto.clinicianSummary || undefined,
    });

    this.auditLog.record('triage', id, 'decision_updated', 'clinician', {
      reviewStatus: dto.reviewStatus,
    });

    return updated;
  }
}
