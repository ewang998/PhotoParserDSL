import jimp from 'jimp';
type PhotoFunction = (photo: jimp, ...args: any[]) => jimp;
export default PhotoFunction;
