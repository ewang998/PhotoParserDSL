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
import Jimp from 'jimp';
import Draw from '../ast/Draw';
import Write from '../ast/Write';
import DefaultFunctions from '../functions/DefaultFunctions';
import PhotoFunction from '../functions/PhotoFunction';
import AbsolutePositionEnum from '../ast/locations/AbsolutePosition';
import CoordinatePosition from '../ast/locations/CoordinatePosition';
import path from 'path';

export type MemoryValue = Jimp | PhotoFunction | ApplyThunk[];

const debug = str => console.log(`evaluator: ${str}`);

class PhotoEvaluator implements INodeVisitor<Promise<Jimp>> {
  // A map of filenames to raw filebuffers
  protected static fontPath = path.join(process.env.PUBLIC_URL, 'open-sans-12-black.fnt'); 
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

  // Example of how to read a Jimp photo out from the rawPhotos map
  private async getJimpPhoto(filename: string) {
    return Jimp.read(this.rawPhotos[filename]);
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
   *  2. Populate the memory @ ApplyThunk.uuid with the given Jimp object
   *  3. Evaluate the thunk
   *  4. "Free" the uuid from the memory (paramater out of scope)
   * and then re-visit to apply the function in context.
   */
  async evaluateApplyThunks(arr: ApplyThunk[], photo: Jimp) {
    debug(`Evaluating ${arr.length} apply thunks.`);
    for (const thunk of arr) {
      this.memory[thunk.uuid] = photo;
      await this.visit(thunk);
    }
  }

  /**
   * When we grab a value from memory to "apply", we have three options:
   *  1. An array of ApplyThunks to execute (a user-declared "function")
   *  2. A primitive function (one of our PhotoFunction lambdas)
   *  3. A Jimp photo
   */
  async visitApply(a: Apply) {
    debug(`Applying ${a.func.name} to photo ${a.photo.name}.`);

    const func = await a.func.accept(this);
    const photo = await a.photo.accept(this);
    if (Array.isArray(func)) {
      await this.evaluateApplyThunks(func, photo);
    } else if (func instanceof Function) {
      const args = await Promise.all(a.args.map((v) => v.accept(this)));
      await func(photo, ...args);
    } else {
      throw new Error(`Invalid function in application: ${func}.`);
    }
  }

  async visit(n: INode): Promise<Jimp> {
    await n.accept(this);
    return this.outputPhoto;
  }

  async visitDraw(d: Draw) {
    // get the canvas
    debug(`Drawing ${d.instructions.length} images to the canvas.`);
    let canvas: Jimp = this.outputPhoto;
    for (var instruction of d.instructions) {
      debug(`Drawing ${instruction.photo.name} to the canvas at ${instruction.loc}.`);
      let position: CoordinatePosition = instruction.loc;
      let photo: Jimp = await instruction.photo.accept(this);
      canvas.composite(photo, position.x, position.y)
    }
    // blitz is just deleting everything under your image

    this.outputPhoto = canvas;
  }

  // Writes text to absolute position on identifier or canvas
  async visitWrite(w: Write) {
    let text = w.text;
    let textPos = w.position;
    let imageName = w.photo.name;
    debug(`Writing ${text} to ${imageName} at ${textPos}.`);

    let imageCaption = {
                        text, 
                        alignmentX: this.getAbsoluteXAlignment(textPos), 
                        alignmentY: this.getAbsoluteYAlignment(textPos)
                      }; // object containing text and text positioning
    const font = await Jimp.loadFont(PhotoEvaluator.fontPath);
    let photo: Jimp = imageName === "CANVAS" ? this.outputPhoto : await w.photo.accept(this);
    this.outputPhoto = await photo.print(font, 0, 0, imageCaption, photo.getWidth(), photo.getHeight());
  }

  private getAbsoluteXAlignment(ab: AbsolutePositionEnum): number {
    switch(ab) {
      case AbsolutePositionEnum.LEFT:
          return Jimp.HORIZONTAL_ALIGN_LEFT;
      case AbsolutePositionEnum.RIGHT:
          return Jimp.HORIZONTAL_ALIGN_RIGHT;
      default:
          return Jimp.HORIZONTAL_ALIGN_CENTER;
    }
  }

  private getAbsoluteYAlignment(ab: AbsolutePositionEnum): number {
    switch(ab) {
      case AbsolutePositionEnum.BOTTOM:
        return Jimp.VERTICAL_ALIGN_BOTTOM;
      case AbsolutePositionEnum.TOP:
        return Jimp.VERTICAL_ALIGN_TOP;
      default:
        return Jimp.VERTICAL_ALIGN_MIDDLE;
    }
  }

  async visitProgram(p: Program): Promise<Jimp> {
    // create canvas 
    await p.canvas.accept(this);

    for (var s of p.statements) {
      await s.accept(this);
    }
    let result = this.outputPhoto;
    return result;
  }

  async visitLet(l: Let) {
    debug(`Creating ${l.name} from ${l.filename}.`);

    let photo = this.getJimpPhoto(l.filename);
    this.memory[l.name] = await photo;
  }

  async visitCanvas(c: Canvas) {
    debug(`Creating a ${c.width} by ${c.height} ${c.color} canvas.`);
    let canvas: Jimp = await new Jimp(c.width, c.height, await c.color.accept(this));
    this.memory['CANVAS'] = canvas;
    this.outputPhoto = canvas;
  }

  async visitColor(c: Color) {
    return c.hex;
  }

  async visitDeclare(d: Declare) {
    debug(`Creating a ${d.name} with ${d.calls.length} calls.`);
    this.memory[d.name] = d.calls;
  }

  async visitClone(c: Clone) {
    debug(`Cloning ${c.src.name} into ${c.dest}.`);
    let photo = await c.src.accept(this);
    let clone = photo.clone();
    this.memory[c.dest] = clone;
  }
}

export default PhotoEvaluator;
