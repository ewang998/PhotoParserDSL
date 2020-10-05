import INodeVisitor from '../../Visitor/INodeVisitor';
import IObject from '../objects/IObject';
import Statement from '../Statement';
import Var from '../objects/Var';

class Apply implements Statement {
  public func: Var;
  public photo: Var;
  public args: IObject[];

  constructor(func: Var, photo: Var, args: IObject[] = []) {
    this.func = func;
    this.photo = photo;
    this.args = args;
  }

  accept<T>(visitor: INodeVisitor<T>): T {
    return visitor.visitApply(this);
  }
}

export default Apply;
