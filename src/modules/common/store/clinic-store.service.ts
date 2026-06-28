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
  ReviewStatus,
  TriageSuggestionRecord,
  Urgency,
} from '../types/care-intake.types';

/**
 * Small deterministic PRNG (mulberry32) so the seeded demo data is identical
 * across server restarts. No external faker dependency, no unseeded Math.random.
 */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

@Injectable()
export class ClinicStoreService {
  private readonly state: CareIntakeState;

  private readonly sequence = {
    users: 0,
    patients: 0,
    appointments: 0,
    intakes: 0,
    triageSuggestions: 0,
    followUpTasks: 0,
    auditEvents: 0,
  };

  constructor() {
    this.state = this.buildSeedState();
  }

  private buildSeedState(): CareIntakeState {
    const rng = mulberry32(0x5eed1234);
    const now = new Date();

    // ---- helpers --------------------------------------------------------
    const pick = <T>(items: readonly T[]): T =>
      items[Math.floor(rng() * items.length)];

    const weightedPick = <T>(entries: ReadonlyArray<readonly [T, number]>): T => {
      const total = entries.reduce((sum, [, weight]) => sum + weight, 0);
      let roll = rng() * total;
      for (const [value, weight] of entries) {
        roll -= weight;
        if (roll <= 0) {
          return value;
        }
      }
      return entries[entries.length - 1][0];
    };

    const randInt = (min: number, max: number): number =>
      Math.floor(rng() * (max - min + 1)) + min;

    const shiftHours = (base: Date, hours: number): string =>
      new Date(base.getTime() + hours * 60 * 60 * 1000).toISOString();

    const minusHours = (hours: number): string => shiftHours(now, -hours);

    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);

    // ---- users ----------------------------------------------------------
    const users: DemoUser[] = [
      {
        id: ++this.sequence.users,
        name: 'Demo Coordinator',
        email: 'demo@example.com',
        password: 'demo12345',
      },
    ];

    // ---- patients -------------------------------------------------------
    const firstNames = [
      'Mara',
      'Jordan',
      'Priya',
      'Diego',
      'Aisha',
      'Liam',
      'Sofia',
      'Noah',
      'Yuki',
      'Amara',
      'Elias',
      'Camila',
      'Omar',
      'Nina',
      'Theo',
      'Leah',
    ];
    const lastNames = [
      'Levin',
      'Ortega',
      'Sharma',
      'Navarro',
      'Khan',
      'Bennett',
      'Russo',
      'Fischer',
      'Tanaka',
      'Okafor',
      'Mendez',
      'Costa',
      'Haddad',
      'Larsen',
      'Wallace',
      'Bauer',
    ];
    const patientTags: string[] = [
      'new patient',
      'follow-up due',
      'returning',
      'high-risk',
    ];

    const patients: PatientRecord[] = [];
    const usedNames = new Set<string>();
    const patientCount = 14;
    for (let i = 0; i < patientCount; i += 1) {
      let first = pick(firstNames);
      let last = pick(lastNames);
      let fullName = `${first} ${last}`;
      let guard = 0;
      while (usedNames.has(fullName) && guard < 50) {
        first = pick(firstNames);
        last = pick(lastNames);
        fullName = `${first} ${last}`;
        guard += 1;
      }
      usedNames.add(fullName);

      const year = randInt(1955, 2004);
      const month = String(randInt(1, 12)).padStart(2, '0');
      const day = String(randInt(1, 28)).padStart(2, '0');

      const tags = [pick(patientTags)];
      if (rng() < 0.35) {
        const extra = pick(patientTags);
        if (!tags.includes(extra)) {
          tags.push(extra);
        }
      }

      patients.push({
        id: ++this.sequence.patients,
        fullName,
        dateOfBirth: `${year}-${month}-${day}`,
        phone: `+1 415 555 01${String(randInt(0, 99)).padStart(2, '0')}`,
        email: `${first}.${last}`.toLowerCase() + `${i}@example.test`,
        tags,
        createdAt: minusHours(randInt(24, 14 * 24)),
      });
    }

    // ---- appointments ---------------------------------------------------
    const visitTypes = [
      'Primary care follow-up',
      'Same-day evaluation',
      'New patient intake',
      'Post-discharge check',
      'Chronic care review',
      'Telehealth consult',
    ];
    const clinicians = [
      'Dr. Patel',
      'Dr. Huang',
      'Dr. Alvarez',
      'Dr. Schmidt',
      'Dr. Okonkwo',
      'NP Rivera',
    ];
    const locations = [
      'Room 1A',
      'Room 2C',
      'Room 3A',
      'Room 4B',
      'Telehealth',
      'Exam 5',
    ];

    const statuses: AppointmentStatus[] = [
      'scheduled',
      'checked_in',
      'triaged',
      'follow_up',
    ];

