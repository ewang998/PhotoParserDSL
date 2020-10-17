# Milestone Document

## Milestone 4 (October 9, 2020)

### Status of implementation
- tokenizer is completed
- frontend webpage with image upload is expected to be complete on October 10th
- parser is expected to be completed by October 9th
- evaluator and validator is going to be started this weekend

### Plans for final user study

- Eric and James will be conducting the final user studies. We hope to complete this
as soon as our implementation is complete

### Planned timeline for the remaining days
- Week of October 12 - continue/complete implementation. User studies will be conducted
immediately following implementation

- Weekend of October 12 - complete video presentation

### Group Member Tasks:
#### Eric:
- evaluator
#### Gordon:
- may still be some work on tokenizing
- frontend webpage to include image upload
#### James:
- parser
#### Maja:
- validator
#### Raghav:
- evaluator

### Updated EBNF:

```
PROGRAM      ::= CANVAS STATEMENT* "RENDER AS" FILENAME SEP
CANVAS       ::= "CANVAS" "WIDTH" int "HEIGHT" int "COLOR" COLOR SEP
COLOR        ::= ^#(?:[0-9a-fA-F]{3}){1,2}$

STATEMENT    ::= (PICTURE | CLONE | DRAW | MANIPULATION | WRITE | DEFINE) SEP
FILENAME     ::= \w+ "." EXT
EXT          ::= "png" | "jpeg" | "jpg"
IDENTIFIER   ::= [\w_]+
TEXT         ::= string
PICTURE      ::= "LET" FILENAME "BE" IDENTIFIER

// Throws an error if first identifier doesn’t exist
// Cannot reassign variables
CLONE        ::= "CLONE" (IDENTIFIER | "CANVAS") "AS" IDENTIFIER

// Uses relative placement (tries to fill everything into canvas?)
// REQUIRE IMAGES TO BE UNIQUE
// If we don’t have a "starting position", we try to place things in the middle if we can, and then build the image out
// Whatever we put on the canvas is fused to the canvas as a new image
// We don’t persist location/state

DRAW         ::= "DRAW TO CANVAS" (IDENTIFIER POSITION) ("," IDENTIFIER POSITION)*
WRITE        ::= "WRITE" TEXT ABSOLUTE_POSITION (IDENTIFIER | "CANVAS")
DEFINE       ::= "DECLARE" IDENTIFIER "AS" COMMAND ("AND" COMMAND)*
SEP          ::= ";"

POSITION ::= COORDINATE_POSITION | RELATIVE_POSITION IDENTIFIER
COORDINATE_POSITION ::= "AT" "X" int "Y" int
RELATIVE_POSITION ::= "ABOVE" | "BELOW" | "TO THE LEFT OF" | "TO THE RIGHT OF"
ABSOLUTE_POSITION ::= "AT THE BOTTOM OF" | "AT THE TOP OF" | "TO THE LEFT OF" | "TO THE RIGHT OF"

MANIPULATION ::= "APPLY" COMMAND "TO" ("CANVAS" | IDENTIFIER)
COMMAND      ::= "BLUR" | ROTATE | "GREYSCALE" | RESIZE | FLIP | BRIGHTNESS | "INVERT" | "NORMALIZE" | "SEPIA" | IDENTIFIER
FLIP         ::= "FLIP" ("HORIZONTAL" | "VERTICAL")
ROTATE       ::= "ROTATE" [0-360]
BRIGHTNESS   ::= "BRIGHTNESS" [-1,1]
RESIZE       ::= "RESIZE" "WIDTH" int "HEIGHT" int
BLUR         ::= "BLUR" "RADIUS" int
```

## Milestone 3 (October 2, 2020)

### Mockup of concrete language design:

