import INodeVisitor from '../Visitor/INodeVisitor';
import INode from './INode';

export class Program implements INode {
  public accept<T>(v: INodeVisitor<T>): T {
    return v.visitProgram(this);
  }
}
export default Program;
