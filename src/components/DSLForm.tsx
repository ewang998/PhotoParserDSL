import EBNFMarkdown from '../EBNF.md';
import ExampleMarkdown from '../Example.md';
import './DSLForm.css';

import React, { FormEvent, useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import PhotoParser from '../lib/Parser/PhotoParser';
import PhotoTokenizer from '../lib/Tokenizer/PhotoTokenizer';
import PhotoEvaluator from '../lib/Visitor/PhotoEvaluator';
import ImageUploader from 'react-images-upload';
import PhotoValidator from '../lib/Visitor/PhotoValidator';
import {file} from "@babel/types";

let toBuffer = require('blob-to-buffer')

function DSLForm() {
    const [inputString, setInputString] = useState('');
    //pictures stored in this const

    //each picture is a File type
    let [pictures, setPictures] = useState([]);

    let [errors, setErrorString] = useState('');

    let [picturesBufferMap, setPicturesBufferMap] = useState({});

    let [finalOutputPicture, setFinalOutputPicture] = useState(null);

    let [ebnf, setEBNF] = useState(null);

    let [example, setExample] = useState(null);

    useEffect(() => {
        fetch(EBNFMarkdown).then((res) => res.text()).then((text) => setEBNF(text));
        fetch(ExampleMarkdown).then((res) => res.text()).then((text) => setExample(text));
    }, []);

    const renderInput = async () => {
        //pass in the array of pictures (which is an array of File) to evaluator
        try {

            console.log(picturesBufferMap["communication.png"]);

            const tokenizer = PhotoTokenizer.createTokenizer(inputString);
            const parser = PhotoParser.createParser();
            const program = parser.parse(tokenizer);

            const validator = PhotoValidator.createValidator(picturesBufferMap);
            const validationError = validator.visit(program);

            if (validationError) {
                setErrorString(validationError);
                return;
            }

            const evaluator = PhotoEvaluator.createEvaluator({});
            setFinalOutputPicture(await evaluator.visit(program));
            setErrorString('');
        } catch (e) {
            setErrorString(e.message);
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

    const onDrop = (pictureArray: any[]) => {
        //replace the existing array

        convertAllToBuffer(pictureArray).then((done: any) => {
            let rawPhotos: { [key: string]: Buffer } = done;

            setPicturesBufferMap(rawPhotos);
            setPictures(pictureArray);
        });

    };

    const convertAllToBuffer = (pictureArray: any[]) => {

        return new Promise((resolve, reject) => {

            let promises: any = [];

            let rawPhotos: { [key: string]: Buffer } = {};

            for (let i = 0; i < pictureArray.length; i++) {

                let currentPicture: any = pictureArray[i]; //get the File

                let pictureName = currentPicture.name;

                promises.push(convertToBuffer(currentPicture).then((pictureBuffer: any) => {
                    rawPhotos[pictureName] = pictureBuffer;
                }));

            }

            Promise.all(promises).then(() => {
                resolve(rawPhotos)
            });

        })
    };


    const convertToBuffer = (imageBlob: Blob) => {

        return new Promise((resolve, reject) => {

            toBuffer(imageBlob, function (err, pictureBuffer: Buffer) {
                if (err) {
                    console.log("err: " + err);
                    throw err;
                }

                resolve(pictureBuffer);

            });

        });

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
        <div style={{textAlign: 'center'}}>
            <h1>PHOTO COLLAGE DSL PROGRAM</h1>
            <h2>CPSC 410 2020WT1</h2>
            <h3>Instructions:</h3>
            <div className="instructions-container">
                <p>
                    1. Upload any images you wish to use in your collage.<br />
                    2. Enter your program in the text area provided.<br />
                    3. Click Build Collage!<br /><br />

                    Remember that image names in your program must match the uploaded image name exactly!<br />
                </p>
            </div>
            <h3>EBNF:</h3>
            <div>
                <ReactMarkdown source={ebnf} className="markdown-container" />
            </div>
            <h3>Example usage:</h3>
            <div>
                <ReactMarkdown source={example} className="markdown-container" />
            </div>
            <h3> Upload your images here:</h3>
            <ImageUploader
                withIcon={false} // no point since you can't drag images to the icon to upload
                onChange={onDrop}
                label={'Maximum file size is 5MB. Accepted file extensions are jpg, png, and jpeg'}
                imgExtension={['.jpg', '.jpeg', '.png']}
                maxFileSize={5242880}
                withPreview={true}
                fileContainerStyle={{maxWidth: '25rem'}}
            />
            {renderFileNames()}
            <h3>Enter your program here:</h3>
            <form style={{paddingTop: '1rem'}} onSubmit={handleSubmit}>
                <textarea
                    style={{margin: 'auto', width: '36rem', height: '12rem'}}
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
                    style={{margin: 'auto', display: 'block', marginTop: '1rem'}}
                />
            </form>
            <h2 style={{color: 'red'}}>{errors}</h2>
            <div>{finalOutputPicture}</div>
        </div>
    );
}

export default DSLForm;
