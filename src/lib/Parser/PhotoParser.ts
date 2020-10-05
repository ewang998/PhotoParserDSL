import INode from '../ast/INode';
import ITokenizer from '../Tokenizer/AbstractTokenizer';
import IParser from './IParser';

class PhotoParser implements IParser {
  public static createParser() {
    return new PhotoParser();
  }

  private constructor() {}

  // TODO: Parser
  public parse(tokenizer: ITokenizer) {
    throw new Error('Not implemented');
    return (null as unknown) as INode;
  }
}

export default PhotoParser;
