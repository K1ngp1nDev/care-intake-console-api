import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { SuggestTriageDto } from './dto/suggest-triage.dto';
import { UpdateTriageDecisionDto } from './dto/update-triage-decision.dto';
import { TriageService } from './triage.service';

@ApiTags('triage')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('triage')
export class TriageController {
  constructor(private readonly triageService: TriageService) {}

  @Get()
  @ApiOperation({ summary: 'List triage suggestions' })
  list() {
    return {
      data: this.triageService.list(),
    };
  }

  @Post('suggest')
  @ApiOperation({ summary: 'Generate an AI triage suggestion from intake data' })
  suggest(@Body() dto: SuggestTriageDto) {
    return {
      data: this.triageService.suggest(dto),
    };
  }

  @Patch(':id/decision')
  @ApiOperation({ summary: 'Accept, edit, or reject a triage suggestion' })
  updateDecision(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateTriageDecisionDto,
  ) {
    return {
      data: this.triageService.updateDecision(id, dto),
    };
  }
}
