import { Module } from '@nestjs/common';
import { FollowUpsController } from './followups.controller';
import { FollowUpsService } from './followups.service';

@Module({
  controllers: [FollowUpsController],
  providers: [FollowUpsService],
})
export class FollowUpsModule {}
