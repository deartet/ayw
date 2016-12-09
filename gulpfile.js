var gulp = require('gulp');
var sass = require('gulp-sass'); // requires the gulp-sass plugin, and put in variable-'sass'
var plumber = require('gulp-plumber'); // require function create dependecies
var notify = require('gulp-notify');
var browserSync = require('browser-sync');
var autoprefixer = require('gulp-autoprefixer');
var sourcemaps = require('gulp-sourcemaps');
var spritesmith = require('gulp.spritesmith');
var gulpIf = require('gulp-if');
var nunjunksRender = require('gulp-nunjucks-render');
var data = require('gulp-data');
var fs = require('fs');
var del = require('del');
var runSequence = require('run-sequence');
var jshint = require('gulp-jshint'); // use npm install --save-dev jshint gulp-jshin -g instead of npm install gulp-jshint --save-dev, I use both...
var jscs = require('gulp-jscs');
var scssLint = require('gulp-scss-lint');
var Server = require('karma').Server;

function customPlumber(errTitle) {
    return plumber({
        errorHandler: notify.onError({
                //customizing error title
                title: errTitle || "Error Running Gulp",
                message: "Error: <%= error.message %>",
                //other sounds: Basso, Blow, Bottle, Frog, Funk, Glass, Hero, Morse, Ping, Pop, Pirr, Sosumi, Submarine, Tink
                sound: "Blow"
            })
            // switch below with the errorHandler with notify.onError
            //function(err){
            //log error in console
            // console.log(err.stack);
            //ends the current pipe, so gulp watch doesn't break
            //this.emit('end');
            //} 
    });
}

gulp.task('browserSync', function () {
    browserSync({
        server: {
            //user root as base directory
            baseDir: 'app'
        },
        //disable pop-over notification
        notify: false
    });
    // no need the following code?????
    //gulp.watch("app/*.html").on('change', browserSync.reload);
})

gulp.task('compile-sass', function () {
    return gulp.src('app/scss/**/*.scss')
        //checks for errors all plugins, replaceing plumber with customPlumber
        .pipe(customPlumber('Error Running Sass'))
        .pipe(sourcemaps.init())
        .pipe(sass({
            //include bower_components as a import location
            includePaths: ['app/bower_components']
        }))
        // runs produced css through autoprefixer
        .pipe(autoprefixer({
            // Adds prefixs for IE8, IE9 and last 2 versions of all other browsers
            browsers: ['ie 8-9', 'last 2 versions']
        }))
        // Writing sourcemaps
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('app/css')) //output style.css in app/scss
        //tells browser sync to reload files task is done
        .pipe(browserSync.reload({
            stream: true
        }))
});

// Remove  ['browserSync','compile-sass'] from gulp.task('watch', ['browserSync','compile-sass'], function
gulp.task('watch', function () {
    gulp.watch('app/scss/**/*.scss', ['compile-sass', 'lint:scss']);
    // Watch JavaScript files and warn us of erros
    gulp.watch('app/js/**/*.js', ['lint:js']);
    // Reloads the brower when a JS file is saved
    gulp.watch('app/js/**/*.js', browserSync.reload);
    // Reloads the brower when a HTML file is saved
    gulp.watch('app/*.html', browserSync.reload);
    // Watch nunjucks stuff
    gulp.watch([
        'app/templates/**/*',
        'app/pages/**/*.+(html|nunjucks)',
        'app/data.json'
    ], ['nunjucks']) // whenever arrays are saved, run nunjucks task
        //we can watch addtional files types by adding another watch method
        //we no long have to trigger the " " task manually
        //other watchers
        //gulp.watch(...)
});

gulp.task('sprites', function () {
    gulp.src('app/images/sprites/**/*')
        .pipe(spritesmith({
            cssName: '_sprites.scss', // Generated CSS file
            imgName: 'sprites.png', // Generated Image file
            // Modifies image path
            imgPath: '../images/sprites.png',
            retinaSrcFilter: 'app/images/sprites/*@2x.png', //(Filter for retina images, a path to the reina images)
            retinaImgName: 'sprites@2x.png', //(Name for retina sprite)
            retinaImgPath: '../images/sprites@2x.png' //(Path for retina sprite)
        }))
        .pipe(gulpIf('*.png', gulp.dest('app/images')))
        .pipe(gulpIf('*.scss', gulp.dest('app/scss')));
});


gulp.task('nunjucks', function () {
    // Gets .html and .nunjucks files in pages
    return gulp.src('app/pages/**/*.+(html|nunjucks)')
        // Prevent nunjucks errors from breaking gulp's watch method
        .pipe(customPlumber('Error Running Nunjucks'))
        // Adding data to Nunjucks
        .pipe(data(function () {
            //return require('./app/data.json'), files retrieved with require are only read once
            return JSON.parse(fs.readFileSync('./app/data.json'))
        }))
        // Render nunjuck files
        .pipe(nunjunksRender({
            path: ['app/templates']
        }))
        // Output files in app folder
        .pipe(gulp.dest('app'))
        // browser automatically refresh with the latest changes
        .pipe(browserSync.reload({
            stream: true
        }))
});

gulp.task('clean:dev', function () {
    return del.sync([
       'app/css',
       'app/*.html'
   ]);
});

// Consolidated dev phase task
gulp.task('default', function (callback) {
    runSequence(
        'clean:dev', ['sprites', 'lint:js', 'lint:scss'], ['compile-sass', 'nunjucks'], ['browserSync', 'watch'],
        callback
    )
});

gulp.task('lint:js', function () {
    return gulp.src('app/js/**/*.js')
        // Catching errors with customPlumber
        .pipe(customPlumber('JSHint Error'))
        .pipe(jshint())
        // Switching to jshint-stylish reporter
        .pipe(jshint.reporter('jshint-stylish'))
        // Catching all JSHint errors
        .pipe(jshint.reporter('fail', {
            ignoreWarning: true,
            ignoreInfo: true
        }))
        .pipe(jscs({
            // Fix errors
            fix: true,
            // This is needed to make fix work
            configPath: '.jscsrc'
        }))
        // remove JSCS reporter since we don't need it anymore
        //.pipe(jscs.reporter())
        // Overwrite source files
        .pipe(gulp.dest('app/js'))
});

gulp.task('lint:scss', function () {
    return gulp.src('app/scss/**/*.scss')
        // Linting files with SCSSLint
        .pipe(scssLint({
            // Pointing to config file
            config: '.scss-lint.yml'
        }));
});

gulp.task('test', function(done){
  new Server({
    configFile: process.cwd() + '/karma.conf.js',
    singleRun: true
  }, done).start();
});


gulp.task('dev-ci', function(callback){
  runSequence(
    'clean:dev',
    ['sprites', 'lint:js', 'lint:scss'],
    ['sass', 'nunjucks'],
    callback
  );
});
