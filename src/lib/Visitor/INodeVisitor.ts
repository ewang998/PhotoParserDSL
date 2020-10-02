import INode from '../ast/INode';
import Program from '../ast/Program';

interface INodeVisitor<T> {
  visit(n: INode): T;
  visitProgram(p: Program): T;
}
export default INodeVisitor;