    const appointments: AppointmentRecord[] = [];
    const appointmentCount = 36;
    for (let i = 0; i < appointmentCount; i += 1) {
      const patient = pick(patients);

      // createdAt spread across the last 14 days.
      const createdHoursAgo = randInt(1, 14 * 24);
      const createdAt = minusHours(createdHoursAgo);

      // scheduledFor: most relative to creation, but force some to be "today"
      // and several within the next 7 days.
      let scheduledFor: string;
      if (i < 4) {
        // today (within business-ish hours)
        scheduledFor = shiftHours(startOfToday, randInt(8, 18));
      } else if (i < 12) {
        // next 7 days
        scheduledFor = shiftHours(now, randInt(4, 7 * 24));
      } else {
        // anywhere from a week ago to a couple days out
        scheduledFor = shiftHours(now, randInt(-7 * 24, 3 * 24));
      }

      const status = weightedPick<AppointmentStatus>([
        ['scheduled', 4],
        ['checked_in', 3],
        ['triaged', 3],
        ['follow_up', 2],
      ]);

      const urgency = weightedPick<Urgency>([
        ['routine', 6],
        ['soon', 3],
        ['urgent', 1],
      ]);

      appointments.push({
        id: ++this.sequence.appointments,
        patientId: patient.id,
        scheduledFor,
        visitType: pick(visitTypes),
        clinician: pick(clinicians),
        location: pick(locations),
        status,
        urgency,
        createdAt,
      });
    }

    // Guarantee coverage of every status and urgency value.
    statuses.forEach((status, idx) => {
      appointments[idx].status = status;
    });
    (['routine', 'soon', 'urgent'] as Urgency[]).forEach((urgency, idx) => {
      appointments[idx + 4].urgency = urgency;
    });

    // ---- intakes --------------------------------------------------------
    const symptomPool = [
      'persistent cough',
      'fatigue',
      'mild headache',
      'seasonal congestion',
      'lower back stiffness',
      'occasional dizziness',
      'sore throat',
      'trouble sleeping',
      'knee discomfort',
      'elevated blood pressure reading',
      'medication refill request',
      'follow-up on lab results',
    ];
    const noteTemplates = [
      'Symptoms reported over the last few days; patient requests routine guidance.',
      'Worsening over the past week, no emergency keywords noted at intake.',
      'Stable but persistent; patient prefers an in-person follow-up.',
      'New concern since last visit; no acute distress described.',
      'Returning patient checking in ahead of a scheduled review.',
      'Patient asking about administrative next steps and paperwork.',
    ];
    const allergyOptions = [
      'none reported',
      'penicillin',
      'seasonal pollen',
      'latex',
    ];
    const medicationOptions = [
      'none',
      'ibuprofen',
      'lisinopril',
      'metformin',
      'multivitamin',
    ];

    // Pick the first ~20 appointments to attach intakes to (deterministic).
    const intakes: IntakeRecord[] = [];
    const intakeCount = 20;
    for (let i = 0; i < intakeCount; i += 1) {
      const appointment = appointments[i];
      const symptomA = pick(symptomPool);
      let symptomB = pick(symptomPool);
      let guard = 0;
      while (symptomB === symptomA && guard < 10) {
        symptomB = pick(symptomPool);
        guard += 1;
      }
      const symptoms =
        rng() < 0.5 ? [symptomA, symptomB] : [symptomA];

      intakes.push({
        id: ++this.sequence.intakes,
        patientId: appointment.patientId,
        appointmentId: appointment.id,
        symptoms,
        notes: pick(noteTemplates),
        answers: {
          duration: `${randInt(1, 21)} days`,
          allergies: pick(allergyOptions),
          medications: pick(medicationOptions),
        },
        createdAt: shiftHours(
          new Date(appointment.createdAt),
          randInt(0, 6),
        ),
      });
    }

    // ---- triage suggestions --------------------------------------------
    const triageSummaries: Record<Urgency, string[]> = {
      routine: [
        'Recommend routine outpatient scheduling; no expedited handling indicated by intake.',
        'Administrative follow-up only; can be slotted into standard availability.',
      ],
      soon: [
        'Suggest expedited outpatient follow-up within a couple of days rather than emergent escalation.',
        'Operational priority bump recommended so the patient is seen sooner than routine.',
      ],
      urgent: [
        'Flag for same-day coordinator review and earliest available expedited slot.',
        'Prioritize for prompt outpatient follow-up; confirm contact details for callback.',
      ],
    };
    const reasoningByUrgency: Record<Urgency, string[]> = {
      routine: [
        'No emergency keywords detected; symptoms align with standard scheduling.',
        'Stable presentation per intake notes; routine queue is appropriate.',
      ],
      soon: [
        'Worsening trend over several days suggests follow-up within 24-48 hours.',
        'Persistent symptoms without acute red flags; expedite but not emergent.',
      ],
      urgent: [
        'Intake language indicates the visit should be prioritized for the soonest slot.',
        'Coordinator attention recommended to confirm timing and contact info.',
      ],
    };
    const missingInfoPool = [
      'Smoking history',
      'Recent travel',
      'Current weight',
      'Insurance verification',
      'Preferred pharmacy',
      'Emergency contact on file',
    ];
    const followUpQuestionPool = [
      'Any fever in the last 24 hours?',
      'Any change in symptoms since intake?',
      'Preferred time window for the visit?',
      'Any new medications since last visit?',
      'Is transportation to the clinic needed?',
    ];
    const visitPrepPool = [
      'Bring current medication list',
      'Capture latest vitals at check-in',
      'Confirm insurance card on file',
      'Verify preferred pharmacy',
      'Print intake summary for clinician',
    ];
    const reviewStatuses: ReviewStatus[] = [
      'pending',
      'accepted',
      'edited',
      'rejected',
    ];

