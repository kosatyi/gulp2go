const gulp = require('gulp');
const sourcemaps = require('gulp-sourcemaps');
const uglify = require('gulp-uglify');
const rename = require('gulp-rename');
const autoprefixer = require('gulp-autoprefixer');
const sass       = require('gulp-sass')(require('sass'));
const svgSprite = require('gulp-svg-sprite');
const touch = require('gulp-touch-fd');
const cleanCSS = require('gulp-clean-css');
const browserify = require('browserify');
const vinylSource = require('vinyl-source-stream');
const vinylBuffer = require('vinyl-buffer');
const through2    = require('through2');
const del    = require('del');

module.exports['gulp'] = gulp;
module.exports['del'] = del;
module.exports['through2'] = through2;
module.exports['sourcemaps'] = sourcemaps;
module.exports['browserify'] = browserify;
module.exports['vinylSource'] = vinylSource;
module.exports['vinylBuffer'] = vinylBuffer;
module.exports['svgSprite'] = svgSprite;
module.exports['uglify'] = uglify;
module.exports['rename'] = rename;
module.exports['touch'] = touch;
module.exports['sass'] = sass;

const svgBundler  = function(files,bundle,target){
    return gulp.src(files)
        .pipe(svgSprite({
            mode: { stack: { sprite: bundle } }
        }))
        .on('error', function(err){
            console.log(err);
            this.emit('end');
        })
        .pipe(rename(bundle))
        .pipe(gulp.dest(target))
        .pipe(touch());
}

module.exports['svgBundler'] = svgBundler;

const scssBundler = function(files,target){
    return gulp.src(files)
        .pipe(sourcemaps.init())
        .pipe(sass().on('error',sass.logError))
        .pipe(autoprefixer())
        .pipe(gulp.dest(target))
        .pipe(cleanCSS())
        .pipe(rename({extname:'.min.css'}))
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest(target))
        .pipe(touch());
}

module.exports['scssBundler'] = scssBundler;

const jsBundler = function(source,bundle,target,settings){

    const params  = {
        plugins:[],
        transform: [],
        cache: {},
        packageCache: {}
    };

    params.debug = true;

    params.transform.push('sourceify');

    if( 'tsify' in settings ){
        params.plugins.push( ['tsify',settings['tsify']]);
    }
    if( 'watchify' in settings ){
        params.plugins.push(['watchify'])
    }
    if( 'babelify' in settings ){
        params.transform.push(['babelify',settings['babelify']]);
    }
    if( 'schemify' in settings ){
        params.transform.push(['./src/schemify',settings['schemify']]);
    }
    if( 'standalone' in settings ){
        params.standalone =  settings.standalone;
    }

    const build = browserify(source,params);

    const callback = function(){
        return build.bundle()
            .pipe(vinylSource(bundle))
            .pipe(vinylBuffer())
            .pipe(sourcemaps.init({loadMaps: true}))
            .pipe(gulp.dest(target))
            .pipe(uglify())
            .pipe(rename({
                extname:'.min.js'
            }))
            .pipe(sourcemaps.write('./'))
            .pipe(gulp.dest(target))
            .pipe(touch());
    }

    build.on('update', callback);

    return callback();

}

module.exports['jsBundler'] = jsBundler;



