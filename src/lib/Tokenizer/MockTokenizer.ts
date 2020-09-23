import AbstractTokenizer from './AbstractTokenizer';

class MockTokenizer extends AbstractTokenizer {
  constructor(tokens: string[]) {
    super('', []);
    this.tokens = tokens;
  }

  protected tokenize(token: string) {
    return [];
  }
}

export default MockTokenizer;
