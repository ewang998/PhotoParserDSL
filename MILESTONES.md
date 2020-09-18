Add entries to this file summarising each project milestone. Don't forget that these need to have been discussed with your TA before the milestone deadline; also, remember to commit and push them by then!

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