    const sampleUnique = <T>(pool: readonly T[], count: number): T[] => {
      const copy = [...pool];
      const out: T[] = [];
      for (let i = 0; i < count && copy.length > 0; i += 1) {
        const idx = Math.floor(rng() * copy.length);
        out.push(copy.splice(idx, 1)[0]);
      }
      return out;
    };

    const triageSuggestions: TriageSuggestionRecord[] = [];
    const triageCount = 18;
    for (let i = 0; i < triageCount; i += 1) {
      const intake = intakes[i];
      const appointment = appointments.find(
        (a) => a.id === intake.appointmentId,
      )!;
      const urgency = appointment.urgency;
      const confidence =
        Math.round((0.6 + rng() * 0.35) * 100) / 100; // 0.60–0.95

      triageSuggestions.push({
        id: ++this.sequence.triageSuggestions,
        patientId: intake.patientId,
        appointmentId: intake.appointmentId,
        intakeId: intake.id,
        urgency,
        summary: pick(triageSummaries[urgency]),
        reasoningSnippet: pick(reasoningByUrgency[urgency]),
        confidence,
        sourceRefs: [
          { id: `intake:${intake.id}:notes`, label: 'Intake notes' },
          { id: `intake:${intake.id}:duration`, label: 'Duration answer' },
        ],
        reviewStatus: weightedPick<ReviewStatus>([
          ['pending', 4],
          ['accepted', 3],
          ['edited', 2],
          ['rejected', 1],
        ]),
        missingInfoChecklist: sampleUnique(missingInfoPool, randInt(1, 3)),
        followUpQuestions: sampleUnique(followUpQuestionPool, randInt(2, 3)),
        visitPrepChecklist: sampleUnique(visitPrepPool, randInt(2, 3)),
        createdAt: shiftHours(new Date(intake.createdAt), randInt(0, 2)),
        updatedAt: shiftHours(new Date(intake.createdAt), randInt(2, 6)),
      });
    }

    // ---- follow-up tasks ------------------------------------------------
    const taskTitles = [
      'Confirm medication list before visit',
      'Collect smoking history at intake desk',
      'Verify insurance details',
      'Schedule follow-up appointment',
      'Send pre-visit intake reminder',
      'Confirm preferred pharmacy',
      'Update emergency contact on file',
      'Arrange transportation assistance',
      'Share visit prep checklist with patient',
      'Log post-visit summary',
    ];
    const owners = ['Front desk', 'MA', 'Nurse', 'Care coordinator'];

    const followUpTasks: FollowUpTaskRecord[] = [];
    const followUpCount = 24;
    for (let i = 0; i < followUpCount; i += 1) {
      // Anchor each task to a triage suggestion (cycling through them).
      const triage = triageSuggestions[i % triageSuggestions.length];

      // Spread due dates: overdue, within 24h, and upcoming.
      let dueDate: string;
      const bucket = i % 3;
      if (bucket === 0) {
        dueDate = shiftHours(now, -randInt(2, 5 * 24)); // overdue
      } else if (bucket === 1) {
        dueDate = shiftHours(now, randInt(1, 24)); // within 24h
      } else {
        dueDate = shiftHours(now, randInt(25, 10 * 24)); // upcoming
      }

      followUpTasks.push({
        id: ++this.sequence.followUpTasks,
        patientId: triage.patientId,
        appointmentId: triage.appointmentId,
        triageId: triage.id,
        title: taskTitles[i % taskTitles.length],
        dueDate,
        status: weightedPick<FollowUpTaskRecord['status']>([
          ['todo', 6],
          ['done', 4],
        ]),
        owner: pick(owners),
      });
    }

    // ---- audit events ---------------------------------------------------
    const auditEvents: AuditEventRecord[] = triageSuggestions
      .slice(0, 6)
      .map((triage) => ({
        id: ++this.sequence.auditEvents,
        entityType: 'triage',
        entityId: triage.id,
        action: 'seeded',
        actor: 'system',
        createdAt: triage.createdAt,
        payload: { urgency: triage.urgency },
      }));

    return {
      users,
      patients,
      appointments,
      intakes,
      triageSuggestions,
      followUpTasks,
      auditEvents,
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

  listIntakes(): IntakeRecord[] {
    return [...this.state.intakes];
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
