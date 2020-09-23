import React, { FormEvent, useState } from 'react';
import PhotoParser from '../lib/Parser/PhotoParser';
import PhotoTokenizer from '../lib/Tokenizer/PhotoTokenizer';

function DSLForm() {
  const [inputString, setInputString] = useState('');

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const tokenizer = PhotoTokenizer.createTokenizer(inputString);
    const parser = PhotoParser.createParser();

    // TODO: set file buffers or w/e
    // parser.setFilesBuffers();

    // TODO: set image on page
    const retImage = await parser.parse(tokenizer).evaluate();
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
