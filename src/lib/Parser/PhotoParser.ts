import Draw, { DrawInstruction } from '../ast/Draw';
import Apply from '../ast/functions/Apply';
import ApplyThunk from '../ast/functions/ApplyThunk';
import Declare from '../ast/functions/Declare';
import INode from '../ast/INode';
import AbsolutePosition from '../ast/locations/AbsolutePosition';
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

    while (tokenizer.hasNext() && !tokenizer.checkNext(/RENDER/i)) {
      statements.push(this.parseStatement(tokenizer));
    }

    let filename: string = this.parseRenderAs(tokenizer);

    let program: Program = new Program(canvas, statements, filename);

    // console.log(program);

    return program;
  }

  // CANVAS ::= "CANVAS" "WIDTH" int "HEIGHT" int "COLOR" COLOR SEP
  private parseCanvas(tokenizer: ITokenizer): Canvas {
    tokenizer.getAndCheckNext(/CANVAS/i);
    tokenizer.getAndCheckNext(/WIDTH/i);
    let width: number = parseInt(tokenizer.getAndCheckNext(PhotoParser.REGEXPS.INT));
    tokenizer.getAndCheckNext(/HEIGHT/i);
    let height: number = parseInt(tokenizer.getAndCheckNext(PhotoParser.REGEXPS.INT));
    tokenizer.getAndCheckNext(/COLOR/i);
    let color: Color = new Color(tokenizer.getAndCheckNext(PhotoParser.REGEXPS.COLOR));
    tokenizer.getAndCheckNext(PhotoParser.REGEXPS.SEMICOLON);

    return new Canvas(width, height, color);
  }

  // STATEMENT ::= (PICTURE | CLONE | DRAW | MANIPULATION | WRITE | DEFINE) SEP
  private parseStatement(tokenizer: ITokenizer): Statement {
    let statement: Statement;

    if (tokenizer.checkNext(/LET/i)) {
      statement = this.parseLet(tokenizer);
    } else if (tokenizer.checkNext(/CLONE/i)) {
      statement = this.parseClone(tokenizer);
    } else if (tokenizer.checkNext(/DRAW/i)) {
      statement = this.parseDraw(tokenizer);
    } else if (tokenizer.checkNext(/APPLY/i)) {
      statement = this.parseApply(tokenizer);
    } else if (tokenizer.checkNext(/WRITE/i)) {
      statement = this.parseWrite(tokenizer);
    } else if (tokenizer.checkNext(/DEFINE/i)) {
      statement = this.parseDeclare(tokenizer);
    } else {
      // TODO: more specific error type?
      throw new Error(`Unknown keyword: ${tokenizer.getNext()}`);
    }

    tokenizer.getAndCheckNext(PhotoParser.REGEXPS.SEMICOLON);
    return statement;
  }

  // PICTURE ::= "LET" FILENAME "BE" IDENTIFIER
  private parseLet(tokenizer: ITokenizer): Let {
    tokenizer.getAndCheckNext(/LET/i);
    let filename: string = tokenizer.getAndCheckNext(PhotoParser.REGEXPS.FILENAME);
    tokenizer.getAndCheckNext(/BE/i);
    let identifier: string = tokenizer.getAndCheckNext(PhotoParser.REGEXPS.IDENTIFIER);

    return new Let(filename, identifier);
  }

  // CLONE ::= "CLONE" (IDENTIFIER | "CANVAS") "AS" IDENTIFIER
  private parseClone(tokenizer: ITokenizer): Clone {
    tokenizer.getAndCheckNext(/CLONE/i);

    let src: Var;
    if (tokenizer.checkNext(/CANVAS/i)) {
      src = new Var(tokenizer.getAndCheckNext(/CANVAS/i));
    } else {
      src = new Var(tokenizer.getAndCheckNext(PhotoParser.REGEXPS.IDENTIFIER));
    }
    
    tokenizer.getAndCheckNext(/AS/i);
    let dest: string = tokenizer.getAndCheckNext(PhotoParser.REGEXPS.IDENTIFIER);

    return new Clone(src, dest);
  }

  // DRAW ::= "DRAW TO CANVAS" (IDENTIFIER POSITION ",")+
  private parseDraw(tokenizer: ITokenizer): Draw {
    tokenizer.getAndCheckNextSequence([/DRAW/i, /TO/i, /CANVAS/i]);

    let drawInstructions: DrawInstruction[] = [];
    while (tokenizer.checkNext(PhotoParser.REGEXPS.IDENTIFIER)) {
      let photo: Var = new Var(tokenizer.getAndCheckNext(PhotoParser.REGEXPS.IDENTIFIER));
      let position: CoordinatePosition | RelativePosition = this.parsePosition(tokenizer);
      drawInstructions.push({ photo, loc: position });
      tokenizer.getAndCheckNext(PhotoParser.REGEXPS.COMMA);
    }

    return new Draw(drawInstructions);
  }

  // POSITION ::= COORDINATE_POSITION | RELATIVE_POSITION IDENTIFIER
  // COORDINATE_POSITION ::= "AT" "X" int "Y" int
  // RELATIVE_POSITION ::= "ABOVE" | "BELOW" | "TO THE LEFT OF" | "TO THE RIGHT OF"
  private parsePosition(tokenizer: ITokenizer): CoordinatePosition | RelativePosition {
    if (tokenizer.checkNext(/AT/i)) {
      // COORDINATE_POSITION
      tokenizer.getAndCheckNext(/AT/i);
      tokenizer.getAndCheckNext(/X/i);
      let x: number = parseInt(tokenizer.getAndCheckNext(PhotoParser.REGEXPS.INT));
      tokenizer.getAndCheckNext(/Y/i);
      let y: number = parseInt(tokenizer.getAndCheckNext(PhotoParser.REGEXPS.INT));

      return { x, y };
    } else {
      // RELATIVE_POSITION
      let posString: string = tokenizer.getNext().toUpperCase();
      let pos: RelativePositionEnum;

      if (tokenizer.checkNext(/ABOVE/i)) {
        tokenizer.getAndCheckNext(/ABOVE/i);
        pos = RelativePositionEnum.ABOVE;
      } else if (tokenizer.checkNext(/BELOW/i)) {
        tokenizer.getAndCheckNext(/BELOW/i);
        pos = RelativePositionEnum.BELOW;
      } else if (tokenizer.checkNextSequence([/TO/i, /THE/i, /LEFT/i, /OF/i])) {
        tokenizer.getAndCheckNextSequence([/TO/i, /THE/i, /LEFT/i, /OF/i]);
        pos = RelativePositionEnum.LEFT;
      } else if (tokenizer.checkNextSequence([/TO/i, /THE/i, /RIGHT/i, /OF/i])) {
        tokenizer.getAndCheckNextSequence([/TO/i, /THE/i, /RIGHT/i, /OF/i]);
        pos = RelativePositionEnum.RIGHT;
      } else {
        throw new Error(`Unknown relative position starting with: ${tokenizer.getNext()}`);
      }

      let relativeTo: string = tokenizer.getAndCheckNext(PhotoParser.REGEXPS.IDENTIFIER);

      return new RelativePosition(relativeTo, pos);
    }
  }

  // MANIPULATION ::= "APPLY" COMMAND "TO" ("CANVAS" | IDENTIFIER)
  private parseApply(tokenizer: ITokenizer): Apply {
    tokenizer.getAndCheckNext(/APPLY/i);

    let { fn, args } = this.parseCommand(tokenizer);

    tokenizer.getAndCheckNext(/TO/i);

    let photo: Var;
    if (tokenizer.checkNext(/CANVAS/i)) {
      photo = new Var(tokenizer.getAndCheckNext(/CANVAS/i));
    } else {
      photo = new Var(tokenizer.getAndCheckNext(PhotoParser.REGEXPS.IDENTIFIER));
    }

    return new Apply(fn, photo, args);
  }

  // WRITE ::= "WRITE" TEXT ABSOLUTE_POSITION (IDENTIFIER | "CANVAS")
  private parseWrite(tokenizer: ITokenizer): Write {
    tokenizer.getAndCheckNext(/WRITE/i);
    let text: string = tokenizer.getNext();

    let pos: AbsolutePosition;

    if (tokenizer.checkNextSequence([/AT/i, /THE/i, /BOTTOM/i, /OF/i])) {
      tokenizer.getAndCheckNextSequence([/AT/i, /THE/i, /BOTTOM/i, /OF/i]);
      pos = AbsolutePosition.BOTTOM;
    } else if (tokenizer.checkNextSequence([/AT/i, /THE/i, /TOP/i, /OF/i])) {
      tokenizer.getAndCheckNextSequence([/AT/i, /THE/i, /TOP/i, /OF/i]);
      pos = AbsolutePosition.TOP;
    } else if (tokenizer.checkNextSequence([/TO/i, /THE/i, /LEFT/i, /OF/i])) {
      tokenizer.getAndCheckNextSequence([/TO/i, /THE/i, /LEFT/i, /OF/i]);
      pos = AbsolutePosition.LEFT;
    } else if (tokenizer.checkNextSequence([/TO/i, /THE/i, /RIGHT/i, /OF/i])) {
      tokenizer.getAndCheckNextSequence([/TO/i, /THE/i, /RIGHT/i, /OF/i]);
      pos = AbsolutePosition.RIGHT;
    } else {
      throw new Error(`Unknown absolute position starting with: ${tokenizer.getNext()}`);
    }

    let photo: Var;
    if (tokenizer.checkNext(/CANVAS/i)) {
      photo = new Var(tokenizer.getAndCheckNext(/CANVAS/i));
    } else {
      photo = new Var(tokenizer.getAndCheckNext(PhotoParser.REGEXPS.IDENTIFIER));
    }

    return new Write(text, photo, pos);
  }

  // DEFINE ::= "DECLARE" IDENTIFIER "AS" FUNCTION ("AND" FUNCTION)*
  // FUNCTION ::= IDENTIFIER | COMMAND
  private parseDeclare(tokenizer: ITokenizer): Declare {
    tokenizer.getAndCheckNext(/DECLARE/i);

    let name: string = tokenizer.getAndCheckNext(PhotoParser.REGEXPS.IDENTIFIER);

    tokenizer.getAndCheckNext(/AS/i);

    let calls: ApplyThunk[] = [];

    calls.push(this.parseApplyThunk(tokenizer));

    while (tokenizer.checkNext(/AND/i)) {
      tokenizer.getAndCheckNext(/AND/i);
      calls.push(this.parseApplyThunk(tokenizer));
    }

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
    let fnName: string = tokenizer.getNext().toUpperCase();
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
        tokenizer.getAndCheckNext(/WIDTH/i);
        let width: number = parseInt(tokenizer.getAndCheckNext(PhotoParser.REGEXPS.INT));
        tokenizer.getAndCheckNext(/HEIGHT/i);
        let height: number = parseInt(tokenizer.getAndCheckNext(PhotoParser.REGEXPS.INT));
        args.push(new Primitive(width));
        args.push(new Primitive(height));
        break;
      case "FLIP":
        fn = new Var(fnName);
        let orientation: string = tokenizer.getNext().toUpperCase();
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
    tokenizer.getAndCheckNextSequence([/RENDER/i, /AS/i]);
    let filename: string = tokenizer.getAndCheckNext(PhotoParser.REGEXPS.FILENAME);
    tokenizer.getAndCheckNext(PhotoParser.REGEXPS.SEMICOLON);

    return filename;
  }
}

export default PhotoParser;
