const esbuild = require('esbuild');

const isProduction = process.argv.includes('production');
const isWatch = process.argv.includes('watch');

/** @type {import('esbuild').BuildOptions} */
const buildOptions = {
  entryPoints: ['./src/extension.ts'],
  bundle: true,
  outfile: './out/extension.js'
  platform: 'node',
  target: 'node14',
  format: 'cjs',
  external: ['vscode'], // Required for VSCode extensions
  minify: isProduction, // Minify in production mode
  sourcemap: !isProduction,
  tsconfig: './tsconfig.json',
  logLevel: 'info',
  // Production optimizations
  ...(isProduction && {
    drop: ['console', 'debugger'],
    treeShaking: true,
    legalComments: 'none',
    mangleProps: /^_/,
    minifyIdentifiers: true,
    minifySyntax: true,
    minifyWhitespace: true
  })
};

async function build() {
  try {
    if (isWatch) {
      const ctx = await esbuild.context(buildOptions);
      await ctx.watch();
      console.log('👀 Watching for changes...');
    } else {
      await esbuild.build(buildOptions);
      console.log(`✨ Build complete ${isProduction ? '(production)' : '(development)'}`);
    }
  } catch (err) {
    console.error('❌ Build failed:', err);
    process.exit(1);
  }
}

build();