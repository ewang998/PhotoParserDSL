import Program from '../ast/Program';
import ITokenizer from '../Tokenizer/AbstractTokenizer';
import IParser from './IParser';

class PhotoParser implements IParser {
  public static createParser() {
    return new PhotoParser();
  }

  private constructor() {}

  // TODO: Set file buffers from the frontend so we can reference them/pass them onto our nodes if needbe
  //       We might want to do this differently
  public setFilesBuffers(files: { [key: string]: Buffer }[]) {}

  // TODO: Parser
  public parse(tokenizer: ITokenizer) {
    return new Program();
  }
}

export default PhotoParser;
