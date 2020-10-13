export abstract class AbstractTokenizer {
  protected fixedLiterals: string[];
  protected tokens: string[];
  protected currentToken: number;

  protected abstract tokenize(program: string): string[];

  protected constructor(inputProgram: string, fixedLiterals: string[]) {
    this.fixedLiterals = fixedLiterals;
    this.currentToken = 0;
    this.tokens = this.tokenize(inputProgram);
  }

  /**
   * Returns true if the next token satisfies the given regexp.
   */
  public checkNext(regexp: RegExp) {
    return regexp.test(this.tokens[this.currentToken]);
  }

  /**
   * Returns the next token in the tokenizer.
   * Returns undefined if there are no more tokens.
   */
  public getNext() {
    return this.tokens[this.currentToken++];
  }

  /**
   * Returns the next string iif it matches the given regex.
   * If it fails to match, throws an error.
   */
  public getAndCheckNext(regexp: RegExp): string | never {
    if (!this.checkNext(regexp)) {
      throw new Error(
        `Unexpected token. Expected a match for ${regexp.toString()}, but recieved`
      );
    }
    return this.tokens[this.currentToken];
  }

  public hasNext() {
    return this.currentToken < this.tokens.length;
  }
}

export default AbstractTokenizer;
