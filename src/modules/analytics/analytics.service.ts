import { Injectable } from '@nestjs/common';
import { ClinicStoreService } from '../common/store/clinic-store.service';

@Injectable()
export class AnalyticsService {
  constructor(private readonly store: ClinicStoreService) {}

  queueSummary() {
    const patients = this.store.listPatients();
    const appointments = this.store.listAppointments();
    const intakes = this.store.listIntakes();
    const triageSuggestions = this.store.listTriageSuggestions();
    const followUpTasks = this.store.listFollowUpTasks();

    const now = new Date();
    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);
    const startOfTomorrow = new Date(startOfToday.getTime() + 24 * 60 * 60 * 1000);
    const endOfWeek = new Date(startOfToday.getTime() + 7 * 24 * 60 * 60 * 1000);
    const dueCutoff = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    const toDate = (iso: string): Date => new Date(iso);
    const localDateKey = (date: Date): string => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    // ---- totals ---------------------------------------------------------
    const totals = {
      patients: patients.length,
      appointments: appointments.length,
      intakes: intakes.length,
      triageSuggestions: triageSuggestions.length,
      followUpTasks: followUpTasks.length,
    };

    // ---- KPIs -----------------------------------------------------------
    const openIntakes = appointments.filter((a) =>
      ['scheduled', 'checked_in'].includes(a.status),
    ).length;

    const urgentCases = appointments.filter((a) => a.urgency === 'urgent').length;

    const appointmentsToday = appointments.filter((a) => {
      const scheduled = toDate(a.scheduledFor);
      return scheduled >= startOfToday && scheduled < startOfTomorrow;
    }).length;

    const appointmentsThisWeek = appointments.filter((a) => {
      const scheduled = toDate(a.scheduledFor);
      return scheduled >= startOfToday && scheduled < endOfWeek;
    }).length;

    const avgTriageConfidence =
      triageSuggestions.length === 0
        ? 0
        : Math.round(
            (triageSuggestions.reduce((sum, t) => sum + t.confidence, 0) /
              triageSuggestions.length) *
              100,
          );

    const followUpsDue = followUpTasks.filter(
      (task) => task.status === 'todo' && toDate(task.dueDate) <= dueCutoff,
    ).length;

    const completionRate =
      followUpTasks.length === 0
        ? 0
        : Math.round(
            (followUpTasks.filter((task) => task.status === 'done').length /
              followUpTasks.length) *
              100,
          );

    const kpis = {
      openIntakes,
      urgentCases,
      appointmentsToday,
      appointmentsThisWeek,
      avgTriageConfidence,
      followUpsDue,
      completionRate,
    };

    // ---- distributions --------------------------------------------------
    const statusOrder = ['scheduled', 'checked_in', 'triaged', 'follow_up'];
    const queueByStatus = statusOrder.map((status) => ({
      label: status,
      value: appointments.filter((a) => a.status === status).length,
    }));

    const urgencyOrder = ['routine', 'soon', 'urgent'];
    const queueByUrgency = urgencyOrder.map((urgency) => ({
      label: urgency,
      value: appointments.filter((a) => a.urgency === urgency).length,
    }));

    // ---- intake volume: last 14 calendar days, zero-filled --------------
    const volumeCounts = new Map<string, number>();
    for (const appointment of appointments) {
      const key = localDateKey(toDate(appointment.createdAt));
      volumeCounts.set(key, (volumeCounts.get(key) ?? 0) + 1);
    }

    const intakeVolume: Array<{ date: string; value: number }> = [];
    for (let offset = 13; offset >= 0; offset -= 1) {
      const day = new Date(startOfToday.getTime() - offset * 24 * 60 * 60 * 1000);
      const key = localDateKey(day);
      intakeVolume.push({ date: key, value: volumeCounts.get(key) ?? 0 });
    }

    // ---- follow-ups due list (todo first, then by dueDate asc), limit 8 -
    const patientNameById = new Map<number, string>(
      patients.map((p) => [p.id, p.fullName]),
    );

    const followUpsDueList = [...followUpTasks]
      .sort((a, b) => {
        if (a.status !== b.status) {
          return a.status === 'todo' ? -1 : 1;
        }
        return toDate(a.dueDate).getTime() - toDate(b.dueDate).getTime();
      })
      .slice(0, 8)
      .map((task) => ({
        id: task.id,
        title: task.title,
        patientName: patientNameById.get(task.patientId) ?? 'Unknown patient',
        dueDate: task.dueDate,
        owner: task.owner,
        status: task.status,
      }));

    return {
      totals,
      kpis,
      queueByStatus,
      queueByUrgency,
      intakeVolume,
      followUpsDueList,
    };
  }
}
