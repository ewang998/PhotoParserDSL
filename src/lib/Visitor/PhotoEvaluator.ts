import jimp from 'jimp';
import INode from '../ast/INode';
import Program from '../ast/Program';
import INodeVisitor from './INodeVisitor';

class PhotoEvaluator implements INodeVisitor<Promise<Buffer>> {
  // A map of filenames to raw filebuffers
  protected rawPhotos: { [key: string]: Buffer };
  protected photos: { [key: string]: jimp };

  public static createEvaluator(rawPhotos: { [key: string]: Buffer }) {
    return new PhotoEvaluator(rawPhotos);
  }

  private constructor(rawPhotos: { [key: string]: Buffer }) {
    this.rawPhotos = rawPhotos;
    this.photos = {};
  }

  // Example of how to read a jimp photo out from the rawPhotos map
  private async getJimpPhoto(filename: string) {
    return jimp.read(this.rawPhotos[filename]);
  }

  public async visit(n: INode): Promise<Buffer> {
    await n.accept(this);
    return this.photos['CANVAS'].getBufferAsync(jimp.MIME_PNG);
  }

  public async visitProgram(p: Program): Promise<null> {
    // TODO: Do this
    return null;
  }
}

export default PhotoEvaluator;
