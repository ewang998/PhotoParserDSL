import Program from '../ast/Program';
import ITokenizer from '../Tokenizer/ITokenizer';
import PhotoTokenizer from '../Tokenizer/PhotoTokenizer';
import IParser from './IParser';

class PhotoParser implements IParser {
  public static getParser() {
    return new PhotoParser();
  }

  private constructor() {}

  // TODO: Set file buffers from the frontend so we can reference them/pass them onto our nodes if needbe
  public setFilesBuffers(files: { [key: string]: Buffer }[]) {}

  public parse(tokenizer: ITokenizer) {
    return new Program();
  }
}

export default PhotoParser;
