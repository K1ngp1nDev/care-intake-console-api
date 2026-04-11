import { Injectable } from '@nestjs/common';
import {
  AppointmentRecord,
  AppointmentStatus,
  AuditEventRecord,
  CareIntakeState,
  DemoUser,
  FollowUpTaskRecord,
  IntakeRecord,
  PatientRecord,
  TriageSuggestionRecord,
  Urgency,
} from '../types/care-intake.types';

@Injectable()
export class ClinicStoreService {
  private readonly state: CareIntakeState;

  private readonly sequence = {
    users: 2,
    patients: 3,
    appointments: 3,
    intakes: 2,
    triageSuggestions: 2,
    followUpTasks: 3,
    auditEvents: 4,
  };

  constructor() {
    const now = new Date();
    const plusHours = (hours: number) =>
      new Date(now.getTime() + hours * 60 * 60 * 1000).toISOString();
    const minusHours = (hours: number) =>
      new Date(now.getTime() - hours * 60 * 60 * 1000).toISOString();

    this.state = {
      users: [
        {
          id: 1,
          name: 'Demo Coordinator',
          email: 'demo@careintake.test',
          password: 'password',
        },
      ],
      patients: [
        {
          id: 1,
          fullName: 'Mara Levin',
          dateOfBirth: '1991-06-03',
          phone: '+1 415 555 1102',
          email: 'mara.levin@example.test',
          tags: ['follow-up due'],
          createdAt: minusHours(72),
        },
        {
          id: 2,
          fullName: 'Jordan Ortega',
          dateOfBirth: '1984-11-12',
          phone: '+1 415 555 0144',
          email: 'jordan.ortega@example.test',
          tags: ['new patient'],
          createdAt: minusHours(36),
        },
      ],
      appointments: [
        {
          id: 1,
          patientId: 1,
          scheduledFor: plusHours(2),
          visitType: 'Primary care follow-up',
          clinician: 'Dr. Patel',
          location: 'Room 3A',
          status: 'triaged',
          urgency: 'soon',
          createdAt: minusHours(4),
        },
        {
          id: 2,
          patientId: 2,
          scheduledFor: plusHours(5),
          visitType: 'Same-day evaluation',
          clinician: 'Dr. Huang',
          location: 'Room 2C',
          status: 'scheduled',
          urgency: 'urgent',
          createdAt: minusHours(2),
        },
      ],
      intakes: [
        {
          id: 1,
          patientId: 1,
          appointmentId: 1,
          symptoms: ['persistent cough', 'fatigue'],
          notes:
            'Cough has lasted for 10 days and is worsening in the evenings. No chest pain.',
          answers: {
            duration: '10 days',
            allergies: 'none reported',
            medications: 'ibuprofen',
          },
          createdAt: minusHours(3),
        },
      ],
      triageSuggestions: [
        {
          id: 1,
          patientId: 1,
          appointmentId: 1,
          intakeId: 1,
          urgency: 'soon',
          summary:
            'Symptoms look appropriate for an expedited outpatient follow-up rather than emergent escalation.',
          reasoningSnippet:
            'Worsening cough over 10 days suggests follow-up within 24-48 hours; no emergency keywords detected.',
          confidence: 0.83,
          sourceRefs: [
            { id: 'intake:1:notes', label: 'Intake notes' },
            { id: 'intake:1:duration', label: 'Duration answer' },
          ],
          reviewStatus: 'pending',
          missingInfoChecklist: ['Smoking history', 'Recent travel'],
          followUpQuestions: [
            'Any fever in the last 24 hours?',
            'Any shortness of breath with activity?',
          ],
          visitPrepChecklist: [
            'Bring current medication list',
            'Capture pulse oximeter reading if available',
          ],
          createdAt: minusHours(3),
          updatedAt: minusHours(2),
        },
      ],
      followUpTasks: [
        {
          id: 1,
          patientId: 1,
          appointmentId: 1,
          triageId: 1,
          title: 'Confirm medication list before visit',
          dueDate: plusHours(1),
          status: 'todo',
          owner: 'Front desk',
        },
        {
          id: 2,
          patientId: 1,
          appointmentId: 1,
          triageId: 1,
          title: 'Collect smoking history at intake desk',
          dueDate: plusHours(1),
          status: 'todo',
          owner: 'MA',
        },
      ],
      auditEvents: [
        {
          id: 1,
          entityType: 'triage',
          entityId: 1,
          action: 'seeded',
          actor: 'system',
          createdAt: minusHours(2),
          payload: { urgency: 'soon' },
        },
      ],
    };
  }

  listUsers(): DemoUser[] {
    return [...this.state.users];
  }

