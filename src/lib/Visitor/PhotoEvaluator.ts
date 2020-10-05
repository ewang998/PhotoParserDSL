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

type MemoryValue = jimp | PhotoFunction | ApplyThunk[];

class PhotoEvaluator implements INodeVisitor<Promise<jimp>> {
  // A map of filenames to raw filebuffers
  protected rawPhotos: { [key: string]: Buffer };
  protected memory: { [key: string]: MemoryValue };

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
    throw new Error('Method not implemented.');
  }
  visitWrite(w: Write) {
    throw new Error('Method not implemented.');
  }

  async visitProgram(p: Program): Promise<null> {
    throw new Error('Method not implemented.');
  }

  visitLet(l: Let): Promise<null> {
    throw new Error('Method not implemented.');
  }

  visitCanvas(c: Canvas) {
    throw new Error('Method not implemented.');
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
