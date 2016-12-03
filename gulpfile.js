var gulp = require('gulp');
var sass = require('gulp-sass'); // requires the gulp-sass plugin, and put in variable-'sass'
var plumber = require('gulp-plumber');
var notify = require('gulp-notify');
var browserSync = require('browser-sync');
var autoprefixer = require('gulp-autoprefixer');
var sourcemaps = require('gulp-sourcemaps');
var spritesmith = require('gulp.spritesmith');

function customPlumber (errTitle) {
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

gulp.task('browserSync', function(){
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
   .pipe(sass())
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

gulp.task('watch', ['browserSync','compile-sass'], function(){
   gulp.watch('app/scss/**/*.scss',['compile-sass']); 
    //we can watch addtional files types by adding another watch method
    //we no long have to trigger the " " task manually
    //other watchers
    //gulp.watch(...)
});

