# JSDoc Folder

Automatically collapses JSDoc comment blocks by default when opening JavaScript and TypeScript files.

## Why This Extension?

JSDoc comments can take up significant vertical space in your code editor. Long documentation blocks often make it harder to navigate and understand the actual code structure. This extension solves that problem by automatically folding JSDoc comments while preserving their first line, giving you the best of both worlds:

## Features

- Automatically folds JSDoc comment blocks when opening files
- Preserves the first line (/** */) for visibility
- Supports both JavaScript and TypeScript files
- Configurable through VS Code settings

## Usage

JSDoc comments will be automatically folded when you open a file:

```javascript
/** This line stays visible
 * These lines will be
 * automatically folded
 * when you open the file
 */
function example() {}
```

## Configuration

You can configure the extension through VS Code settings:

1. Open VS Code Settings (⌘, on macOS or Ctrl+, on Windows/Linux)
2. Search for "JSDoc Folder"
3. Find the following settings:

* `jsdocFolder.autoFold`: Enable/disable automatic folding of JSDoc comments
  * `true` (default): Automatically fold JSDoc comments when opening files
  * `false`: Leave JSDoc comments unfolded

You can also directly edit settings.json:

## Requirements

- Visual Studio Code ^1.80.0
- Node.js >= 14.x

## Development

1. Clone the repository:
```bash
git clone https://github.com/aydgn/fold-jsdoc.git
cd fold-jsdoc
```

2. Install dependencies:
```bash
bun install
# or
npm install
```

3. Open VS Code:
```bash
code .
```

4. Press F5 to launch the Extension Development Host
   - This opens a new VS Code window with your extension loaded
   - Open any JavaScript/TypeScript file with JSDoc comments to test

## Building and Testing

1. Package the extension:
```bash
bun run package
# or
npm run package
```

2. The above command will generate a `.vsix` file that you can install locally:
```bash
code --install-extension fold-jsdoc-0.0.1.vsix
```

## License

[MIT](LICENSE)