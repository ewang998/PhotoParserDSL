import INode from '../ast/INode';
import ITokenizer from '../Tokenizer/ITokenizer';

interface IParser {
  parse: (tokenizer: ITokenizer) => INode;
}
export default IParser;
