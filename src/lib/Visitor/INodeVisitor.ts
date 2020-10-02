import { INode, Program } from '../ast';

interface INodeVisitor<T> {
  visit(n: INode): T;
  visit(p: Program): T;
}
export default INodeVisitor;
