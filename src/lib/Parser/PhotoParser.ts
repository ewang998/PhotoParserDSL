import INode from '../ast/INode';
import Canvas from '../ast/objects/Canvas';
import Color from '../ast/objects/Color';
import Program from '../ast/Program';
import Statement from '../ast/Statement'
import ITokenizer from '../Tokenizer/AbstractTokenizer';
import IParser from './IParser';

class PhotoParser implements IParser {
  private static REGEXPS = {
    IDENTIFIER: /[\w_]/,
    INT: /[0-9]+/,
    COLOR: /^#(?:[0-9a-fA-F]{3}){1,2}$/,
    FILENAME: /^\w+\.(png|PNG|jpeg|JPEG|jpg|JPG)$/,
    SEMICOLON: /;/,
  };

  public static createParser() {
    return new PhotoParser();
  }

  private constructor() {}

  public parse(tokenizer: ITokenizer) {
    return this.parseProgram(tokenizer);
  }

  private parseProgram(tokenizer: ITokenizer): Program {
    let statements: Statement[] = [];

    let canvas: Canvas = this.parseCanvas(tokenizer);

    while (tokenizer.hasNext() && !tokenizer.checkNext(/RENDER AS/)) {
      statements.push(this.parseStatement(tokenizer));
    }

    let filename: string = this.parseFilename(tokenizer);

    let program: Program = new Program(canvas, statements, filename);
    
    return program;
  }

  private parseCanvas(tokenizer: ITokenizer): Canvas {
    tokenizer.getAndCheckNext(/CANVAS/);
    tokenizer.getAndCheckNext(/WIDTH/);
    let width: number = parseInt(tokenizer.getAndCheckNext(PhotoParser.REGEXPS.INT));
    tokenizer.getAndCheckNext(/HEIGHT/);
    let height: number = parseInt(tokenizer.getAndCheckNext(PhotoParser.REGEXPS.INT));
    tokenizer.getAndCheckNext(/COLOR/);
    let color: Color = new Color(tokenizer.getAndCheckNext(PhotoParser.REGEXPS.COLOR));
    tokenizer.getAndCheckNext(PhotoParser.REGEXPS.SEMICOLON);

    return new Canvas(width, height, color);
  }

  private parseStatement(tokenizer: ITokenizer): Statement {
    // TODO
    return null;
  }

  private parseFilename(tokenizer: ITokenizer): string {
    tokenizer.getAndCheckNext(/RENDER AS/);
    let filename: string = tokenizer.getAndCheckNext(PhotoParser.REGEXPS.FILENAME);
    tokenizer.getAndCheckNext(PhotoParser.REGEXPS.SEMICOLON);
    return filename;
  }
}

export default PhotoParser;