```
PROGRAM    ::= "CANVAS" STATEMENT* "RENDER AS" FILENAME
CANVAS     ::= "CANVAS" int int COLOR
COLOR      ::= ^#(?:[0-9a-fA-F]{3}){1,2}$

STATEMENT  ::= PICTURE | CLONE | DRAW | MANIPULATION
FILENAME   ::= \w+ "." EXT
EXT        ::= "png" | "jpeg" | "jpg"
IDENTIFIER ::= [\w_]+
TEXT       ::= string
PICTURE    ::= "LET" FILENAME "BE" IDENTIFIER

// Throws an error if first identifier doesn’t exist
// Cannot reassign variables
CLONE      ::= "CLONE" (IDENTIFIER | "CANVAS") IDENTIFIER

// Uses relative placement (tries to fill everything into canvas?)
// REQUIRE IMAGES TO BE UNIQUE
// If we don’t have a "starting position", we try to place things in the middle if we can, and then build the image out
// Whatever we put on the canvas is fused to the canvas as a new image
// We don’t persist location/state

DRAW ::= "DRAW TO CANVAS" (IDENTIFIER POSITION ",")+
WRITE ::= "WRITE" TEXT POSITION (IDENTIFIER | "CANVAS")
DEFINE   ::= "DECLARE" IDENTIFIER "AS" FUNCTION ("AND" FUNCTION)*
FUNCTION ::= IDENTIFIER | COMMAND
SEP      ::= "\n"

POSITION ::= COORDINATE_POSITION | RELATIVE_POSITION IDENTIFIER
COORDINATE_POSITION ::= "AT" int int
RELATIVE_POSITION ::= "ABOVE" | "BELOW" | "TO THE LEFT OF" | "TO THE RIGHT OF"
(TODO: do we need another relative position for text, eg. place the text in the centre of an image)

MANIPULATION ::= COMMAND ("CANVAS" | IDENTIFIER)
COMMAND ::= "BLUR" | ROTATE | "GREYSCALE"" | RESIZE | FLIP | BRIGHTNESS | "INVERT" | "NORMALIZE" | "SEPIA" (can add more later)
FLIP ::= "FLIP" ("HORIZONTAL" | "VERTICAL")
ROTATE ::= "ROTATE" [0-360]
BRIGHTNESS ::= "BRIGHTNESS" [-1,1]
RESIZE ::= RESIZE int int
```

### User Study Notes
#### Instructions Given 
We gave our users the following syntax and instructions:
```
The following snippet of code:
1. Creates an 1000x1000 canvas.
2. Creates a small helper function to blur an image and then flip it.
3. Blurs and flips both of the given images.
4. Places the two images on the canvas, side by side, with "someImage" to the left of "anotherImage"
4. Greyscales the canvas
5. Places some text on the top of the canvas
6. Renders the image into the file "collage.png"

CANVAS 1000 1000 WHITE
LET "image1.png" BE someImage
LET "image2.png" BE anotherImage
DEFINE BLURANDFLIP BE BLUR AND FLIP 180
BLURANDFLIP someImage
BLURANDFLIP anotherImage
DRAW TO CANVAS someImage TO THE LEFT OF anotherImage
GREYSCALE CANVAS 50%
WRITE "Dog and Cat" AT THE TOP OF CANVAS
RENDER AS collage.png
```
Then, we asked them to complete either one or both of the following tasks:
- Using 3 photos(dog image, cat image, mouse image), create a pyramid photo collage with dog centered and at the top, cat below and to the left, and mouse below and to the right. Make the cat image black and white (greyscale). Add a description to the image, at the bottom of the photo collage ("this is an animal photo collage")
- Using 2 photos (dog image, cat image), lay them side by side. Have a background of size 1000 x 1000, light-blue. Define a function (method) to flip an image 180 degrees and make it black and white. Apply it to both the cat and the dog images, then draw both to the canvas.

#### User Study Notes
##### Raghav

