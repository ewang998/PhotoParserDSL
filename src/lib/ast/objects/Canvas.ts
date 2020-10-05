import INodeVisitor from '../../Visitor/INodeVisitor';
import Color from './Color';
import INode from '../INode';

class Canvas implements INode {
  public width: number;
  public height: number;
  public color: Color;

  constructor(width: number, height: number, color: Color) {
    this.width = width;
    this.height = height;
    this.color = color;
  }
  accept<T>(visitor: INodeVisitor<T>): T {
    return visitor.visitCanvas(this);
  }
}
export default Canvas;
