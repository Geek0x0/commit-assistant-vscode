const esbuild = require('esbuild');

const isProduction = process.argv.includes('--production');
const isWatch = process.argv.includes('--watch');

async function main() {
  const ctx = await esbuild.context({
    entryPoints: ['src/extension.ts'],
    bundle: true,
    external: ['vscode'],
    format: 'cjs',
    target: 'ES2022',
    outfile: 'out/extension.js',
    sourcemap: !isProduction,
    minify: isProduction,
    platform: 'node',
    logLevel: 'info',
    plugins: [
      /* add plugins here */
    ],
  });
  if (isWatch) {
    await ctx.watch();
  } else {
    await ctx.rebuild();
    await ctx.dispose();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
