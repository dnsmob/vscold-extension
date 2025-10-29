const esbuild = require('esbuild');

const production = process.argv.includes('--production');

async function main() {
	const ctx = await esbuild.context({
		entryPoints: ['src/extension.ts'],
		bundle: true,
		format: 'cjs',
		minify: production,
		sourcemap: !production,
		sourcesContent: false,
		platform: 'node',
		outfile: 'out/extension.js',
		external: ['vscode'],
		logLevel: 'silent',
		drop: production ? ['console', 'debugger'] : [],
		plugins: [
			{
				name: 'watch-plugin',
				setup(build) {
					build.onEnd(result => {
						if (result.errors.length === 0) {
							console.log('Build succeeded');
						}
					});
				}
			}
		]
	});

	if (process.argv.includes('--watch')) {
		await ctx.watch();
		console.log('Watching for changes...');
	} else {
		await ctx.rebuild();
		await ctx.dispose();
	}
}

main().catch(e => {
	console.error(e);
	process.exit(1);
});