- First user was a computer science student from UBC (early 20's male)
- Second user was a software engineer from Amazon (early 20's male)

Bad:
- Have function names separated by underscore
- Confusion about how to place images next to each other and where do they get placed exactly
- Should have BOTTOM position
- Had to assume what CENTER means and what it is used for
- Wasn’t sure about some keywords
- Conflicted about defining function name that might be the same as keywords

Good:
- Language is easy to use and very readable
- Not very strict on the specific ordering of code
- Straightforward to declare and assign images
- Not confused by DRAW and RENDER
- Knew what DRAW TO CANVAS meant

##### Maja

- User was a non-technical user (older woman in 40s w/out tech background)

Good:
- Overall, language made sense
- Variables were easy to pick up on, as well as functions. Single argument syntax made sense.
- Mutability of photos (once you color/greyscale a photo, it stays that way) was intuitive
- Positioning two images was easy

Bad:
- Difficult to understand how to place multiple images (did well with the second user study, but not the first, which required the user to place a series of images on the page)
- Would like a visual of the photo as manipulated

##### Gordon

- Non-technical user (1, Male early 20s)

Good:
- The variable definitions (eg LET xyz be "image1.png") was easy to understand

Bad:
- Wanted more examples and documentation about the language. 
- Does capitalization mean anything particular in the language?
- Confused about potential same key words meaning different things
- Relative positioning of images needed more thought (needed to think about the placements first before just writing the DSL)

Other:
- Additional features (which we didn’t include the in user study) such as contrast, lighting, sharpening etc.
- I asked if providing x/y coordinates would be helpful. He said while it could be more precise, it could also make it more confusing

### EBNF Changes

Based upon our user feedback, we made the following changes:

- Allowed variable & function names to have underscores
- Introduced coordinate placement on the canvas to allow more precision
- Created more features based upon JIMP’s offerings, and began to brainstorm some effects we could introduce as a stretch goal
- Made all positions relative rather than absolute for consistency


## Milestone 2 (September 25, 2020)

### Division of Responsibilities
A high level of the different tasks we have are in our [project board](https://github.students.cs.ubc.ca/cpsc410-2020w-t1/cpsc410_project1_team11/projects/1). We've moved current issues to `in progress`, and we will use github & slack to make sure all members are on track, with meetings on Thursday after we meet with the TA. We plan to work on most of this project at the same time during those weekly meetings, so most of our tasks are shared. However, we will split up development tasks once we're ready.
#### Raghav
- Create the initial user study form
- Help with user study
- Contribute to creating grammar
- Mock up DSL
- Manage and keep GitHub Issues updated
- Implementation of program

#### Gordon
- Help with user study
- Contribute to creating grammar
- Mock up DSL
- Implementation of program

#### Eric
- Help with user study
- Contribute to creating grammar
- Mockup DSL
- Implementation of program

#### Maja

- Bootstrap TypeScript & React App
- Help with user study
- Contribute to creating grammar
- Mockup DSL
- Implementation of program

#### James
- Help with user study
- Contribute to creating grammar
- Mockup DSL
- Implementation of program
### Project Roadmap

#### Week-By-Week
##### Week 3

- [x] Finalize APIs -> [jimp](https://www.npmjs.com/package/jimp)
- [ ] Finalize features of DSL (what users can do)
- [x] Create draft for first user study [here](https://docs.google.com/document/d/14LNGf1PBPJfkS_2CZtVtj3PGjhRWfNiCyQs7xm2liVo/edit?usp=sharing)
- [x] Create project stub and initialize packages/files
- [x] Integrate and import JIMP API into project

##### Week 4

- Mockup of concrete language design

  - EBNF/Grammar
  - Tokenizing

- Conduct first user study
- Research how to conduct unbiased user studies
- Add notes and modify DSL from user study feedbacks
- Implement project using React or React with TypeScript
- Use GitHub Issues to keep track of task and features

##### Week 5

- Plans for final user study
- Nearing the final implementations of our project

#### Summary of Progress So Far:

- Researched and finalized APIs
  - [jimp](https://www.npmjs.com/package/jimp#methods)
  - [jimp GitHub](https://github.com/oliver-moran/jimp)
  - Possibly [image-js](https://www.npmjs.com/package/image-js)
- Selected project management tool and organized project using Github Issues
- Created Slack group to organize project and communicate with team members
- Bootstrapped repo

### Final features that we want to include from [JIMP](https://github.com/oliver-moran/jimp):

- blurring
- color
- composite (this builds the photo collage by overlaying)
- crop
- flip
- invert
- mask
- print
- resize
- rotate
- scale

Note: Certain functionality, such as creating borders around images, can be accomplished using DSL macros/functions. This can be researched during the user study.

## Milestone 1 (September 18th 2020):

###### Brief description of planned DSL idea

We want to create a photo collage builder DSL. Users would be able to import images to the program, manipulate the images by adding effects, build a photo collage, and export it. We chose this idea because there is a lot of flexibility in the program for the user to create different photo collages with various effects to the photos.

###### Tentative Features

- Allow users to create a collage from an arbitrary number of photos
- Allow users to specify features like background, background colour, text, effects, position of images, etc.
- Support basic photo manipulation effects like blur, crop, resize, etc.
- Support basic loops, so users can repeat effects and tessellate photos
- Allow users to represent different photos as variables, for easy reuse & manipulation
- Allow users to define their own functions so they can easily reuse sets of commands

###### Notes from TA discussion

- Idea is overall very promising
- The TA suggested we think about adding additional photo manipulation features. For example, the ability to to make an image black and white, adding effects to images
- If leveraging APIs to do the basic image manipulation, then we should try to include as many features as possible
- Animation would be a cool bonus (but not required). We imagine that we can do this by allowing users to create gifs.
- Reusable macros and variables are what make this idea viable
  - E.g. macros
    - blur() blur image
    - repeat(x) repeat previous command x times
  - E.g. variables
    - LET "image1.png" be dogImage
    - LET "image2.png" be catImage

###### Follow-up tasks

- JavaScript/TypeScript, need to decide on the npm libraries we will leverage so we can concretely define what photo effects to support
- Clear definitions of functionality and behaviour (e.g. can images overlap?)
- Research on APIs and libraries to manipulate photos, etc.
- Start thinking about DSL structure and mock implementation

```
Sample DSL:

LET "image1.png" be dogImage

LET "image2.png" be catImage

LET "image3.png" be backgroundImage

SIZE 1000 1000

BACKGROUND COLOUR #FFFFFF // or some predefined colours

PLACE dogImage TO THE LEFT OF catImage

TEXT "Dog and Cat" AT THE TOP

TEXT "Very Cute!" AT THE BOTTOM

OVERLAY backgroundImage //overlays background image under foreground
```
