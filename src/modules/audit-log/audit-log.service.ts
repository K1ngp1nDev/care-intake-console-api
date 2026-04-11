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
}
