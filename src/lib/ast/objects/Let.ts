import INodeVisitor from '../../Visitor/INodeVisitor';
import Statement from '../Statement';

class Let implements Statement {
  public filename: string;
  public name: string;

  constructor(filename: string, name: string) {
    this.filename = filename;
    this.name = name;
  }

  accept<T>(visitor: INodeVisitor<T>): T {
    return visitor.visitLet(this);
  }
}
export default Let;
