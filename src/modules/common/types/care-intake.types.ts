export type ReviewStatus = 'pending' | 'accepted' | 'edited' | 'rejected';
export type Urgency = 'routine' | 'soon' | 'urgent';
export type AppointmentStatus =
  | 'scheduled'
  | 'checked_in'
  | 'triaged'
  | 'follow_up';

export interface SourceRef {
  id: string;
  label: string;
  start?: number;
  end?: number;
}

export interface AiSuggestion {
  summary: string;
  reasoningSnippet: string;
  confidence: number;
  sourceRefs: SourceRef[];
  reviewStatus: ReviewStatus;
}

export interface DemoUser {
  id: number;
  name: string;
  email: string;
  password: string;
}

export interface PatientRecord {
  id: number;
  fullName: string;
  dateOfBirth: string;
  phone: string;
  email: string;
  tags: string[];
  createdAt: string;
}

export interface AppointmentRecord {
  id: number;
  patientId: number;
  scheduledFor: string;
  visitType: string;
  clinician: string;
  location: string;
  status: AppointmentStatus;
  urgency: Urgency;
  createdAt: string;
}

export interface IntakeRecord {
  id: number;
  patientId: number;
  appointmentId: number;
  symptoms: string[];
  notes: string;
  answers: Record<string, string>;
  createdAt: string;
}

export interface TriageSuggestionRecord extends AiSuggestion {
  id: number;
  patientId: number;
  appointmentId: number;
  intakeId: number;
  urgency: Urgency;
  missingInfoChecklist: string[];
  followUpQuestions: string[];
  visitPrepChecklist: string[];
  clinicianSummary?: string;
  clinicianNote?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FollowUpTaskRecord {
  id: number;
  patientId: number;
  appointmentId: number;
  triageId: number;
  title: string;
  dueDate: string;
  status: 'todo' | 'done';
  owner: string;
}

export interface AuditEventRecord {
  id: number;
  entityType: string;
  entityId: number;
  action: string;
  actor: string;
  createdAt: string;
  payload: Record<string, unknown>;
}

export interface CareIntakeState {
  users: DemoUser[];
  patients: PatientRecord[];
  appointments: AppointmentRecord[];
  intakes: IntakeRecord[];
  triageSuggestions: TriageSuggestionRecord[];
  followUpTasks: FollowUpTaskRecord[];
  auditEvents: AuditEventRecord[];
}
