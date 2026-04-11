import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateIntakeDto } from './dto/create-intake.dto';
import { IntakesService } from './intakes.service';

@ApiTags('intakes')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('intakes')
export class IntakesController {
  constructor(private readonly intakesService: IntakesService) {}

  @Post()
  @ApiOperation({ summary: 'Submit a patient intake form' })
  createIntake(@Body() dto: CreateIntakeDto) {
    return {
      data: this.intakesService.createIntake(dto),
    };
  }
}
