import INodeVisitor from '../Visitor/INodeVisitor';
import CoordinatePosition from './locations/CoordinatePosition';

import Var from './objects/Var';
import Statement from './Statement';

export interface DrawInstruction {
  photo: Var;
  loc: CoordinatePosition;
}

class Draw implements Statement {
  public instructions: DrawInstruction[];
  constructor(instructions: DrawInstruction[]) {
    this.instructions = instructions;
  }

  accept<T>(visitor: INodeVisitor<T>): T {
    return visitor.visitDraw(this);
  }
}

export default Draw;
