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
   * Returns true iif the next tokens satisfies the given regexps.
   */
  public checkNextSequence(regexps: RegExp[]) {
    for (let i = 0; i < regexps.length; i++) {
      if (!regexps[i].test(this.tokens[this.currentToken + i])) {
        return false;
      }
    }
    return true;
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
        `Unexpected token. Expected a match for ${regexp.toString()}, but recieved ${this.tokens[this.currentToken]}`
      );
    }
    return this.getNext();
  }

  /**
   * Returns an array of strings s where s[i] matches regexps[i]
   * If any match fails, throw an error.
   */
  public getAndCheckNextSequence(regexps: RegExp[]): string[] | never {
    let results: string[] = [];

    for (let regexp of regexps) {
      try {
        results.push(this.getAndCheckNext(regexp));
      } catch (e) {
        throw new Error(
          `Unexpected token. Expected a match for ${regexps.toString()}, but recieved ${this.tokens[this.currentToken]}. Successfully matched ${results.toString()}`
        );
      }
    }

    return results;
  }

  public hasNext() {
    return this.currentToken < this.tokens.length;
  }
}

export default AbstractTokenizer;
