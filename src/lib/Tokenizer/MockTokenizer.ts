import AbstractTokenizer from './AbstractTokenizer';

export class MockTokenizer extends AbstractTokenizer {
  constructor(tokens: string[]) {
    super('', []);
    this.tokens = tokens;
  }

  protected tokenize(token: string): string[] {
    return [];
  }
}

export default MockTokenizer;
