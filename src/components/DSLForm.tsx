import React, { FormEvent, useState } from 'react';
import PhotoParser from '../lib/Parser/PhotoParser';
import PhotoTokenizer from '../lib/Tokenizer/PhotoTokenizer';
import PhotoEvaluator from '../lib/Visitor/PhotoEvaluator';

function DSLForm() {
  const [inputString, setInputString] = useState('');

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const tokenizer = PhotoTokenizer.createTokenizer(inputString);
    const parser = PhotoParser.createParser();
    // TODO: Set file buffers
    const evaluator = PhotoEvaluator.createEvaluator({});
    const retImage = await evaluator.visit(parser.parse(tokenizer));
    // TODO: Render buffer as image
  };

  // TODO: make a clean form with file buffers & photo uploads
  return (
    <form onSubmit={handleSubmit}>
      <label>
        Program Text:
        <textarea
          value={inputString}
          onChange={(e) => setInputString(e.target.value)}
        />
      </label>
      <input type='submit' value='Submit' />
    </form>
  );
}

export default DSLForm;
