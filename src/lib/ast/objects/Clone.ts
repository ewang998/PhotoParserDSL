import INodeVisitor from '../../Visitor/INodeVisitor';
import Statement from '../Statement';
import Var from './Var';

class Clone implements Statement {
  public src: Var;
  public dest: string;

  accept<T>(visitor: INodeVisitor<T>): T {
    return visitor.visitClone(this);
  }
}

export default Clone;
