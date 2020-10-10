import Draw, { DrawInstruction } from '../ast/Draw';
import Apply from '../ast/functions/Apply';
import ApplyThunk from '../ast/functions/ApplyThunk';
import Declare from '../ast/functions/Declare';
import INode from '../ast/INode';
import CoordinatePosition from '../ast/locations/CoordinatePosition';
import RelativePosition, { RelativePositionEnum } from '../ast/locations/RelativePosition';
import Canvas from '../ast/objects/Canvas';
import Clone from '../ast/objects/Clone';
import Color from '../ast/objects/Color';
import IObject from '../ast/objects/IObject';
import Let from '../ast/objects/Let';
import Primitive from '../ast/objects/Primitive';
import Var from '../ast/objects/Var';
import Program from '../ast/Program';
import Statement from '../ast/Statement'
import Write from '../ast/Write';
import ITokenizer from '../Tokenizer/AbstractTokenizer';
import IParser from './IParser';

class PhotoParser implements IParser {
  private static REGEXPS = {
    IDENTIFIER: /[\w_]/,
    INT: /[0-9]+/,
    FLOAT: /[+-]?([0-9]*[.])?[0-9]+/,
    COLOR: /^#(?:[0-9a-fA-F]{3}){1,2}$/,
    FILENAME: /^\w+\.(png|PNG|jpeg|JPEG|jpg|JPG)$/,
    SEMICOLON: /;/,
    COMMA: /,/,
  };

  public static createParser() {
    return new PhotoParser();
  }

  private constructor() {}

  public parse(tokenizer: ITokenizer) {
    return this.parseProgram(tokenizer);
  }

  // PROGRAM ::= CANVAS STATEMENT* "RENDER AS" FILENAME SEP
  private parseProgram(tokenizer: ITokenizer): Program {
    let statements: Statement[] = [];

    let canvas: Canvas = this.parseCanvas(tokenizer);

    while (tokenizer.hasNext() && !tokenizer.checkNext(/RENDER AS/)) {
      statements.push(this.parseStatement(tokenizer));
    }

    let filename: string = this.parseRenderAs(tokenizer);

    return new Program(canvas, statements, filename);
  }

  // CANVAS ::= "CANVAS" "WIDTH" int "HEIGHT" int "COLOR" COLOR SEP
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

  // STATEMENT ::= (PICTURE | CLONE | DRAW | MANIPULATION | WRITE | DEFINE) SEP
  private parseStatement(tokenizer: ITokenizer): Statement {
    if (tokenizer.checkNext(/LET/)) {
      return this.parseLet(tokenizer);
    } else if (tokenizer.checkNext(/CLONE/)) {
      return this.parseClone(tokenizer);
    } else if (tokenizer.checkNext(/DRAW TO CANVAS/)) {
      return this.parseDraw(tokenizer);
    } else if (tokenizer.checkNext(/APPLY/)) {
      return this.parseApply(tokenizer);
    } else if (tokenizer.checkNext(/WRITE/)) {
      return this.parseWrite(tokenizer);
    } else if (tokenizer.checkNext(/DEFINE/)) {
      return this.parseDeclare(tokenizer);
    } else {
      // TODO: more specific error type?
      throw new Error(`Unknown keyword: ${tokenizer.getNext()}`);
    }
  }

  // PICTURE ::= "LET" FILENAME "BE" IDENTIFIER
  private parseLet(tokenizer: ITokenizer): Let {
    tokenizer.getAndCheckNext(/LET/);
    let filename: string = tokenizer.getAndCheckNext(PhotoParser.REGEXPS.FILENAME);
    tokenizer.getAndCheckNext(/BE/);
    let identifier: string = tokenizer.getAndCheckNext(PhotoParser.REGEXPS.IDENTIFIER);
    tokenizer.getAndCheckNext(PhotoParser.REGEXPS.SEMICOLON);

    return new Let(filename, identifier);
  }

