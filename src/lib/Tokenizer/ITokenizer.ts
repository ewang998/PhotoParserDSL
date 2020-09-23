interface ITokenizer {
  getNext: () => string;

  checkNext: (regexp: RegExp) => boolean;

  getAndCheckNext: (regexp: RegExp) => string;

  hasNext: () => boolean;
}

export default ITokenizer;
