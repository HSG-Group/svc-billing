/**
 * Message is a domain value object representing a custom greeting.
 * Framework-agnostic: uses pure TypeScript with zero external dependencies.
 */
export class Message {
  private constructor(
    public readonly text: string,
    public readonly createdAt: Date,
  ) {}

  /**
   * Factory method to validate name and apply domain formatting rules.
   */
  static create(name: string): Message {
    console.log('Domain - Model - NewMessage...');

    const trimmed = name?.trim();
    if (!trimmed) {
      throw new Error('Name cannot be empty');
    }

    return new Message(`Hello, ${trimmed} from the Domain layer!`, new Date());
  }
}