  // CLONE ::= "CLONE" (IDENTIFIER | "CANVAS") "AS" IDENTIFIER
  private parseClone(tokenizer: ITokenizer): Clone {
    tokenizer.getAndCheckNext(/CLONE/);

    let src: Var;
    if (tokenizer.checkNext(/CANVAS/)) {
      src = new Var(tokenizer.getAndCheckNext(/CANVAS/));
    } else {
      src = new Var(tokenizer.getAndCheckNext(PhotoParser.REGEXPS.IDENTIFIER));
    }
    
    tokenizer.getAndCheckNext(/AS/);
    let dest: string = tokenizer.getAndCheckNext(PhotoParser.REGEXPS.IDENTIFIER);

    tokenizer.getAndCheckNext(PhotoParser.REGEXPS.SEMICOLON);

    return new Clone(src, dest);
  }

  // DRAW ::= "DRAW TO CANVAS" (IDENTIFIER POSITION ",")+
  private parseDraw(tokenizer: ITokenizer): Draw {
    tokenizer.getAndCheckNext(/DRAW TO CANVAS/);

    let drawInstructions: DrawInstruction[] = [];
    while (tokenizer.checkNext(PhotoParser.REGEXPS.IDENTIFIER)) {
      let photo: Var = new Var(tokenizer.getAndCheckNext(PhotoParser.REGEXPS.IDENTIFIER));
      let position: CoordinatePosition | RelativePosition = this.parsePosition(tokenizer);
      drawInstructions.push({ photo, loc: position });
      tokenizer.getAndCheckNext(PhotoParser.REGEXPS.COMMA);
    }

    tokenizer.getAndCheckNext(PhotoParser.REGEXPS.SEMICOLON);

    return new Draw(drawInstructions);
  }

  // POSITION ::= COORDINATE_POSITION | RELATIVE_POSITION IDENTIFIER
  // COORDINATE_POSITION ::= "AT" "X" int "Y" int
  // RELATIVE_POSITION ::= "ABOVE" | "BELOW" | "TO THE LEFT OF" | "TO THE RIGHT OF"
  private parsePosition(tokenizer: ITokenizer): CoordinatePosition | RelativePosition {
    if (tokenizer.checkNext(/AT/)) {
      // COORDINATE_POSITION
      tokenizer.getAndCheckNext(/AT/);
      tokenizer.getAndCheckNext(/X/);
      let x: number = parseInt(tokenizer.getAndCheckNext(PhotoParser.REGEXPS.INT));
      tokenizer.getAndCheckNext(/Y/);
      let y: number = parseInt(tokenizer.getAndCheckNext(PhotoParser.REGEXPS.INT));

      return { x, y };
    } else {
      // RELATIVE_POSITION
      let posString: string = tokenizer.getNext();
      let pos: RelativePositionEnum;

      switch(posString) {
        case "ABOVE":
          pos = RelativePositionEnum.ABOVE;
          break;
        case "BELOW":
          pos = RelativePositionEnum.BELOW;
          break;
        case "TO THE LEFT OF":
          pos = RelativePositionEnum.LEFT;
          break;
        case "TO THE RIGHT OF":
          pos = RelativePositionEnum.RIGHT;
          break;
        default:
          // TODO: more specific error type?
          throw new Error(`Unknown relative position: ${posString}`);
      }

      let relativeTo: string = tokenizer.getAndCheckNext(PhotoParser.REGEXPS.IDENTIFIER);

      return new RelativePosition(relativeTo, pos);
    }
  }

  // MANIPULATION ::= "APPLY" COMMAND "TO" ("CANVAS" | IDENTIFIER)
  private parseApply(tokenizer: ITokenizer): Apply {
    tokenizer.getAndCheckNext(/APPLY/);

    let { fn, args } = this.parseCommand(tokenizer);

    tokenizer.getAndCheckNext(/TO/);

    let photo: Var;
    if (tokenizer.checkNext(/CANVAS/)) {
      photo = new Var(tokenizer.getAndCheckNext(/CANVAS/));
    } else {
      photo = new Var(tokenizer.getAndCheckNext(PhotoParser.REGEXPS.IDENTIFIER));
    }

    tokenizer.getAndCheckNext(PhotoParser.REGEXPS.SEMICOLON);

    return new Apply(fn, photo, args);
  }

  // TODO Pending review with team...
  // WRITE ::= "WRITE" TEXT POSITION (IDENTIFIER | "CANVAS")
  private parseWrite(tokenizer: ITokenizer): Write {
    throw new Error('Not implemented');
  }

