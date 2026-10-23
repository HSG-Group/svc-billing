import { Controller, Get } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { GetHelloQuery } from './queries/get-hello.query';

/**
 * HelloController is an Inbound Adapter handling incoming HTTP traffic.
 * Delegates execution to the CQRS QueryBus.
 */
@Controller('hello')
export class HelloController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get()
  async getHello(): Promise<string> {
    console.log('Infrastructure - HelloController Received request for /hello');
    return this.queryBus.execute<GetHelloQuery, string>(new GetHelloQuery());
  }
}
