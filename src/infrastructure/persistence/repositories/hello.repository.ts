import { Injectable } from '@nestjs/common';
import { HelloRepositoryInterface } from '../../../domain/repositories/hello.repository.interface';

/**
 * HelloRepository is an in-memory Outbound Adapter implementing HelloRepositoryInterface.
 * In a real production setup, this would query PostgreSQL via TypeORM.
 */
@Injectable()
export class HelloRepository implements HelloRepositoryInterface {
  constructor() {
    console.log('Infrastructure - HelloRepo request received');
  }

  async getStaticName(): Promise<string> {
    console.log('Infrastructure - HelloRepo Fetching static name...');
    return 'World';
  }
}
