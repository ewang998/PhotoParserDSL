import INodeVisitor from '../Visitor/INodeVisitor';

/**
 * An abstract syntax node in our language.
 * Returns a file inside of a file buffer.
 */
export interface INode {
  accept(visitor: INodeVisitor<unknown>): void;
}
export default INode;
