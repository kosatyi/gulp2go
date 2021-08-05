import gulp from 'gulp';
import sourcemaps from 'gulp-sourcemaps';
import through2 from 'through2';
import del from 'del';
import uglify from 'gulp-uglify';
import rename from 'gulp-rename';
import autoprefixer from 'gulp-autoprefixer';
import svgSprite from 'gulp-svg-sprite';
import touch from 'gulp-touch-fd';
import cleanCSS from 'gulp-clean-css';
import browserify from 'browserify';
import vinylSource from 'vinyl-source-stream';
import vinylBuffer from 'vinyl-buffer';
import gulpSass from 'gulp-sass';
import sassEngine from 'sass';

const sass = gulpSass(sassEngine);

const extend = (defaults, options) => Object.assign({}, defaults, options);

export {
    gulp,
    del,
    through2,
    sourcemaps,
    sass,
    browserify,
    vinylSource,
    vinylBuffer,
    svgSprite,
    uglify,
    rename,
    touch
}

export const svgBundler = (files, bundle, target) => {
    return () => gulp.src(files)
        .pipe(svgSprite({
            mode: {stack: {sprite: bundle}}
        }))
        .on('error', function (err) {
            console.log(err);
            this.emit('end');
        })
        .pipe(rename(bundle))
        .pipe(gulp.dest(target))
        .pipe(touch());
}


export const scssBundler = (files, target) => {
    return () => gulp.src(files)
        .pipe(sourcemaps.init())
        .pipe(sass().on('error', sass.logError))
        .pipe(autoprefixer())
        .pipe(gulp.dest(target))
        .pipe(cleanCSS())
        .pipe(rename({extname: '.min.css'}))
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest(target))
        .pipe(touch());
}

const babelifyDefaults = {
    "plugins": [
        ["@babel/plugin-transform-typescript", {
            "allExtensions": true,
            "allowDeclareFields": true
        }],
        ["@babel/plugin-proposal-class-properties"],
        ["@babel/plugin-transform-runtime"]
    ],
    "presets": [
        ["@babel/preset-env", {}]
    ],
    "sourceMaps": true
}

export const jsBundler = (source, bundle, target, settings) => {
    const plugins = [];
    const transform = [];
    const params = {
        standalone: false,
        debug: true,
        plugins,
        transform
    };
    transform.push(['sourceify']);
    if ('tsify' in settings) {
        plugins.push(['tsify', settings['tsify']]);
    }
    if ('babelify' in settings) {
        transform.push(['babelify', extend(babelifyDefaults, settings['babelify'])]);
    }
    if ('schemify' in settings) {
        transform.push(['./src/schemify', settings['schemify']]);
    }
    if ('standalone' in settings) {
        params.standalone = settings.standalone;
    }
    return () => browserify(source, params).bundle()
        .pipe(vinylSource(bundle))
        .pipe(vinylBuffer())
        .pipe(sourcemaps.init({loadMaps: true}))
        .pipe(gulp.dest(target))
        .pipe(uglify())
        .pipe(rename({
            extname: '.min.js'
        }))
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest(target))
        .pipe(touch());

}