  createUser(user: Omit<DemoUser, 'id'>): DemoUser {
    const record = { id: ++this.sequence.users, ...user };
    this.state.users.push(record);
    return record;
  }

  listPatients(): PatientRecord[] {
    return [...this.state.patients];
  }

  findPatient(id: number): PatientRecord | undefined {
    return this.state.patients.find((patient) => patient.id === id);
  }

  createPatient(patient: Omit<PatientRecord, 'id' | 'createdAt'>): PatientRecord {
    const record: PatientRecord = {
      id: ++this.sequence.patients,
      createdAt: new Date().toISOString(),
      ...patient,
    };
    this.state.patients.unshift(record);
    return record;
  }

  listAppointments(filters?: {
    date?: string;
    status?: AppointmentStatus;
  }): AppointmentRecord[] {
    return this.state.appointments.filter((appointment) => {
      if (filters?.date && !appointment.scheduledFor.startsWith(filters.date)) {
        return false;
      }
      if (filters?.status && appointment.status !== filters.status) {
        return false;
      }
      return true;
    });
  }

  createAppointment(
    appointment: Omit<AppointmentRecord, 'id' | 'createdAt'>,
  ): AppointmentRecord {
    const record: AppointmentRecord = {
      id: ++this.sequence.appointments,
      createdAt: new Date().toISOString(),
      ...appointment,
    };
    this.state.appointments.unshift(record);
    return record;
  }

  updateAppointmentStatus(id: number, status: AppointmentStatus): AppointmentRecord {
    const appointment = this.state.appointments.find((item) => item.id === id);
    if (!appointment) {
      throw new Error('Appointment not found');
    }
    appointment.status = status;
    return appointment;
  }

  getIntake(id: number): IntakeRecord | undefined {
    return this.state.intakes.find((intake) => intake.id === id);
  }

  createIntake(intake: Omit<IntakeRecord, 'id' | 'createdAt'>): IntakeRecord {
    const record: IntakeRecord = {
      id: ++this.sequence.intakes,
      createdAt: new Date().toISOString(),
      ...intake,
    };
    this.state.intakes.unshift(record);
    return record;
  }

  listTriageSuggestions(): TriageSuggestionRecord[] {
    return [...this.state.triageSuggestions];
  }

  getTriageSuggestion(id: number): TriageSuggestionRecord | undefined {
    return this.state.triageSuggestions.find((item) => item.id === id);
  }

  createTriageSuggestion(
    triageSuggestion: Omit<TriageSuggestionRecord, 'id' | 'createdAt' | 'updatedAt'>,
  ): TriageSuggestionRecord {
    const timestamp = new Date().toISOString();
    const record: TriageSuggestionRecord = {
      id: ++this.sequence.triageSuggestions,
      createdAt: timestamp,
      updatedAt: timestamp,
      ...triageSuggestion,
    };
    this.state.triageSuggestions.unshift(record);
    return record;
  }

  updateTriageSuggestion(
    id: number,
    partial: Partial<TriageSuggestionRecord>,
  ): TriageSuggestionRecord {
    const triageSuggestion = this.getTriageSuggestion(id);
    if (!triageSuggestion) {
      throw new Error('Triage suggestion not found');
    }

    Object.assign(triageSuggestion, partial, {
      updatedAt: new Date().toISOString(),
    });

    return triageSuggestion;
  }

  listFollowUpTasks(): FollowUpTaskRecord[] {
    return [...this.state.followUpTasks];
  }

  createFollowUpTasks(
    tasks: Array<Omit<FollowUpTaskRecord, 'id'>>,
  ): FollowUpTaskRecord[] {
    const records = tasks.map((task) => ({
      id: ++this.sequence.followUpTasks,
      ...task,
    }));
    this.state.followUpTasks.unshift(...records);
    return records;
  }

  recordAudit(event: Omit<AuditEventRecord, 'id' | 'createdAt'>): AuditEventRecord {
    const record: AuditEventRecord = {
      id: ++this.sequence.auditEvents,
      createdAt: new Date().toISOString(),
      ...event,
    };
    this.state.auditEvents.unshift(record);
    return record;
  }

  nextUrgencyFromNotes(notes: string): Urgency {
    const normalized = notes.toLowerCase();
    if (
      normalized.includes('chest pain') ||
      normalized.includes('shortness of breath') ||
      normalized.includes('fainting')
    ) {
      return 'urgent';
    }

    if (
      normalized.includes('worsening') ||
      normalized.includes('persistent') ||
      normalized.includes('fever')
    ) {
      return 'soon';
    }

    return 'routine';
  }
}
