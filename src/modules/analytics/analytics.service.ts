import { Injectable } from '@nestjs/common';
import { ClinicStoreService } from '../common/store/clinic-store.service';

@Injectable()
export class AnalyticsService {
  constructor(private readonly store: ClinicStoreService) {}

  queueSummary() {
    const patients = this.store.listPatients();
    const appointments = this.store.listAppointments();
    const triageSuggestions = this.store.listTriageSuggestions();
    const followUpTasks = this.store.listFollowUpTasks();

    const queueByStatus = ['scheduled', 'checked_in', 'triaged', 'follow_up'].map(
      (status) => ({
        label: status,
        value: appointments.filter((appointment) => appointment.status === status)
          .length,
      }),
    );

    const queueByUrgency = ['routine', 'soon', 'urgent'].map((urgency) => ({
      label: urgency,
      value: appointments.filter((appointment) => appointment.urgency === urgency)
        .length,
    }));

    const completionRate =
      followUpTasks.length === 0
        ? 0
        : Math.round(
            (followUpTasks.filter((task) => task.status === 'done').length /
              followUpTasks.length) *
              100,
          );

    return {
      totals: {
        patients: patients.length,
        appointments: appointments.length,
        triageSuggestions: triageSuggestions.length,
        followUpTasks: followUpTasks.length,
      },
      queueByStatus,
      queueByUrgency,
      completionRate,
      urgentCases: triageSuggestions.filter((triage) => triage.urgency === 'urgent')
        .length,
    };
  }
}
