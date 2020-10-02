import { INode, Program } from '../ast';

interface INodeVisitor<T> {
  visit(n: INode): T;
  visitProgram(p: Program): T;
}
export default INodeVisitor;
