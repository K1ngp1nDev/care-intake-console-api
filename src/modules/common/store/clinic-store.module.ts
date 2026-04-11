import { Global, Module } from '@nestjs/common';
import { ClinicStoreService } from './clinic-store.service';

@Global()
@Module({
  providers: [ClinicStoreService],
  exports: [ClinicStoreService],
})
export class ClinicStoreModule {}
