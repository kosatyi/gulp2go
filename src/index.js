const gulp = require('gulp');
const sourcemaps = require('gulp-sourcemaps');
const through2 = require('through2');
const del = require('del');
const uglify = require('gulp-uglify');
const rename = require('gulp-rename');
const autoprefixer = require('gulp-autoprefixer');
const svgSprite = require('gulp-svg-sprite');
const touch = require('gulp-touch-fd');
const cleanCSS = require('gulp-clean-css');
const browserify = require('browserify');
const vinylSource = require('vinyl-source-stream');
const vinylBuffer = require('vinyl-buffer');
const tools = require('browserify-transform-tools');
const sass = require('gulp-sass')(require('sass'));

/**
 * Gulp instance
 * @type {Gulp}
 */
exports.gulp = gulp;
exports.del = del;
exports.through2 = through2;
exports.sourcemaps = sourcemaps;
exports.sass = sass;
exports.browserify = browserify;
exports.vinylSource = vinylSource;
exports.vinylBuffer = vinylBuffer;
exports.svgSprite = svgSprite;
exports.uglify = uglify;
exports.rename = rename;
exports.touch = touch;

const extend = (defaults, options) => Object.assign({}, defaults, options);

const wrapper = p => `(typeof window !== "undefined" ? window['${p}'] : typeof global !== "undefined" ? global['${p}'] : null)`;

const schemify = tools.makeRequireTransform('schemify',{
    evaluateArguments: true,
    jsFilesOnly: true
},(args, opts, cb) => {
    const shimmedModules = opts.config || {};
    const moduleName = args[0];
    const shim = shimmedModules[moduleName];
    if(typeof shim === 'undefined') {
        return cb();
    } else {
        return cb(null, wrapper(shim));
    }
});
/**
 *
 * @param files
 * @param bundle
 * @param target
 * @return {*}
 */
const svgBundler = (files, bundle, target) => {
    return gulp.src(files)
        .pipe(svgSprite({
            mode: {stack:{sprite: bundle}}
        }))
        .on('error', function (err) {
            console.log(err);
            this.emit('end');
        })
        .pipe(rename(bundle))
        .pipe(gulp.dest(target))
        .pipe(touch());
};

exports.svgBundler = svgBundler;
/**
 *
 * @param files
 * @param target
 * @param settings
 * @return {*}
 */
const scssBundler = (files, target, settings) => {
    return gulp.src(files)
        .pipe(sourcemaps.init())
        .pipe(sass().on('error', sass.logError))
        .pipe(autoprefixer(settings['autoprefixer'] || {}))
        .pipe(gulp.dest(target))
        .pipe(cleanCSS(settings['clean'] || {}))
        .pipe(rename({extname: '.min.css'}))
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest(target))
        .pipe(touch());
};

exports.scssBundler = scssBundler;

const babelifyDefaults = {
    plugins: [
        ["@babel/plugin-transform-typescript", {
            "allExtensions": true,
            "allowDeclareFields": true
        }],
        ["@babel/plugin-proposal-class-properties"],
        ["@babel/plugin-transform-runtime"]
    ],
    presets: [
        ["@babel/preset-env", {}]
    ],
    sourceMaps: true
};
/**
 *
 * @param source
 * @param bundle
 * @param target
 * @param settings
 * @return {*}
 */
const jsBundler = (source, bundle, target, settings) => {
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
        transform.push([schemify, settings['schemify']]);
    }
    if ('standalone' in settings) {
        params.standalone = settings.standalone;
    }
    return browserify(source, params).bundle()
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
};

exports.jsBundler = jsBundler;
