import PhotoEvaluator from '../Visitor/PhotoEvaluator';
import INode from './INode';

export class Program implements INode {
  public accept(v: PhotoEvaluator) {
    // TODO:
    throw new Error('Not implemented');
  }
}
export default Program;
