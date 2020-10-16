# The Rundown

## EBNF

## Correctness Properties

- A variable may be a "function" type or a "photo" type. Once a variable has been declared, it is typed.
- Variables cannot be redefiend. A variable must be defined to be used.
- A photo file must be provided to be used, i.e. to declare a photo variable from the file `photo1.jpg`, the programmer must provide a photo named `photo1.jpg`.
- Variable names are case sensitive.
- The "compiler" does not safeguard against blind recursion. The program does not type check this. The programmer is responsible for making these checks.
