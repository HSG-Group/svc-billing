import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Message } from '../../../domain/hello/message.model';
import {
  HELLO_REPOSITORY,
  type HelloRepositoryInterface,
} from '../../../domain/repositories/hello.repository.interface';
import { GetHelloQuery } from './get-hello.query';

/**
 * GetHelloHandler orchestrates the use-case.
 * Fetches data from Infrastructure via Ports, and delegates to the Domain layer.
 */
@QueryHandler(GetHelloQuery)
export class GetHelloHandler implements IQueryHandler<GetHelloQuery, string> {
  constructor(
    @Inject(HELLO_REPOSITORY)
    private readonly helloRepository: HelloRepositoryInterface,
  ) {}

  async execute(_query: GetHelloQuery): Promise<string> {
    console.log('Application - Query - Handling GetHelloQuery...');

    // Call to Infrastructure (via Port interface)
    const name = await this.helloRepository.getStaticName();

    // Delegate to Domain layer for business rules & formatting
    const message = Message.create(name);

    return message.text;
  }
}
