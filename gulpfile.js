const
	fs = require('fs'),
	path = require('path'),
	gulp = require('gulp'),
	plumber = require('gulp-plumber'),
	closureCompiler = require('google-closure-compiler').gulp(),
	httpServer = require('http-server');

gulp.task('js_client', done => {
	let task = gulp.src([
		'client.js'
	]).pipe(plumber());
	if (process.env.DEV != 'true')
		task = task.pipe(closureCompiler({
			compilation_level: 'SIMPLE',
			js_output_file: 'client.js'
		}, { platform: ['native', 'java', 'javascript'] }));
	task.pipe(gulp.dest('dist/js')).on('end', () => done());
});
gulp.task('js_lib', done => {
	let task = gulp.src([
		'src/js/globalStorage.js'
	]).pipe(plumber());
	if (process.env.DEV != 'true')
		task = task.pipe(closureCompiler({
			compilation_level: 'SIMPLE',
			js_output_file: 'globalStorage.js'
		}, { platform: ['native', 'java', 'javascript'] }));
	task.pipe(gulp.dest('dist/js')).on('end', () => done());
});
gulp.task('html', async () => {
	if (process.env.DEV != 'true')
		return;
	httpServer.createServer({ cache: -1 }).listen(3000);
	gulp.watch('client*.js', gulp.series('js_client'));
	gulp.watch('src/js/**/*.js', gulp.series('js_lib'));
});
gulp.task('default', gulp.series('js_client', 'js_lib', 'html'));
