import { Module } from '@nestjs/common';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AppointmentsModule } from './modules/appointments/appointments.module';
import { AuditLogModule } from './modules/audit-log/audit-log.module';
import { AuthModule } from './modules/auth/auth.module';
import { ClinicStoreModule } from './modules/common/store/clinic-store.module';
import { FollowUpsModule } from './modules/followups/followups.module';
import { IntakesModule } from './modules/intakes/intakes.module';
import { PatientsModule } from './modules/patients/patients.module';
import { TriageModule } from './modules/triage/triage.module';

@Module({
  imports: [
    ClinicStoreModule,
    AuditLogModule,
    AuthModule,
    PatientsModule,
    AppointmentsModule,
    IntakesModule,
    TriageModule,
    FollowUpsModule,
    AnalyticsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
