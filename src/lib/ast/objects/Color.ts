import INodeVisitor from '../../Visitor/INodeVisitor';
import IObject from './IObject';
class Color implements IObject {
  public hex: String;

  constructor(hex: String) {
    this.hex = hex;
  }

  accept<T>(visitor: INodeVisitor<T>): T {
    return visitor.visitColor(this);
  }
}

export default Color;
