import jimp from 'jimp';
import { INode, Program } from '../ast';
import INodeVisitor from './INodeVisitor';

class PhotoEvaluator implements INodeVisitor<void> {
  // A map of filenames to raw filebuffers
  protected rawPhotos: { [key: string]: Buffer };
  protected photos: { [key: string]: jimp };

  public setRawPhotos(rawPhotos: { [key: string]: Buffer }) {
    this.rawPhotos = rawPhotos;
  }

  public setRawPhoto(key: string, file: Buffer) {
    this.rawPhotos[key] = file;
  }

  // Example of how to read a jimp photo out from the rawPhotos map
  //   private async getJimpPhoto(filename: string) {
  //     return jimp.read(this.rawPhotos[filename]);
  //   }

  constructor() {
    this.rawPhotos = {};
    this.photos = {};
  }

  // TODO:
  visit(n: INode): void;
  visit(p: Program): void;
  visit(p: any) {
    throw new Error('Method not implemented.');
  }
}

export default PhotoEvaluator;
