# The Photo Project

## We Made a DSL

We're developing one.

- [Milestones Document](./MILESTONES.md)
- [Meeting Notes](./MEETING_NOTES.md)

## Development

### Prereqs

- Node v14.3.0

### Commands

- `npm start`: Run the webpage. By default, spun up on port 3000.
- `npm run test`: Runs our jest tests.
- `npm run build`: Compiles the app.

### File Structure

```bash
├── src
│   ├── lib (DSL logic)
│   │   ├── ast ("word" nodes)
│   │   ├── Parser
│   │   └── Tokenizer
│   ├── components (react components)
│   ├── index.html
│   └── partials/template
├── public
├── build
└── node_modules
```
