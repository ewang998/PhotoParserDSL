import AbstractTokenizer from './AbstractTokenizer';

export class PhotoTokenizer extends AbstractTokenizer {

    // unused because are using a very simple tokenizer
    // private static FIXED_LITERALS: string[] = ["RENDER AS", "CANVAS", "WIDTH", "HEIGHT", "COLOR", ".", "png", "jpeg",
    //     "jpg", "LET", "BE", "CLONE", "AS", "DRAW TO CANVAS", ",", "WRITE", "DECLARE", "AND", "AT", "X", "Y", "ABOVE",
    //     "BELOW", "TO THE LEFT OF", "TO THE RIGHT OF", "APPLY", "TO", "BLUR", "GREYSCALE", "INVERT", "NORMALIZE",
    //     "SEPIA", "FLIP", "HORIZONTAL", "VERTICAL", "ROTATE", "BRIGHTNESS", "RESIZE"];
    // private static SEPARATORS: string[] = [";"];
    // private static CUSTOM_TOKEN_PATTERNS: string[] = ["^#(?:[0-9a-fA-F]{3}){1,2}$", "\\w+", "[\\w_]+"];

    public static createTokenizer(inputProgram: string) {
        return new PhotoTokenizer(inputProgram, null); //null because we don't need it. Can remove  fixedLiteral from AbstractTokenizer altogether if needed
    }

    protected tokenize(inputProgram: string): string[] {

        // simple tokenizer: split the string by spaces, and then split by semicolon

        //inputProgram = "CANVAS WIDTH 5 HEIGHT 5 COLOR #fffffff"; // some sample program
        //inputProgram = "CANVAS WIDTH 5 HEIGHT 5 COLOR #fffffff;LET image.png BE HELLO_WORLD;";

        let tokens: string[] = [];

        if (inputProgram.length === 0) {
            return tokens;
        }

        let programSplitBySpace: string[] = inputProgram.split(" ");

        for (let i = 0; i < programSplitBySpace.length; i++) {
            // trim strings
            // Regexp capture group technology allows us to keep the delimiter when splitting:
            // https://www.bennadel.com/blog/3334-you-can-include-delimiters-in-the-result-of-javascripts-string-split-method-when-using-capturing-groups.htm
            let splitBySemicolon: string[] = programSplitBySpace[i].split(/([;])/g);

            for (let i = 0; i < splitBySemicolon.length; i++) {

                if (splitBySemicolon[i] !== "") {
                    tokens.push(splitBySemicolon[i].trim());
                }
            }
        }

        //for testing, see what the tokens are
        for (let i = 0; i < tokens.length; i++) {
            console.log("FINAL TOKEN: " + tokens[i]);
        }

        return tokens;
    }

}


export default PhotoTokenizer;
