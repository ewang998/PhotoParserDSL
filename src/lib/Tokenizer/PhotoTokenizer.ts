import REGEXPS from '../RegExps';
import escapeStringRegex from 'escape-string-regexp';
import AbstractTokenizer from './AbstractTokenizer';
import { RelativePositionEnum } from '../ast/locations/RelativePosition';
import AbsolutePositionEnum from '../ast/locations/AbsolutePosition';
import DefaultFunctionsEnum from '../functions/DefaultFunctionsEnum';

// Returns the longer of two strings
const getLongerString = (str1: string, str2: string): string => (str1.length > str2.length ? str1 : str2);

export class PhotoTokenizer extends AbstractTokenizer {
    // prettier-ignore
    private static FIXED_LITERALS: string[] = ["RENDER AS", "CANVAS", "WIDTH", "HEIGHT", "COLOR", "LET", "BE", 
        "CLONE", "AS", "DRAW TO CANVAS", ",", "WRITE", "DECLARE", "AND", "AT", "X", "Y", "ABOVE",
        "BELOW", "APPLY", "TO", "HORIZONTAL", "VERTICAL", ...Object.values(DefaultFunctionsEnum),
        ...Object.values(RelativePositionEnum), ...Object.values(AbsolutePositionEnum)];

    private static SEPARATORS: string[] = [';'];
    private static CUSTOM_TOKEN_PATTERNS: RegExp[] = [
        REGEXPS.COLOR,
        REGEXPS.FILENAME,
        REGEXPS.FLOAT,
        REGEXPS.INT,
        REGEXPS.IDENTIFIER,
        REGEXPS.TEXT,
    ];

    public static createTokenizer(inputProgram: string) {
        return new PhotoTokenizer(inputProgram, PhotoTokenizer.FIXED_LITERALS);
    }

    /**
     * Returns if the given literal is a "valid starting literal" for the given string
     * Note that every fixed literal must have the start/end of the string or a space on either side.
     * We don't use spaces as explicit separators since a user can use them in the Write command
     * @param input
     * @param literal
     */
    protected isValidStartingLiteral(input: string, literal: string): boolean {
        const upperInput = input.toUpperCase();
        const upperLiteral = literal.toUpperCase();
        return upperInput === upperLiteral || upperInput.startsWith(literal + ' ');
    }

    protected tokenize(inputProgram: string): string[] {
        const tokens = [];

        // Split our program on every potential separator, but keep the seperators in our array
        inputProgram.replace(/[\n]+/g, '');
        const sepRegex = new RegExp(`(${PhotoTokenizer.SEPARATORS.map(v => escapeStringRegex(v)).join('|')})`);
        const sepSplit = inputProgram.split(sepRegex).map(v => v.trim());

        // Now handle each sub array seperately
        // Our language is special, since some of our fixed literals use other fixed literals as subexpressions
        // Hence, we'll continually choose the longest fixed literal that we can and use that as the "best split"
        for (let input of sepSplit) {
            // If the input just happens to be one of our seperators, push it to our tokens and continue
            if (!input) {
                continue;
            } else if (PhotoTokenizer.SEPARATORS.indexOf(input) > -1) {
                tokens.push(input);
                continue;
            }

            // Otherwise, this is an input string we need to process.
            while (input.length) {
                let prefix = PhotoTokenizer.FIXED_LITERALS.reduce(
                    (maxLiteral, literal) =>
                        this.isValidStartingLiteral(input, literal) ? getLongerString(literal, maxLiteral) : maxLiteral,
                    ''
                );

                // If we don't start with a fixed literal, then we need to start with a user defined token.
                // Again, we'll take the longest token possible, as our quoted text strings can make things nasty.
                // However, we no longer have the restrictions of spaces and seperators. We're just doing a blind check.
                if (!prefix) {
                    prefix = PhotoTokenizer.CUSTOM_TOKEN_PATTERNS.reduce((maxToken, v) => {
                        const pattern: RegExp = new RegExp(`^(${v.source}).*`, 'g');
                        const matches = input.matchAll(pattern);

                        let maxMatch = '';
                        for (const match of matches) {
                            maxMatch = getLongerString(maxMatch, match[1]);
                        }
                        return getLongerString(maxMatch, maxToken);
                    }, '');
                }

                // If we still haven't found a valid token, chuck an error
                if (!prefix) {
                    throw new Error(`Unable to parse the start of ${input} as a valid token.`);
                }

                tokens.push(input.substring(0, prefix.length));
                input = input.substring(prefix.length).trim();
            }
        }


        this.printTokens(tokens);
        return tokens;
    }

    private printTokens(tokens: string[]) {

        for (let i = 0; i < tokens.length;i++) {
            console.log("token: " + tokens[i]);
        }

    }



}

export default PhotoTokenizer;
