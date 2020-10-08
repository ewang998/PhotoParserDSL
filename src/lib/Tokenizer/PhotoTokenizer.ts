import AbstractTokenizer from './AbstractTokenizer';

class Range {

    private start: number;
    private end: number;

    public constructor(startNum: number, endNum: number) {
        this.start = startNum;
        this.end = endNum;
    }

    public getStart(): number {
        return this.start;
    }

    public getEnd(): number {
        return this.end;
    }

    public addToStart(numberToAdd: number): void {
        this.start += numberToAdd;
    }
}

export class PhotoTokenizer extends AbstractTokenizer {

    //NOTE: ACKNOWLEDGEMENT: used and modified solution from exercise 1 alternate tokenizer

    private static FIXED_LITERALS: string[] = ["RENDER AS", "CANVAS", "WIDTH", "HEIGHT", "COLOR", ".", "png", "jpeg",
        "jpg", "LET", "BE", "CLONE", "AS", "DRAW TO CANVAS", ",", "WRITE", "DECLARE", "AND", "AT", "X", "Y", "ABOVE",
        "BELOW", "TO THE LEFT OF", "TO THE RIGHT OF", "APPLY", "TO", "BLUR", "GREYSCALE", "INVERT", "NORMALIZE",
        "SEPIA", "FLIP", "HORIZONTAL", "VERTICAL", "ROTATE", "BRIGHTNESS", "RESIZE"];
    private static SEPARATORS: string[] = [";"];
    private static CUSTOM_TOKEN_PATTERNS: string[] = ["^#(?:[0-9a-fA-F]{3}){1,2}$", "\\w+", "[\\w_]+"];

    public static createTokenizer(inputProgram: string) {
        return new PhotoTokenizer(inputProgram, PhotoTokenizer.FIXED_LITERALS);
    }

    protected tokenize(inputProgram: string): string[] {
        //some sample programs: TODO: need to test the tokenizer extensively
        //inputProgram = "CANVAS WIDTH 5 HEIGHT 5 COLOR #fffffff"; // some sample program
        //inputProgram = "CANVAS WIDTH 5 HEIGHT 5 COLOR #fffffff; LET image.png BE HELLO_WORLD;";

        let tokens: string[];

        if (inputProgram.length === 0) {
            return [];
        }

        let tokenPositions: number[] = [];

        for (let separator of PhotoTokenizer.SEPARATORS) {
            let index: number = inputProgram.indexOf(separator);

            while (index !== -1) {
                tokenPositions.push(index);
                index = inputProgram.indexOf(separator, index + 1);
            }
        }

        let toProcess: Range[] = [];
        let from: number = 0;

        for (let i of tokenPositions) {
            toProcess.push(new Range(from, i));
            from = i + 1;
        }

        if (from < inputProgram.length) {
            toProcess.push(new Range(from, inputProgram.length));
        }

        while (toProcess.length > 0) {

            let current: Range = toProcess[0];
            let start: number = current.getStart();
            let end: number = current.getEnd();

            let madeChange: boolean = false;
            let processing: string = inputProgram.substring(start, end);

            for (let fl of PhotoTokenizer.FIXED_LITERALS) {

                if (processing.startsWith(fl)) {

                    tokenPositions.push(start);

                    madeChange = true;

                    if (end - start > fl.length) {
                        current.addToStart(fl.length);
                    } else {
                        toProcess.shift();
                    }

                    break;
                }
            }

            if (madeChange) {
                continue;
            }

            for (let custom of PhotoTokenizer.CUSTOM_TOKEN_PATTERNS) {

                let pattern: RegExp = new RegExp(custom);

                let result = processing.match(pattern);

                if (result != null) { // something matched

                    let endOfMatch: number;

                    //this is special for the filename: image.png want to keep the . separate
                    //other cases, there is a space
                    if (processing.charAt(result.index + result[0].length) === ".") {
                        endOfMatch = result.index + result[0].length;
                    } else {
                        endOfMatch = result.index + result[0].length + 1; //plus one to account for space after token
                    }

                    tokenPositions.push(start);

                    madeChange = true;

                    if (end - start > endOfMatch) {
                        current.addToStart(endOfMatch);
                    } else {
                        toProcess.shift();
                    }

                    break;
                }
            }

            if (!madeChange) {
                throw new Error("Couldn't tokenize the substring: " + processing);
            }
        }

        tokens = [];
        tokenPositions.push(inputProgram.length);
        tokenPositions = tokenPositions.sort((a, b) => a - b);

        let lastPosition: number = 0;

        for (let i = 1; i < tokenPositions.length; i++) {

            tokens.push(inputProgram.substring(lastPosition, tokenPositions[i]).trim()); //trim here to avoid using another loop
            lastPosition = tokenPositions[i];
        }

        //for testing, see what the tokens are
        // for (let i = 0; i < tokens.length; i++) {
        //     console.log(tokens[i]);
        // }

        return tokens;
    }

}


export default PhotoTokenizer;
