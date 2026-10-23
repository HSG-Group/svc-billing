/**
 * Port for Hello persistence / static data. Implemented by an infrastructure adapter.
 * Kept in the domain layer so use cases depend on the abstraction, not the implementation.
 */
export interface HelloRepositoryInterface {
  getStaticName(): Promise<string>;
}

export const HELLO_REPOSITORY = Symbol('HELLO_REPOSITORY');
