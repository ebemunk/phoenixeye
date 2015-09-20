var gulp = require('gulp');
var plumber = require('gulp-plumber');

//utility
var concat = require('gulp-concat');
var sourcemaps = require('gulp-sourcemaps');

//js
var uglify = require('gulp-uglify');
var iife = require('gulp-iife');

//less
var less = require('gulp-less');
var lessPluginGlob = require('less-plugin-glob');
var postcss = require('gulp-postcss');
var autoprefixer = require('autoprefixer');
var mqpacker = require('css-mqpacker');
var csswring = require('csswring');

//html
var angularTemplateCache = require('gulp-angular-templatecache');
var minifyHTML = require('gulp-minify-html');

//dev
var browserSync = require('browser-sync');
var nodemon = require('gulp-nodemon');

var files = {
	js: {
		dependencies: [
			//angular stuff
			'bower_components/jquery/dist/jquery.js',
			'bower_components/angular/angular.js',
			'bower_components/angular-animate/angular-animate.js',
			'bower_components/angular-sanitize/angular-sanitize.js',

			//3rd party libs
			'bower_components/angular-ui-router/release/angular-ui-router.js',
			'bower_components/angular-filter/dist/angular-filter.js',
			'bower_components/ng-file-upload/ng-file-upload.js',
			'bower_components/ngmap/build/scripts/ng-map.js',
			'bower_components/ngtoast/dist/ngToast.js',
			'bower_components/angular-loading-bar/build/loading-bar.js',
			'bower_components/nouislider/distribute/nouislider.js',
			'bower_components/angular-local-storage/dist/angular-local-storage.js',

			// 'bower_components/three.js/three.js',
			'bower_components/fuse/src/fuse.js',
			'node_modules/bluebird/js/browser/bluebird.js',

			//bootstrap & related
			'bower_components/angular-bootstrap/ui-bootstrap-tpls.js'
		],
		debug: [
			'bower_components/visionmedia-debug/dist/debug.js'
		],
		app: [
			'client/phoenixeye.module.js',
			'client/config/*.js',
			'client/**/*.js',
			'!client/dist/*',
			'!client/test/*'
		]
	},
	less: {
		main: [
			'client/phoenixeye.less'
		],
		app: [
			'client/**/*.less'
		]
	},
	html: {
		main: [
			'client/index.html'
		],
		app: [
			'client/**/*.html',
			'!client/index.html'
		]
	}
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

gulp.task('js-cli', function () {
	return gulp.src(files.js.app)
		.pipe(plumber())
		.pipe(sourcemaps.init())
		.pipe(iife())
		.pipe(uglify())
		.pipe(concat('phoenixeye.js'))
		.pipe(sourcemaps.write('.'))
		.pipe(gulp.dest('client/dist'))
	;
});

gulp.task('js', ['js-deps', 'js-debug', 'js-cli']);

gulp.task('html', function() {
	return gulp.src(files.html.app)
		.pipe(plumber())
		.pipe(minifyHTML({
			empty: true
		}))
		.pipe(angularTemplateCache({
			standalone: true
		}))
		.pipe(iife())
		.pipe(uglify())
		.pipe(gulp.dest('client/dist'));
});

gulp.task('less', function () {
	/*eslint no-console: 0*/

	return gulp.src(files.less.main)
		.pipe(plumber())
		.pipe(sourcemaps.init())
		.pipe(less({
			plugins: [
				lessPluginGlob
			]
		}).on('error', function (err) {
			console.log(err);
			this.emit('end');
		}))
		.pipe(postcss([
			autoprefixer({
				browsers: ['last 2 versions']
			}),
			mqpacker,
			csswring({
				removeAllComments: true
			})
		]))
		.pipe(sourcemaps.write('.'))
		.pipe(gulp.dest('client/dist'))
        .pipe(browserSync.stream({match: '**/*.css'}))
	;
});

gulp.task('fonts', function() {
	return gulp.src('bower_components/font-awesome/fonts/*')
	.pipe(gulp.dest('client/dist/fonts'));
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

	gulp.watch(files.js.app, ['js-cli', browserSync.reload]);
	gulp.watch(files.less.app, ['less']);
	gulp.watch(files.html.app, ['html', browserSync.reload]);
	gulp.watch(files.html.main).on('change', browserSync.reload);
});

gulp.task('default', ['js', 'less', 'html', 'fonts']);