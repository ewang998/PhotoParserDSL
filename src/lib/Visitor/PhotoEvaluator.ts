import Apply from '../ast/functions/Apply';
import ApplyThunk from '../ast/functions/ApplyThunk';
import Declare from '../ast/functions/Declare';
import INode from '../ast/INode';
import Canvas from '../ast/objects/Canvas';
import Clone from '../ast/objects/Clone';
import Color from '../ast/objects/Color';
import Let from '../ast/objects/Let';
import Primitive from '../ast/objects/Primitive';
import Var from '../ast/objects/Var';
import Program from '../ast/Program';
import INodeVisitor from './INodeVisitor';
import jimp from 'jimp';
import Draw from '../ast/Draw';
import Write from '../ast/Write';
import DefaultFunctions from '../functions/DefaultFunctions';
import PhotoFunction from '../functions/PhotoFunction';
import Jimp from 'jimp';
import AbsolutePositionEnum from '../ast/locations/AbsolutePosition';
import CoordinatePosition from '../ast/locations/CoordinatePosition';

export type MemoryValue = jimp | PhotoFunction | ApplyThunk[];

class PhotoEvaluator implements INodeVisitor<Promise<jimp>> {
  // A map of filenames to raw filebuffers
  protected rawPhotos: { [key: string]: Buffer };
  protected memory: { [key: string]: MemoryValue };
  protected outputPhoto: Jimp;

  public static createEvaluator(rawPhotos: { [key: string]: Buffer }) {
    return new PhotoEvaluator(rawPhotos);
  }

  private constructor(rawPhotos: { [key: string]: Buffer }) {
    this.rawPhotos = rawPhotos;
    this.memory = { ...DefaultFunctions };
  }

  // Example of how to read a jimp photo out from the rawPhotos map
  private async getJimpPhoto(filename: string) {
    return jimp.read(this.rawPhotos[filename]);
  }

  visitVar(n: Var): MemoryValue {
    return this.memory[n.name];
  }

  visitPrimitive(n: Primitive): any {
    return n.value;
  }

  /**
   * If we have an array of statements, this has to be an array of ApplyThunks. For each, we need to:
   *  1. Grab the photo stored in Var
   *  2. Populate the memory @ ApplyThunk.uuid with the given jimp object
   *  3. Evaluate the thunk
   *  4. "Free" the uuid from the memory (paramater out of scope)
   * and then re-visit to apply the function in context.
   */
  async evaluateApplyThunks(arr: ApplyThunk[], photo: jimp) {
    for (const thunk of arr) {
      this.memory[thunk.uuid] = photo;
      await this.visit(thunk);
    }
  }

  /**
   * When we grab a value from memory to "apply", we have three options:
   *  1. An array of ApplyThunks to execute (a user-declared "function")
   *  2. A primitive function (one of our PhotoFunction lambdas)
   *  3. A jimp photo
   */
  async visitApply(a: Apply) {
    const func = a.func.accept(this);
    const photo = await a.photo.accept(this);
    if (Array.isArray(func)) {
      await this.evaluateApplyThunks(func, photo);
    } else if (func instanceof Function) {
      const args = a.args.map((v) => v.accept(this));
      await func(photo, ...args);
    } else {
      throw new Error(`Invalid function in application: ${func}.`);
    }
  }

  async visit(n: INode): Promise<jimp> {
    await n.accept(this);
    return (this.memory['CANVAS'] as unknown) as jimp;
  }

  visitDraw(d: Draw) {
    // TODO: implement
    d.accept(this);
  }
  // Writes text to absolute position on identifier or canvas
  visitWrite(w: Write) {
    // TODO: use rawPhotos, memory
    // TODO: writing text to AbsolutePosition
    let text = w.text;
    let textPos = w.position;
    let imageName = w.photo.name;
    let loadedImage;
    let imageCaption = {
                        text: text, 
                        alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER, 
                        alignmentY: Jimp.VERTICAL_ALIGN_BOTTOM
                      }; // object containing text and text positioning
    let font = Jimp.FONT_SANS_10_BLACK;
    let coordinate = this.getAbCoordinate(textPos);
    

    // use jimp print to write text on image
    Jimp.read(imageName)
      // load font
      .then(function (image) {
        loadedImage = image;
        return Jimp.loadFont(font) // should user be allowed to choose font, color, and size?
      })
      // write text to image
      .then(function (font) {
        loadedImage.print(font, coordinate.x, coordinate.y, imageCaption) // prints text on to image. Add extra parameter maxImageSize for wrapping text within image borders
        .write(imageName); // TODO: write back to orginal image? 
      })
      .catch(function (err) {
          console.error("Unable to write text to image: " + err);
      });
  }

  private getAbCoordinate(ab: AbsolutePositionEnum) {
    let result: CoordinatePosition;
    let canvasH = this.outputPhoto.getHeight();
    let canvasW = this.outputPhoto.getHeight();

    switch(ab) {
      case AbsolutePositionEnum.BOTTOM:
        result.x = Math.floor(canvasW / 2);
        result.y = canvasH;
        break;
      case AbsolutePositionEnum.TOP:
        result.x = Math.floor(canvasW / 2);
        result.y = 0;
        break;
      case AbsolutePositionEnum.LEFT:
        result.x = 0;
        result.y = Math.floor(canvasH / 2);
        break;
      case AbsolutePositionEnum.RIGHT:
        result.x = canvasW;
        result.y = Math.floor(canvasH / 2);
        break;
    }
    return result;
  }

  async visitProgram(p: Program): Promise<Jimp> {
    // create canvas 
    p.canvas.accept(this);

    for (var s of p.statements) {
      s.accept(this);
    }

    return this.outputPhoto;
  }

  visitLet(l: Let): Promise<null> {
    throw new Error('Method not implemented.');
  }

  visitCanvas(c: Canvas) {
    let canvas = new Jimp(c.width, c.height, c.color, (err, image) => {
      // begin with an empty Jimp image as the canvas 
    })
    this.memory['CANVAS'] = canvas;
  }

  visitColor(c: Color) {
    throw new Error('Method not implemented.');
  }

  visitDeclare(d: Declare) {
    throw new Error('Method not implemented.');
  }

  async visitClone(c: Clone) {
    let photo = await c.accept(this);
    this.memory[c.dest] = photo;
  }
}

export default PhotoEvaluator;
