import AbstractTokenizer from '../AbstractTokenizer';
import PhotoTokenizer from '../PhotoTokenizer';

const checkTokenizer = (tokenizer: AbstractTokenizer, expected: string[]) => {
  for (const elem of expected) {
    expect(tokenizer.getNext()).toBe(elem);
  }
  expect(tokenizer.hasNext()).toBeFalsy();
};

describe('tokenizer', () => {
  it('should correctly parse an empty program', () => {
    const tokenizer = PhotoTokenizer.createTokenizer(',');
    checkTokenizer(tokenizer, []);
  });
});
