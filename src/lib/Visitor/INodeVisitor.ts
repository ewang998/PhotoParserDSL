import Draw from '../ast/Draw';
import Apply from '../ast/functions/Apply';
import Declare from '../ast/functions/Declare';
import INode from '../ast/INode';
import Canvas from '../ast/objects/Canvas';
import Clone from '../ast/objects/Clone';
import Color from '../ast/objects/Color';
import Let from '../ast/objects/Let';
import Primitive from '../ast/objects/Primitive';
import Var from '../ast/objects/Var';
import Program from '../ast/Program';
import Write from '../ast/Write';

interface INodeVisitor<T> {
  visit(n: INode): T;

  visitProgram(p: Program);
  visitCanvas(c: Canvas);
  visitColor(c: Color);

  visitVar(n: Var);
  visitDraw(d: Draw);
  visitWrite(w: Write);
  visitPrimitive(n: Primitive);
  visitApply(a: Apply);
  visitLet(l: Let);
  visitDeclare(d: Declare);
  visitClone(c: Clone);
}
export default INodeVisitor;
