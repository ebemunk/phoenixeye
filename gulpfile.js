var gulp = require('gulp');
var plumber = require('gulp-plumber');

var concat = require('gulp-concat');
var sourcemaps = require('gulp-sourcemaps');

var uglify = require('gulp-uglify');

var less = require('gulp-less');
var minifyCSS = require('gulp-minify-css');
var autoprefixer = require('gulp-autoprefixer');

var browserSync = require('browser-sync');
var nodemon = require('gulp-nodemon');

var files = {
	js: {
		dependencies: [
			//angular stuff
			'bower_components/jquery/dist/jquery.min.js',
			'bower_components/angular/angular.min.js',
			'bower_components/angular-animate/angular-animate.min.js',
			'bower_components/angular-sanitize/angular-sanitize.min.js',

			//3rd party libs
			'bower_components/angular-ui-router/release/angular-ui-router.min.js',
			'bower_components/ng-file-upload/ng-file-upload.min.js',
			'bower_components/ngtoast/dist/ngToast.min.js',
			'bower_components/ngmap/build/scripts/ng-map.js',
			'bower_components/angular-loading-bar/build/loading-bar.js',
			'bower_components/angular-filter/dist/angular-filter.js',

			'bower_components/three.js/three.js',
			'bower_components/fuse/src/fuse.min.js',

			//bootstrap & related
			'bower_components/angular-bootstrap/ui-bootstrap-tpls.min.js',
			'bower_components/seiyria-bootstrap-slider/dist/bootstrap-slider.min.js'

		],
		debug: [
			'bower_components/visionmedia-debug/dist/debug.js',
		],
		files: [
			'client/js/phoenixeye.js',
			'client/js/**/*.js'
		]
	},
	less: [
		'client/less/*.less'
	],
	css: [
		'bower_components/seiyria-bootstrap-slider/dist/css/bootstrap-slider.css',
		'bower_components/angular-loading-bar/build/loading-bar.css',
	],
	html: [
		'client/index.html',
		'client/html/**/*.html'
	]
};

gulp.task('js-deps', function () {
	return gulp.src(files.js.dependencies)
		.pipe(plumber())
		.pipe(concat('dependencies.js'))
		.pipe(uglify())
		.pipe(gulp.dest('client/dist'))
	;
});

gulp.task('js-debug', function () {
	return gulp.src(files.js.debug)
		.pipe(plumber())
		.pipe(concat('debug.js'))
		.pipe(uglify())
		.pipe(gulp.dest('client/dist'))
	;
});

gulp.task('js', function () {
	return gulp.src(files.js.files)
		.pipe(plumber())
		.pipe(sourcemaps.init())
		.pipe(concat('phoenixeye.js'))
		.pipe(uglify())
		.pipe(sourcemaps.write('.'))
		.pipe(gulp.dest('client/dist'))
	;
});

gulp.task('less', function () {
	return gulp.src(files.less)
		.pipe(plumber())
		.pipe(sourcemaps.init())
		.pipe(less())
		.pipe(minifyCSS({
			keepSpecialComments: 0
		}))
		.pipe(autoprefixer())
		.pipe(concat('phoenixeye.css'))
		.pipe(sourcemaps.write('.'))
		.pipe(gulp.dest('client/dist'))
	;
});

gulp.task('css-deps', function () {
	return gulp.src(files.css)
		.pipe(plumber())
		.pipe(minifyCSS({
			keepSpecialComments: 0
		}))
		.pipe(autoprefixer())
		.pipe(concat('dependencies.css'))
		.pipe(gulp.dest('client/dist'))
	;
});

gulp.task('fonts', function() {
	return gulp.src('bower_components/font-awesome/fonts/*')
	.pipe(gulp.dest('client/fonts'));
});

gulp.task('nodemon', function () {
	return nodemon({
		script: 'server/server.js',
		watch: [
			'server'
		]
	});
});

gulp.task('watch', ['nodemon'], function () {
	browserSync({
		proxy: 'localhost:3000',
		ui: false,
		open: false,
		port: 3001
	});

	gulp.watch(files.js.files, ['js', browserSync.reload]);
	gulp.watch(files.less, ['less', browserSync.reload]);
	gulp.watch(files.html).on('change', browserSync.reload);
});

gulp.task('default', ['js-deps', 'js-debug', 'js', 'less', 'css-deps', 'fonts']);