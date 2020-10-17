import INodeVisitor from '../Visitor/INodeVisitor';
import AbsolutePosition from './locations/AbsolutePosition';
import CoordinatePosition from './locations/CoordinatePosition';
import Var from './objects/Var';
import Statement from './Statement';

class Write implements Statement {
  public text: string;
  public photo: Var;
  public position: AbsolutePosition;
  //public position: CoordinatePosition;

  constructor(text: string, photo: Var, position: AbsolutePosition) {
    this.text = text;
    this.photo = photo;
    this.position = position;
  }

  accept<T>(visitor: INodeVisitor<T>): T {
    return visitor.visitWrite(this);
  }

}

export default Write;
