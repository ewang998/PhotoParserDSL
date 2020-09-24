# Milestone Document

## Milestone 2 (Spetember 25, 2020)

###### Division of Responsibilities

Raghav

- Create the initial user study form
- Help with user study
- Contribute to creating grammar
- Mock up DSL
- Manage and keep GitHub Issues updated
- Implementation of program

Gordon

- Help with user study
- Contribute to creating grammar
- Mock up DSL
- Implementation of program

Eric

- Help with user study
- Contribute to creating grammar
- Mockup DSL
- Implementation of program

Maja

- Bootstrap TypeScript & React App
- Help with user study
- Contribute to creating grammar
- Mockup DSL
- Implementation of program

James
- Help with user study
- Contribute to creating grammar
- Mockup DSL
- Implementation of program

###### Project Roadmap:

Week 3

- Finalize APIs -> [jimp](https://www.npmjs.com/package/jimp)
- Finalize features of DSL (what users can do)
- Create project stub and initialize packages/files
- Integrate and import JIMP API into project

Week 4

- Mockup of concrete language design

  - EBNF/Grammar
  - Tokenizing

- Conduct first user study
- Research how to conduct unbiased user studies
- Add notes and modify DSL from user study feedbacks
- Implement project using React or React with TypeScript
- Use GitHub Issues to keep track of task and features

Week 5

- Plans for final user study
- Nearing the final implementations of our project

###### Summary of Progress So Far:

- Researched and finalized APIs
  - [jimp](https://www.npmjs.com/package/jimp#methods)
  - [jimp GitHub](https://github.com/oliver-moran/jimp)
  - Possibly [image-js](https://www.npmjs.com/package/image-js)
- Selected project management tool and organized project using Github Issues
- Created Slack group to organize project and communicate with team members
- Bootstrapped repo

###### Final features that we want to include from [JIMP](https://github.com/oliver-moran/jimp):

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
    - LET “image1.png” be dogImage
    - LET “image2.png” be catImage

###### Follow-up tasks

- JavaScript/TypeScript, need to decide on the npm libraries we will leverage so we can concretely define what photo effects to support
- Clear definitions of functionality and behaviour (e.g. can images overlap?)
- Research on APIs and libraries to manipulate photos, etc.
- Start thinking about DSL structure and mock implementation

```
Sample DSL:

LET “image1.png” be dogImage

LET “image2.png” be catImage

LET “image3.png” be backgroundImage

SIZE 1000 1000

BACKGROUND COLOUR #FFFFFF // or some predefined colours

PLACE dogImage TO THE LEFT OF catImage

TEXT “Dog and Cat” AT THE TOP

TEXT “Very Cute!” AT THE BOTTOM

OVERLAY backgroundImage //overlays background image under foreground
```
