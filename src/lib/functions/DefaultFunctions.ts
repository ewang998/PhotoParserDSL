import jimp from 'jimp';
import DefaultFunctionsEnum from './DefaultFunctionsEnum';
import PhotoFunction from './PhotoFunction';
/**
 * We export these default functions to populate the memory in the evaluator.
 * TODO: Finish filling these out
 */
const DefaultFunctions: { [key in DefaultFunctionsEnum]: PhotoFunction } = {
  BLUR: (p: jimp) => p.blur(50),
  INVERT: (p: jimp) => p.invert(),
  ROTATE: (p: jimp, degrees: number) => p.rotate(degrees),
};
export default DefaultFunctions;
