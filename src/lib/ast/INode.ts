import INodeVisitor from '../Visitor/INodeVisitor';

/**
 * An abstract syntax node in our language.
 * Returns a file inside of a file buffer.
 */
export interface INode {
  accept<T>(visitor: INodeVisitor<T>): T;
}
export default INode;
