# universe

## Publish update to NPM

1. Update version in `package.json`
2. Run command `npm run publish-npm-module`

## Test in `index.html`

1. Comment out the following lines in `editor.js`
```
import './prism/prism.js';
import './prism/prism-sql.min.js';
```
2. Uncomment the script additions in the `row-text-content.js` file, within the `constructor()` function.