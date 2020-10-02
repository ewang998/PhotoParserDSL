import AbstractTokenizer from './AbstractTokenizer';

export class PhotoTokenizer extends AbstractTokenizer {
  private static RSERVED_WORD = '_';

  // TODO: set fixed literals
  private static FIXED_LITERALS = [];

  public static createTokenizer(inputProgram: string) {
    return new PhotoTokenizer(inputProgram, PhotoTokenizer.FIXED_LITERALS);
  }

  protected tokenize(inputProgram: string): string[] {
    // TODO: Implement tokenizer for the Photo DSL
    return [];
  }
}

export default PhotoTokenizer;
