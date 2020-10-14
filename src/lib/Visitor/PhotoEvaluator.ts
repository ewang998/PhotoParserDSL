import Apply from '../ast/functions/Apply';
import ApplyThunk from '../ast/functions/ApplyThunk';
import Declare from '../ast/functions/Declare';
import INode from '../ast/INode';
import Canvas from '../ast/objects/Canvas';
import Clone from '../ast/objects/Clone';
import Color from '../ast/objects/Color';
import Let from '../ast/objects/Let';
import Primative from '../ast/objects/Primative';
import Var from '../ast/objects/Var';
import Program from '../ast/Program';
import INodeVisitor from './INodeVisitor';
import jimp from 'jimp';
import Draw from '../ast/Draw';
import Write from '../ast/Write';
import DefaultFunctions from '../functions/DefaultFunctions';
import PhotoFunction from '../functions/PhotoFunction';
import Jimp from 'jimp';

type MemoryValue = jimp | PhotoFunction | ApplyThunk[];

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

  visitPrimative(n: Primative): any {
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
  async evaluateApplyThunks(arr: ApplyThunk[], photoVar: Var) {
    for (const thunk of arr) {
      const photo = await photoVar.accept(this);
      this.memory[thunk.uuid] = photo;
      await this.visit(thunk);
      this.memory[thunk.uuid] = undefined;
    }
  }

  /**
   * When we grab a value from memory to "apply", we have three options:
   *  1. An array of ApplyThunks to execute (a user-declared "function")
   *  2. A primative function (one of our PhotoFunction lambdas)
   *  3. A jimp photo
   */
  async visitApply(a: Apply) {
    const func = a.func.accept(this);
    if (Array.isArray(func)) {
      await this.evaluateApplyThunks(func, a.photo);
    } else if (func instanceof Function) {
      const args = a.args.map((v) => v.accept(this));
      await func(...args);
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

    // use jimp print to write text on image
    Jimp.read(imageName)
      // load font
      .then(function (image) {
        loadedImage = image;
        return Jimp.loadFont(font) // should user be allowed to choose font, color, and size?
      })
      // write text to image
      .then(function (font) {
        loadedImage.print(font, textPos.x, textPos.y, imageCaption) // prints text on to image. Add extra parameter maxImageSize for wrapping text within image borders
        .write(imageName); // TODO: write back to orginal image? 
      })
      .catch(function (err) {
          console.error("Unable to write text to image: " + err);
      });
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
    this.outputPhoto = canvas;
  }

  visitColor(c: Color) {
    throw new Error('Method not implemented.');
  }

  visitDeclare(d: Declare) {
    throw new Error('Method not implemented.');
  }

  visitClone(c: Clone) {
    throw new Error('Method not implemented.');
  }
}

export default PhotoEvaluator;
