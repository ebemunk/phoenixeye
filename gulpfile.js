var gulp = require('gulp');
var plumber = require('gulp-plumber');

var concat = require('gulp-concat');
var sourcemaps = require('gulp-sourcemaps');

var less = require('gulp-less');
var minifyCSS = require('gulp-minify-css');
var autoprefixer = require('gulp-autoprefixer');

var browserSync = require('browser-sync');

var files = {
	js: [
		'bower_components/angular/angular.min.js',
		'bower_components/angular-ui-router/release/angular-ui-router.min.js',
		'client/js/phoenixeye.js',
		'client/js/*'
	],
	less: [
		'client/less/*'
	],
	html: [
		'client/index.html',
		'client/templates/*'
	]
};

gulp.task('js', function () {
	return gulp.src(files.js)
		.pipe(plumber())
		.pipe(sourcemaps.init())
		.pipe(concat('phoenixeye.js'))
		.pipe(sourcemaps.write('.'))
		.pipe(gulp.dest('client/dist'))
	;
});

gulp.task('less', function () {
	return gulp.src(files.less)
		.pipe(plumber())
		.pipe(sourcemaps.init())
		.pipe(less())
		.pipe(minifyCSS())
		.pipe(autoprefixer()).pipe(concat('styles.css'))
		.pipe(sourcemaps.write('.'))
		.pipe(gulp.dest('client/dist'))
	;
});

gulp.task('browser-sync', function () {
	browserSync({
		proxy: 'localhost:3000',
		ui: false,
		open: false
	});
});

gulp.task('watch', ['browser-sync'], function () {
	gulp.watch(files.js, ['js', browserSync.reload]);
	gulp.watch(files.less, ['less', browserSync.reload]);
	gulp.watch(files.html).on('change', browserSync.reload);
});

gulp.task('default', ['js', 'less']);