import AbstractTokenizer from '../AbstractTokenizer';
import PhotoTokenizer from '../PhotoTokenizer';

const checkTokenizer = (tokenizer: AbstractTokenizer, expected: string[]) => {
    for (const elem of expected) {
        expect(tokenizer.getNext()).toBe(elem);
    }
    expect(tokenizer.hasNext()).toBeFalsy();
};

describe('tokenizer', () => {
    it('should tokenize an empty program', () => {
        const tokenizer = PhotoTokenizer.createTokenizer('            ');
        checkTokenizer(tokenizer, []);
    });

    it('should tokenize a basic program', () => {
        const tokenizer = PhotoTokenizer.createTokenizer(
            'CANVAS WIDTH 100 HEIGHT 400 COLOR #FFF;\n let photo.jpg BE myFirstPhoto;\n RENDER AS newFile.png;'
        );
        checkTokenizer(tokenizer, [
            'CANVAS',
            'WIDTH',
            '100',
            'HEIGHT',
            '400',
            'COLOR',
            '#FFF',
            ';',
            'let',
            'photo.jpg',
            'BE',
            'myFirstPhoto',
            ';',
            'RENDER AS',
            'newFile.png',
            ';',
        ]);
    });

    it('should tokenize write', () => {
        const str =
            'MY FAVORITE THING TO xd 234 CANVAS MEMES declare this as file.jpg anyone have a copy pasta as this';
        const tokenizer = PhotoTokenizer.createTokenizer(`WRITE "${str}" AT THE BOTTOM OF CANVAS;`);
        checkTokenizer(tokenizer, ['WRITE', `"${str}"`, 'AT THE BOTTOM OF', 'CANVAS', ';']);
    });

    it('should reject a write missing a quote', () => {
        const str =
            'MY FAVORITE THING TO xd 234 CANVAS MEMES declare this as file.jpg anyone have a copy pasta as this';
        const body = `WRITE "${str} AT THE BOTTOM OF CANVAS;`;
        try {
            PhotoTokenizer.createTokenizer(body);
            fail();
        } catch (e) {
            // Do nothing; expected
        }
    });

    it('should reject a semi inside of a quote', () => {
        const str =
            'MY FAVORITE THING TO xd 234 CANVAS ; MEMES declare this as file.jpg anyone have a copy pasta as this';
        const body = `WRITE "${str}" AT THE BOTTOM OF CANVAS;`;
        try {
            PhotoTokenizer.createTokenizer(body);
            fail();
        } catch (e) {
            // Do nothing; expected
        }
    });

    it('should be fine with a an unexpected quote expression', () => {
        const str =
            'MY FAVORITE THING TO xd 234 CANVAS MEMES declare this as file.jpg anyone have a copy pasta as this';
        const tokenizer = PhotoTokenizer.createTokenizer(`AS "${str}" TO ABOVE;`);
        checkTokenizer(tokenizer, ['AS', `"${str}"`, 'TO', 'ABOVE', ';']);
    });

    it('should be fine a bunch of fragmented literals', () => {
        const tokens = ['APPLY', 'AS', 'TO', 'CLONE', 'ROTATE', 'BRIGHTNESS'];
        const tokenizer = PhotoTokenizer.createTokenizer(tokens.join(' '));
        checkTokenizer(tokenizer, tokens);
    });

    it('should tokenize a bunch of random numbers', () => {
        const tokens = ['190.80', '-1', '-0.3', '3'];
        const tokenizer = PhotoTokenizer.createTokenizer(tokens.join(' '));
        checkTokenizer(tokenizer, tokens);
    });

    it('should tokenize a draw statement', () => {
        const tokens = ['DRAW TO CANVAS', 'ABOVE', 'photo', ',', 'TO THE RIGHT OF', 'photo2'];
        const tokenizer = PhotoTokenizer.createTokenizer(tokens.join(' '));
        checkTokenizer(tokenizer, tokens);
    });

    it('should tokenize a user defined literal that starts with a fixed token', () => {
        const tokens = ['CANVASpepehands', 'pepeCANVAS', 'CANVAS'];
        const tokenizer = PhotoTokenizer.createTokenizer(tokens.join(' '));
        checkTokenizer(tokenizer, tokens);
    });

    it('should tokenize big complex.txt', () => {
        const complexTxt = 'CANVAS WIDTH 1000 HEIGHT 1000 COLOR #ffffff;\n LET image.png BE cat;\n let image2.png be DOG;' +
            '\n CLONE cat AS garfield;\n clone canvas as CANVAS2;\n DRAW TO CANVAS garfield at X 500 Y 200;' +
            '\n draw to canvas DOG TO THE LEFT OF garfield , cat ABOVE DOG;\n APPLY BLUR TO CANVAS;\n APPLY ROTATE 180 TO cat;' +
            '\n APPLY GREYSCALE TO cat;\n APPLY RESIZE WIDTH 50 HEIGHT 50 TO DOG;\n apply flip horizontal to garfield;' +
            '\n apply flip vertical to garfield;\n apply BRIGHTNESS -1 to cat;\n apply INVERT to cat;\n apply NORMALIZE TO DOG;' +
            '\n APPLY sepia to DOG;\n WRITE MY_COLLAGE AT THE BOTTOM OF CANVAS;\n WRITE CUTE_CAT TO THE LEFT OF garfield;' +
            '\n DECLARE BLURANDFLIP AS BLUR AND FLIP VERTICAL;\n DECLARE ROTATE90 AS ROTATE 90;' +
            '\n DECLARE BLURANDFLIPANDROTATE90ANDINVERT AS BLURANDFLIP AND ROTATE90 AND INVERT;' +
            '\n APPLY BLURANDFLIPANDROTATE90ANDINVERT TO CANVAS;\n RENDER AS done.png;';

        const tokens = ['CANVAS','WIDTH','1000','HEIGHT','1000','COLOR','#ffffff', ';','LET','image.png','BE','cat',
            ';','let','image2.png','be','DOG',';','CLONE','cat','AS','garfield',';','clone','canvas','as','CANVAS2',
            ';','DRAW TO CANVAS','garfield','at','X','500','Y','200',';','draw to canvas','DOG','TO THE LEFT OF',
            'garfield',',','cat','ABOVE', 'DOG',';','APPLY','BLUR','TO','CANVAS',';','APPLY','ROTATE','180','TO', 'cat',
            ';', 'APPLY','GREYSCALE','TO','cat',';','APPLY','RESIZE','WIDTH','50','HEIGHT','50','TO','DOG',';','apply',
            'flip','horizontal','to','garfield',';','apply','flip','vertical','to','garfield',';','apply','BRIGHTNESS',
            '-1','to','cat',';','apply','INVERT','to','cat',';','apply','NORMALIZE','TO','DOG',';','APPLY','sepia','to',
            'DOG',';','WRITE','MY_COLLAGE','AT THE BOTTOM OF','CANVAS',';','WRITE','CUTE_CAT','TO THE LEFT OF','garfield',
            ';','DECLARE','BLURANDFLIP','AS','BLUR','AND','FLIP','VERTICAL',';','DECLARE','ROTATE90','AS','ROTATE','90',
            ';','DECLARE','BLURANDFLIPANDROTATE90ANDINVERT','AS','BLURANDFLIP','AND','ROTATE90','AND','INVERT',';','APPLY',
            'BLURANDFLIPANDROTATE90ANDINVERT','TO','CANVAS',';','RENDER AS','done.png',';'];
        const tokenizer = PhotoTokenizer.createTokenizer(complexTxt);

        checkTokenizer(tokenizer, tokens);

    })

});
