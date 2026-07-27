// src/modules/health.controller.ts
import { Controller, Get } from '@nestjs/common';

@Controller()
export class HealthController {
  @Get('health')
  health() {
    return { status: 'ok', service: 'billing-svc' };
  }

  @Get()
  root() {
    return 'Welcome to billing-svc base server!';
  }
}