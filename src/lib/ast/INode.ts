/**
 * An abstract syntax node in our language.
 * Returns a file inside of a file buffer.
 */
interface INode {
  evaluate: () => Promise<Buffer>;
}

export default INode;
