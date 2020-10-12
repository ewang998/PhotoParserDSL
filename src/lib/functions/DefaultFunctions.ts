import jimp from 'jimp';
import DefaultFunctionsEnum from './DefaultFunctionsEnum';
import PhotoFunction from './PhotoFunction';
/**
 * We export these default functions to populate the memory in the evaluator.
 */
const DefaultFunctions: { [key in DefaultFunctionsEnum]: PhotoFunction } = {
  BLUR: (p: jimp) => p.blur(50),
  INVERT: (p: jimp) => p.invert(),
  ROTATE: (p: jimp, degrees: number) => p.rotate(degrees),
  GREYSCALE: (p: jimp) => p.greyscale(), // jimp does not take parameter for greyscale function
  RESIZE: (p: jimp, width: number, height: number) => p.resize(width, height),
  FLIP: (p: jimp, isHorizontal: boolean, isVertical: boolean) => p.flip(isHorizontal, isVertical),
  BRIGHTNESS: (p: jimp, intensity: number) => p.brightness(intensity),
  NORMALIZE: (p: jimp) => p.normalize(),
  SEPIA: (p: jimp) => p.sepia(),
  // Can add more functions for increased functionality

};
export default DefaultFunctions;
