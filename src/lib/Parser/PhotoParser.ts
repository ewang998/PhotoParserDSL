import Program from '../ast/Program';
import ITokenizer from '../Tokenizer/AbstractTokenizer';
import IParser from './IParser';

class PhotoParser implements IParser {
  public static createParser() {
    return new PhotoParser();
  }

  private constructor() {}

  // TODO: Parser
  public parse(tokenizer: ITokenizer) {
    return new Program();
  }
}

export default PhotoParser;
