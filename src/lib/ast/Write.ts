import INodeVisitor from '../Visitor/INodeVisitor';
import AbsolutePosition from './locations/AbsolutePosition';
import Var from './objects/Var';
import Statement from './Statement';

class Write implements Statement {
  accept<T>(visitor: INodeVisitor<T>): T {
    throw new Error('Method not implemented.');
  }
  public text: string;
  public photo: Var;
  public position: AbsolutePosition;
}

export default Write;
