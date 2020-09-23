import INode from '../ast/INode';
import ITokenizer from '../Tokenizer/AbstractTokenizer';

interface IParser {
  parse: (tokenizer: ITokenizer) => INode;
}
export default IParser;
