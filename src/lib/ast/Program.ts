import INodeVisitor from '../Visitor/INodeVisitor';
import INode from './INode';
import Canvas from './objects/Canvas';
import Statement from './Statement';

export class Program implements INode {
  public canvas: Canvas;
  public statements: Statement[];
  public filename: string;

  constructor(canvas: Canvas, statements: Statement[], filename: string) {
    this.canvas = canvas;
    this.statements = statements;
    this.filename = filename;
  }

  public addStatement(statement: Statement) {
    this.statements.push(statement);
  }

  public getStatements() {
    return this.statements;
  }

  public accept<T>(v: INodeVisitor<T>): T {
    return v.visitProgram(this);
  }
}
export default Program;
