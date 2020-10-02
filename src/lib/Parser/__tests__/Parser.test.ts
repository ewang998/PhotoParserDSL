import fs from 'fs';
import path from 'path';
import MockTokenizer from '../../Tokenizer/MockTokenizer';
import PhotoParser from '../PhotoParser';

const loadFileFromPublic = (filename: string): Buffer =>
  fs.readFileSync(path.join(process.env.PUBLIC_URL, filename));

// Example of how to load a res folder for testing
// const expected = loadFileFromPublic('ubc_logo.png');
// we can use jimp.diff to test expected file outputs

describe('parser tests', () => {
  it('should throw on an empty tokenizer', async () => {
    const tokenizer = new MockTokenizer(['']);
    const parser = PhotoParser.createParser();
    try {
      await parser.parse(tokenizer);
      fail('Expected an error to be thrown.');
    } catch (e) {
      // Expected an error to be thrown.
    }
  });
});
