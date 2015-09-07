// ------------ZELL Jade PostCss v1.0.0 03.09.2015---------------------
// Zell Starter Kit / Webkit / Jade / PostCss / Lost / Gzip
// incl. gulp-jade, gulp-minify-html (aktiv, vgl Webkit), gulp-postcss, lost, gulp-size (passiv)
// --------------------------------------------------------------------

// For optimization:
// --------------------------------------------------------------------
// Removing unused CSS with unCSS
// Further optimizing CSS with CSSO
// Generating inline CSS for performance with Critical
// Deployment to your production server automatically with gulp-rync
// --------------------------------------------------------------------


var gulp          = require('gulp'),
    postcss       = require("gulp-postcss"),
    sass          = require('gulp-sass'),
    autoprefixer  = require('gulp-autoprefixer'),
    sourcemaps    = require('gulp-sourcemaps'),
    jade          = require('gulp-jade'),
    minifyHtml    = require('gulp-minify-html'),
    browserSync   = require('browser-sync'),
    useref        = require('gulp-useref'),
    uglify        = require('gulp-uglify'),
    gulpIf        = require('gulp-if'),
    minifyCSS     = require('gulp-minify-css'),
    imagemin      = require('gulp-imagemin'),
    cache         = require('gulp-cache'),
    size          = require('gulp-size'),
    lost          = require('lost'),
    del           = require('del'),
    runSequence   = require('run-sequence');


// --------------------------------------------------------------------
// Basic Gulp task syntax
// --------------------------------------------------------------------

gulp.task('hello', function() {
  console.log('Hello Zell!');
})


// --------------------------------------------------------------------
// Development Tasks
// --------------------------------------------------------------------

// --------------------------------------------------------------------
// Task: Start browserSync server
// --------------------------------------------------------------------

gulp.task('browserSync', function() {
  browserSync({
    server: {
      baseDir: 'app'
    }
  })
})


// --------------------------------------------------------------------
// Task: Jade Templating
// --------------------------------------------------------------------

gulp.task('templating', function() {
  var opts = {
    conditionals: true,
    spare: true
  };
  return gulp.src('app/templates/*.jade')
    .pipe(jade({
        pretty: true
    }))
    .pipe(gulp.dest('app'))
    .pipe(browserSync.reload({stream:true}));
});


// --------------------------------------------------------------------
// Task: Styles
// --------------------------------------------------------------------

gulp.task('sass', function() {
  return gulp.src('app/scss/**/*.scss') // Gets all files ending with .scss in app/scss and children dirs
    .pipe(sourcemaps.init())
    .pipe(sass()) // Passes it through a gulp-sass
    .pipe(postcss([
      lost()
    ]))
    .pipe(autoprefixer('last 2 version', 'ie 9'))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('app/css')) // Outputs it in the css folder
    .pipe(browserSync.reload({ // Reloading with Browser Sync
      stream: true
    }));
})


// --------------------------------------------------------------------
// Task: Watch
// --------------------------------------------------------------------

gulp.task('watch', function() {
  gulp.watch('app/templates/**/*.jade', ['templating']);
  gulp.watch('app/scss/**/*.scss', ['sass']);
  gulp.watch('app/*.html', browserSync.reload);
  gulp.watch('app/js/**/*.js', browserSync.reload);
})


// --------------------------------------------------------------------
// Optimization Tasks
// --------------------------------------------------------------------

// --------------------------------------------------------------------
// Optimizing CSS and JavaScript and html
// --------------------------------------------------------------------

gulp.task('useref', function() {
  var assets = useref.assets();

  return gulp.src('app/*.html')
    .pipe(assets)
    // Minifies only if it's a CSS file
    .pipe(gulpIf('*.css', minifyCSS()))
    // Uglifies only if it's a Javascript file
    .pipe(gulpIf('*.js', uglify()))
    .pipe(assets.restore())
    .pipe(useref())
    // Minify any HTML
    .pipe(gulpIf('*.html', minifyHtml()))
    .pipe(gulp.dest('dist'))
});


// --------------------------------------------------------------------
// Optimizing Images
// --------------------------------------------------------------------

gulp.task('images', function() {
  return gulp.src('app/images/**/*.+(png|jpg|jpeg|gif|svg)')
  // Caching images that ran through imagemin
  .pipe(cache(imagemin({
      interlaced: true,
    })))
  .pipe(gulp.dest('dist/images'))
});


// --------------------------------------------------------------------
// Copying fonts
// --------------------------------------------------------------------

gulp.task('fonts', function() {
  return gulp.src('app/fonts/**/*')
  .pipe(gulp.dest('dist/fonts'))
})


// --------------------------------------------------------------------
// Cleaning
// --------------------------------------------------------------------

gulp.task('clean', function(callback) {
  del('dist');
  return cache.clearAll(callback);
})

gulp.task('clean:dist', function(callback) {
  del(['dist/**/*', '!dist/images', '!dist/images/**/*'], callback)
});


// --------------------------------------------------------------------
// Task: Default Development
// --------------------------------------------------------------------

gulp.task('default', function(callback) {
  runSequence(['templating', 'sass', 'browserSync', 'watch'],
    callback
  )
})


// --------------------------------------------------------------------
// Task: Build Sequence
// --------------------------------------------------------------------

gulp.task('build', function(callback) {
  runSequence('clean:dist',
    ['templating', 'sass', 'useref', 'images', 'fonts'],
    callback
  )
})
