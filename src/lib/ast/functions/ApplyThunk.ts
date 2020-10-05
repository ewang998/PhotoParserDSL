import { v1 } from 'uuid';
import IObject from '../objects/IObject';
import Var from '../objects/Var';
import Apply from './Apply';

/**
 * An apply that may still be missing an argument, i.e.
 * an implicit apply from a declare statement.
 */
class ApplyThunk extends Apply {
  // The UUID that will identify the photo passed to this ApplyThunk down the line.
  public uuid: string;

  /**
   * Creates an ApplyThunk, a "partially applied" function application,
   *  with some params already "passed" to the given function
   * We expect to be passed at most one more argument--a single photo.
   * @param func The name of the function we're applying
   * @param args Provided args for the function
   * @param uuid A unique UUID to scope the variable within this function.
   *              By default, this is a randomly generated uuid. We shouldn't need to pass it in
   *              since our basic implementation has an "implicit" variable name.
   */
  constructor(func: Var, args: IObject[], uuid: string = v1()) {
    super(func, new Var(uuid), args);
    this.uuid = uuid;
  }
}

export default ApplyThunk;
