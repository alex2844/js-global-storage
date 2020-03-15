const
	fs = require('fs'),
	path = require('path'),
	gulp = require('gulp'),
	plumber = require('gulp-plumber'),
	closureCompiler = require('google-closure-compiler').gulp(),
	browserSync = require('browser-sync').create();

gulp.task('js', done => {
	let task = gulp.src([
		'src/js/globalStorage.js'
	]).pipe(plumber());
	if (process.env.COMPILER != 'false')
		task = task.pipe(closureCompiler({
			compilation_level: 'SIMPLE',
			js_output_file: 'globalStorage.js'
		}, { platform: ['native', 'java', 'javascript'] }));
	task.pipe(gulp.dest('dist/js')).on('end', () => done()).pipe(browserSync.stream());
});
gulp.task('html', async () => {
	if (process.env.DEV != 'true')
		return;
	browserSync.init({ server: './' });
	gulp.watch('src/js/**/*.js', gulp.series('js'));
	gulp.watch('*.html').on('change', () => browserSync.reload());
});
gulp.task('default', gulp.series('js', 'html'));
