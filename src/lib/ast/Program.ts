import INode from './INode';

class Program implements INode {
  // TODO: Figure out what exactly we need to have inside our main program after parsing.
  private buffer: Buffer = Buffer.from('');

  // TODO: Write this method n stuff
  public evaluate() {
    return this.buffer;
  }
}

export default Program;
