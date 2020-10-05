import INodeVisitor from '../../Visitor/INodeVisitor';
import Statement from '../Statement';
import ApplyThunk from './ApplyThunk';

class Declare implements Statement {
  public name: string;
  public calls: ApplyThunk[];

  constructor(name: string, calls: ApplyThunk[]) {
    this.name = name;
    this.calls = calls;
  }

  accept<T>(visitor: INodeVisitor<T>): T {
    return visitor.visitDeclare(this);
  }
}

export default Declare;
