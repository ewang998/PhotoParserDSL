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
  GREYSCALE: (p: jimp) => p.greyscale(),
  NORMALIZE: (p: jimp) => p.normalize(),
  SEPIA: (p: jimp) => p.sepia(),
  BRIGHTNESS: (p: jimp, level: number) => p.brightness(level),
  RESIZE: (p: jimp, width: number, height: number) => p.resize(width, height),
  FLIP: (p: jimp, horizontal: boolean, vertical: boolean) => p.flip(horizontal, vertical),
};
export default DefaultFunctions;
