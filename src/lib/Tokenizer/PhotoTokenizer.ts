import ITokenizer from './ITokenizer';

class PhotoTokenizer implements ITokenizer {
  private static RSERVED_WORD = '_';
  public static createTokenizer(inputProgram: string, fixedLiterals: string[]) {
    return new PhotoTokenizer(inputProgram, fixedLiterals);
  }

  private fixedLiterals: string[];
  private tokens: string[] = [];
  private currentToken = 0;

  private constructor(inputProgram: string, fixedLiterals: string[]) {
    this.fixedLiterals = fixedLiterals;
    this.tokens = this.tokenize(inputProgram);
  }

  private tokenize(inputProgram: string): string[] {
    // TODO: Implement tokenizer for the Photo DSL

    return [];
  }

  /**
   * Returns true iif the next token satisfies the given regexp.
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

export default PhotoTokenizer;