  // DEFINE ::= "DECLARE" IDENTIFIER "AS" FUNCTION ("AND" FUNCTION)*
  // FUNCTION ::= IDENTIFIER | COMMAND
  private parseDeclare(tokenizer: ITokenizer): Declare {
    tokenizer.getAndCheckNext(/DECLARE/);

    let name: string = tokenizer.getAndCheckNext(PhotoParser.REGEXPS.IDENTIFIER);

    tokenizer.getAndCheckNext(/AS/);

    let calls: ApplyThunk[] = [];

    calls.push(this.parseApplyThunk(tokenizer));

    while (tokenizer.checkNext(/AND/)) {
      tokenizer.getAndCheckNext(/AND/);
      calls.push(this.parseApplyThunk(tokenizer));
    }

    tokenizer.getAndCheckNext(PhotoParser.REGEXPS.SEMICOLON);

    return new Declare(name, calls);
  }

  private parseApplyThunk(tokenizer: ITokenizer): ApplyThunk {
    if (tokenizer.checkNext(PhotoParser.REGEXPS.IDENTIFIER)) {
      let identifier: string = tokenizer.getAndCheckNext(PhotoParser.REGEXPS.IDENTIFIER);
      
      return new ApplyThunk(new Var(identifier), []);
    } else {
      let { fn, args } = this.parseCommand(tokenizer);

      return new ApplyThunk(fn, args);
    }
  }

  // COMMAND      ::= "BLUR" | ROTATE | "GREYSCALE" | RESIZE | FLIP | BRIGHTNESS | "INVERT" | "NORMALIZE" | "SEPIA"
  // FLIP         ::= "FLIP" ("HORIZONTAL" | "VERTICAL")
  // ROTATE       ::= "ROTATE" [0-360]
  // BRIGHTNESS   ::= "BRIGHTNESS" [-1,1]
  // RESIZE       ::= "RESIZE" "WIDTH" int "HEIGHT" int
  private parseCommand(tokenizer: ITokenizer): { fn: Var, args: IObject[] } {
    let fnName: string = tokenizer.getNext();
    let fn: Var;
    let args: IObject[] = [];
    switch(fnName) {
      case "BLUR":
      case "GREYSCALE":
      case "INVERT":
      case "NORMALIZE":
      case "SEPIA":
        fn = new Var(fnName);
        break;
      case "ROTATE":
        fn = new Var(fnName);
        let deg: number = parseInt(tokenizer.getAndCheckNext(PhotoParser.REGEXPS.INT));
        args.push(new Primitive(deg));
        break;
      case "RESIZE":
        fn = new Var(fnName);
        tokenizer.getAndCheckNext(/WIDTH/);
        let width: number = parseInt(tokenizer.getAndCheckNext(PhotoParser.REGEXPS.INT));
        tokenizer.getAndCheckNext(/HEIGHT/);
        let height: number = parseInt(tokenizer.getAndCheckNext(PhotoParser.REGEXPS.INT));
        args.push(new Primitive(width));
        args.push(new Primitive(height));
        break;
      case "FLIP":
        fn = new Var(fnName);
        let orientation: string = tokenizer.getNext();
        if (orientation === "HORIZONTAL" || orientation === "VERTICAL") {
          args.push(new Primitive(orientation));
        } else {
          throw new Error(`Unknown orientation: ${orientation}`);
        }
        break;
      case "BRIGHTNESS":
        fn = new Var(fnName);
        let brightness: number = parseFloat(tokenizer.getAndCheckNext(PhotoParser.REGEXPS.FLOAT));
        args.push(new Primitive(brightness));
        break;
      default:
        // TODO: more specific error type?
        throw new Error(`Unknown command: ${fnName}`);
    }

    return { fn, args };
  }

  private parseRenderAs(tokenizer: ITokenizer): string {
    tokenizer.getAndCheckNext(/RENDER AS/);
    let filename: string = tokenizer.getAndCheckNext(PhotoParser.REGEXPS.FILENAME);
    tokenizer.getAndCheckNext(PhotoParser.REGEXPS.SEMICOLON);

    return filename;
  }
}

export default PhotoParser;
