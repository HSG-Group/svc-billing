import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { HelloController } from '../application/hello/hello.controller';
import { GetHelloHandler } from '../application/hello/queries/get-hello.handler';
import { HelloRepository } from '../infrastructure/persistence/repositories/hello.repository';
import { HELLO_REPOSITORY } from '../domain/repositories/hello.repository.interface';

@Module({
  imports: [CqrsModule],
  controllers: [HelloController],
  providers: [
    GetHelloHandler,
    HelloRepository,
    {
      provide: HELLO_REPOSITORY,
      useClass: HelloRepository,
    },
  ],
  exports: [HELLO_REPOSITORY],
})
export class HelloModule {}
