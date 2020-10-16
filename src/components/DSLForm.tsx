import React, { FormEvent, useState } from 'react';
import PhotoParser from '../lib/Parser/PhotoParser';
import PhotoTokenizer from '../lib/Tokenizer/PhotoTokenizer';
import PhotoEvaluator from '../lib/Visitor/PhotoEvaluator';

import ImageUploader from 'react-images-upload';

function DSLForm() {
    const [inputString, setInputString] = useState('');
    //pictures stored in this const

    //each picture is a File type
    let [pictures, setPictures] = useState([]);

    let [errors, setErrorString] = useState('');

    let [finalOutputPicture, setFinalOutputPicture] = useState(null);

    const renderInput = async () => {
        //pass in the array of pictures (which is an array of File) to evaluator
        try {
            const tokenizer = PhotoTokenizer.createTokenizer(inputString);
            const parser = PhotoParser.createParser();
            const evaluator = PhotoEvaluator.createEvaluator({});
            const retImage = await evaluator.visit(parser.parse(tokenizer));
        } catch (e) {
            setErrorString(e.getMessage());
        }

        //TODO: set the retImage to finalOutputPicture, this will be rendered on the web page
        //setFinalOutputPicture(retImage); //something like this, handle promise
    };

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault();

        if (inputString.length > 0 && pictures.length > 0) {
            setErrorString('');
            renderInput();
        } else {
            setErrorString("You didn't upload any pictures and/or wrote a program!");
        }
    };

    //TODO: can comment this out for now to prevent auto form submission
    const handleInput = async (event: FormEvent) => {
        event.preventDefault();

        setTimeout(function () {
            if (inputString !== '' && pictures.length > 0) {
                renderInput();
            }
        }, 500);
    };

    const onDrop = (pictureArray: File[]) => {
        //replace the existing array
        setPictures(pictureArray);
    };

    const renderFileNames = () => {
        let imageName: string[] = [];

        if (pictures.length > 0) {
            for (let i = 0; i < pictures.length; i++) {
                imageName.push(pictures[i].name);
            }

            return (
                <div>
                    Image names:
                    {imageName.map((name: string, index) => (
                        <p key={index}>{name}</p>
                    ))}
                </div>
            );
        }
    };

    return (
        <div style={{ textAlign: 'center' }}>
            <h1>PHOTO COLLAGE DSL PROGRAM</h1>
            <h2>CPSC 410 2020WT1</h2>
            <h3>TODO: provide instructions, possibly EBNF on how to use program</h3>
            <h3 style={{ marginTop: '5rem' }}>Upload your images here:</h3>
            <ImageUploader
                withIcon={false} // no point since you can't drag images to the icon to upload
                onChange={onDrop}
                label={'Maximum file size is 5MB. Accepted file extensions are jpg, png, and jpeg'}
                imgExtension={['.jpg', '.jpeg', '.png']}
                maxFileSize={5242880}
                withPreview={true}
                fileContainerStyle={{ maxWidth: '25rem' }}
            />
            {renderFileNames()}
            <h3>Enter your program here:</h3>
            <form style={{ paddingTop: '1rem' }} onSubmit={handleSubmit}>
                <textarea
                    style={{ margin: 'auto', width: '36rem', height: '12rem' }}
                    placeholder={'Enter program here'}
                    value={inputString}
                    onChange={event => {
                        setInputString(event.target.value);
                        handleInput(event);
                    }}
                />
                <input
                    type="submit"
                    value="Build Collage!"
                    style={{ margin: 'auto', display: 'block', marginTop: '1rem' }}
                />
            </form>
            <h2 style={{ color: 'red' }}>{errors}</h2>
            <div>{finalOutputPicture}</div>
        </div>
    );
}

export default DSLForm;
