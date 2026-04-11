import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { GenerateFollowUpsDto } from './dto/generate-followups.dto';
import { FollowUpsService } from './followups.service';

@ApiTags('followups')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('followups')
export class FollowUpsController {
  constructor(private readonly followUpsService: FollowUpsService) {}

  @Get()
  @ApiOperation({ summary: 'List follow-up tasks' })
  list() {
    return {
      data: this.followUpsService.list(),
    };
  }

  @Post('generate')
  @ApiOperation({ summary: 'Generate follow-up tasks from a triage suggestion' })
  generate(@Body() dto: GenerateFollowUpsDto) {
    return {
      data: this.followUpsService.generate(dto),
    };
  }
}
