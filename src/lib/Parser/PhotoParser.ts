import Draw, { DrawInstruction } from '../ast/Draw';
import Apply from '../ast/functions/Apply';
import ApplyThunk from '../ast/functions/ApplyThunk';
import Declare from '../ast/functions/Declare';
import AbsolutePosition from '../ast/locations/AbsolutePosition';
import CoordinatePosition from '../ast/locations/CoordinatePosition';
import Canvas from '../ast/objects/Canvas';
import Clone from '../ast/objects/Clone';
import Color from '../ast/objects/Color';
import IObject from '../ast/objects/IObject';
import Let from '../ast/objects/Let';
import Primitive from '../ast/objects/Primitive';
import Var from '../ast/objects/Var';
import Program from '../ast/Program';
import Statement from '../ast/Statement';
import Write from '../ast/Write';
import REGEXPS from '../RegExps';
import ITokenizer from '../Tokenizer/AbstractTokenizer';
import IParser from './IParser';

class PhotoParser implements IParser {
    private static REGEXPS = REGEXPS;

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

        console.log(program);

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
        } else if (tokenizer.checkNext(/DECLARE/i)) {
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

    // DRAW ::= "DRAW TO CANVAS" (IDENTIFIER COORDINATE_POSITION) ("," IDENTIFIER COORDINATE_POSITION)*
    private parseDraw(tokenizer: ITokenizer): Draw {
        tokenizer.getAndCheckNext(/DRAW TO CANVAS/i);

        let drawInstructions: DrawInstruction[] = [];

        let firstPhoto: Var = new Var(tokenizer.getAndCheckNext(PhotoParser.REGEXPS.IDENTIFIER));
        let firstPosition: CoordinatePosition = this.parseCoordinatePosition(tokenizer);
        drawInstructions.push({ photo: firstPhoto, loc: firstPosition });

        while (tokenizer.checkNext(PhotoParser.REGEXPS.COMMA)) {
            tokenizer.getAndCheckNext(PhotoParser.REGEXPS.COMMA);
            let photo: Var = new Var(tokenizer.getAndCheckNext(PhotoParser.REGEXPS.IDENTIFIER));
            let position: CoordinatePosition = this.parseCoordinatePosition(tokenizer);
            drawInstructions.push({ photo, loc: position });
        }

        return new Draw(drawInstructions);
    }

    // POSITION ::= COORDINATE_POSITION
    // COORDINATE_POSITION ::= "AT" "X" int "Y" int
    private parseCoordinatePosition(tokenizer: ITokenizer): CoordinatePosition {
        tokenizer.getAndCheckNext(/AT/i);
        tokenizer.getAndCheckNext(/X/i);
        let x: number = parseInt(tokenizer.getAndCheckNext(PhotoParser.REGEXPS.INT));
        tokenizer.getAndCheckNext(/Y/i);
        let y: number = parseInt(tokenizer.getAndCheckNext(PhotoParser.REGEXPS.INT));

        return { x, y };
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
        let text: string = tokenizer.getAndCheckNext(REGEXPS.TEXT).replace('"', '');

        let pos: AbsolutePosition;
        for (const absPos of Object.values(AbsolutePosition)) {
            if (tokenizer.checkNext(new RegExp(absPos, 'i'))) {
                pos = tokenizer.getAndCheckNext(new RegExp(absPos, 'i')) as AbsolutePosition;
                break;
            }
        }

        if (!pos) {
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
        let { fn, args } = this.parseCommand(tokenizer);

        return new ApplyThunk(fn, args);
    }

    // COMMAND      ::= "BLUR" | ROTATE | "GREYSCALE" | RESIZE | FLIP | BRIGHTNESS | "INVERT" | "NORMALIZE" | "SEPIA" | IDENTIFIER
    // FLIP         ::= "FLIP" ("HORIZONTAL" | "VERTICAL")
    // ROTATE       ::= "ROTATE" [0-360]
    // BRIGHTNESS   ::= "BRIGHTNESS" [-1,1]
    // RESIZE       ::= "RESIZE" "WIDTH" int "HEIGHT" int
    private parseCommand(tokenizer: ITokenizer): { fn: Var; args: IObject[] } {
        let fnName: string = tokenizer.getNext();
        let fnNameToUpper: string = fnName.toUpperCase();
        let fn: Var;
        let args: IObject[] = [];
        switch (fnNameToUpper) {
            case 'BLUR':
            case 'GREYSCALE':
            case 'INVERT':
            case 'NORMALIZE':
            case 'SEPIA':
                fn = new Var(fnNameToUpper);
                break;
            case 'ROTATE':
                fn = new Var(fnNameToUpper);
                let deg: number = parseInt(tokenizer.getAndCheckNext(PhotoParser.REGEXPS.INT));
                args.push(new Primitive(deg));
                break;
            case 'RESIZE':
                fn = new Var(fnNameToUpper);
                tokenizer.getAndCheckNext(/WIDTH/i);
                let width: number = parseInt(tokenizer.getAndCheckNext(PhotoParser.REGEXPS.INT));
                tokenizer.getAndCheckNext(/HEIGHT/i);
                let height: number = parseInt(tokenizer.getAndCheckNext(PhotoParser.REGEXPS.INT));
                args.push(new Primitive(width));
                args.push(new Primitive(height));
                break;
            case 'FLIP':
                fn = new Var(fnNameToUpper);
                let orientation: string = tokenizer.getNext().toUpperCase();
                if (orientation === 'HORIZONTAL' || orientation === 'VERTICAL') {
                    args.push(new Primitive(orientation));
                } else {
                    throw new Error(`Unknown orientation: ${orientation}`);
                }
                break;
            case 'BRIGHTNESS':
                fn = new Var(fnNameToUpper);
                let brightness: number = parseFloat(tokenizer.getAndCheckNext(PhotoParser.REGEXPS.FLOAT));
                args.push(new Primitive(brightness));
                break;
            default:
                // User-defined function
                fn = new Var(fnName);
                break;
        }

        return { fn, args };
    }

    private parseRenderAs(tokenizer: ITokenizer): string {
        tokenizer.getAndCheckNext(/RENDER AS/i);
        let filename: string = tokenizer.getAndCheckNext(PhotoParser.REGEXPS.FILENAME);
        tokenizer.getAndCheckNext(PhotoParser.REGEXPS.SEMICOLON);

        return filename;
    }
}

export default PhotoParser;
