import EBNFMarkdown from '../EBNF.md';
import ExampleMarkdown from '../Example.md';
import './DSLForm.css';

import React, {FormEvent, useEffect, useState} from 'react';
import ReactMarkdown from 'react-markdown';
import PhotoParser from '../lib/Parser/PhotoParser';
import PhotoTokenizer from '../lib/Tokenizer/PhotoTokenizer';
import PhotoEvaluator from '../lib/Visitor/PhotoEvaluator';
import ImageUploader from 'react-images-upload';
import PhotoValidator from '../lib/Visitor/PhotoValidator';

import Jimp from 'jimp';

let toBuffer = require('blob-to-buffer');

function DSLForm() {
    const [inputString, setInputString] = useState('');
    //pictures stored in this const

    //each picture is a File type
    let [pictures, setPictures] = useState([]);

    let [errors, setErrorString] = useState('');

    let [picturesBufferMap, setPicturesBufferMap] = useState({});

    let [finalOutputPictureBase64, setFinalOutputPictureBase64] = useState('');
    let [finalOutputPictureMIME, setFinalOutputPictureBase64MIME] = useState('');

    let [filename, setFileName] = useState('');

    let [ebnf, setEBNF] = useState(null);

    let [example, setExample] = useState(null);

    useEffect(() => {
        fetch(EBNFMarkdown).then((res) => res.text()).then((text) => setEBNF(text));
        fetch(ExampleMarkdown).then((res) => res.text()).then((text) => setExample(text));
    }, []);

    const renderInput = async () => {
        //pass in the array of pictures (which is an array of File) to evaluator
        try {

            const tokenizer = PhotoTokenizer.createTokenizer(inputString);
            const parser = PhotoParser.createParser();
            const program = parser.parse(tokenizer);

            const validator = PhotoValidator.createValidator(picturesBufferMap);
            const validationError = validator.visit(program);

            if (validationError) {
                setErrorString(validationError);
                return;
            }

            const evaluator = PhotoEvaluator.createEvaluator(picturesBufferMap);

            let image: Jimp = await evaluator.visit(program);

            // let imageBuffer: Buffer = await image.getBufferAsync(image.getMIME()); //TODO
            let imageBuffer: Buffer = await image.getBufferAsync(Jimp.MIME_PNG);

            let imageBase64: string = imageBuffer.toString('base64');

            setFinalOutputPictureBase64(imageBase64);
            //setFinalOutputPictureBase64MIME(image.getMIME());
            setFinalOutputPictureBase64MIME(Jimp.MIME_PNG); //TODO

            setFileName(program.filename);
            setErrorString('');
        } catch (e) {
            setErrorString(e.message);
        }

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

    const renderFinalImage = () => {

        if (finalOutputPictureBase64 !== '' && finalOutputPictureMIME !== '') {
            return <img src={`data:${finalOutputPictureMIME};base64,${finalOutputPictureBase64}`}
                        alt={"finalOutputImage"}/>
        } else {
            return <div/>
        }
    };

    const downloadFinalImage = () => {
        if (finalOutputPictureMIME !== '' && finalOutputPictureBase64 !== '') {
            const linkSource = `data:${finalOutputPictureMIME};base64,${finalOutputPictureBase64}`;
            const downloadLink = document.createElement("a");
            downloadLink.href = linkSource;
            downloadLink.download = filename;
            downloadLink.click();
        }
    };

    return (
        <div style={{textAlign: 'center'}}>
            <h1>PHOTO COLLAGE DSL PROGRAM</h1>
            <h2>CPSC 410 2020WT1</h2>
            <h3>Instructions:</h3>
            <div className="instructions-container">
                <p>
                    1. Upload any images you wish to use in your collage.<br/>
                    2. Enter your program in the text area provided.<br/>
                    3. Click Build Collage!<br/><br/>

                    Remember that image names in your program must match the uploaded image name exactly!<br/>
                </p>
            </div>
            <h3>EBNF:</h3>
            <div>
                <ReactMarkdown source={ebnf} className="markdown-container"/>
            </div>
            <h3>Example usage:</h3>
            <div>
                <ReactMarkdown source={example} className="markdown-container"/>
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
                    }}
                />
                <input
                    type="submit"
                    value="Build Collage!"
                    style={{margin: 'auto', display: 'block', marginTop: '1rem'}}
                />
            </form>
            <h2 style={{color: 'red'}}>{errors}</h2>
            <div>{renderFinalImage()}</div>
            <button onClick={downloadFinalImage}>Download collage!</button>
        </div>
    );
}

export default DSLForm;
