import INodeVisitor from '../../Visitor/INodeVisitor';
import IObject from './IObject';
/**
 * Any primative type (string/text, number, etc.)
 */
class Primative implements IObject {
  public value;

  constructor(value: any) {
    this.value = value;
  }

  accept<T>(visitor: INodeVisitor<T>): T {
    return visitor.visitPrimative(this);
  }
}

export default Primative;
