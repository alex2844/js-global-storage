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
	if (typeof(closureCompiler) != 'undefined')
		task = task.pipe(closureCompiler({
			compilation_level: 'SIMPLE',
			js_output_file: 'globalStorage.js'
		}, { platform: ['native', 'java', 'javascript'] }));
	task.pipe(gulp.dest('dist/js')).on('end', () => done()).pipe(browserSync.stream());
});
gulp.task('html', done => {
	browserSync.init({ server: './' });
	gulp.watch('src/js/**/*.js', gulp.series('js'));
	gulp.watch('*.html').on('change', () => {
		browserSync.reload();
		done();
	});
	done();
});
gulp.task('default', gulp.series('js', 'html'));
