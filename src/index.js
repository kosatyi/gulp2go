import gulp from 'gulp'
import sourcemaps from 'gulp-sourcemaps'
import through2 from 'through2'
import del from 'del'
import uglify from 'gulp-uglify'
import rename from 'gulp-rename'
import autoprefixer from 'gulp-autoprefixer'
import svgSprite from 'gulp-svg-sprite'
import touch from 'gulp-touch-fd'
import cleanCSS from 'gulp-clean-css'
import browserify from 'browserify'
import vinylSource from 'vinyl-source-stream'
import vinylBuffer from 'vinyl-buffer'
import purify from 'gulp-purify-css'
import concat from 'gulp-concat'
import sassLib from 'sass'
import gulpSass from 'gulp-sass'
import { makeRequireTransform} from 'browserify-transform-tools'

const sass = gulpSass(sassLib)

const extend = (...sources) => Object.assign({}, ...sources);

const wrapper = p => `(typeof window !== "undefined" ? window['${p}'] : typeof global !== "undefined" ? global['${p}'] : null)`;

const schemify = makeRequireTransform('schemify', {
    evaluateArguments: true,
    jsFilesOnly: true
}, (args, opts, cb) => {
    const shimmedModules = opts.config || {};
    const moduleName = args[0];
    const shim = shimmedModules[moduleName];
    if (typeof shim === 'undefined') {
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
export const svgBundler = (files, bundle, target) => {
    return gulp.src(files)
        .pipe(svgSprite({
            mode: {stack: {sprite: bundle}}
        }))
        .on('error', function (err) {
            this.emit('end');
        })
        .pipe(rename(bundle))
        .pipe(gulp.dest(target))
        .pipe(touch());
};


/**
 *
 * @param files
 * @param target
 * @param settings
 * @return {*}
 */
export const scssBundler = (files, target, settings = {}) => {
    let chain = gulp.src(files);
    chain = chain.pipe(sourcemaps.init({}));
    chain = chain.pipe(sass(settings['sass'],false).on('error', sass.logError));
    if ('purify' in settings) {
        chain = chain.pipe(purify(settings['purify']));
    }
    return chain.pipe(autoprefixer(settings['autoprefixer'] || {}))
        .pipe(gulp.dest(target))
        .pipe(cleanCSS(settings['clean'] || {}))
        .pipe(rename({extname: '.min.css'}))
        .pipe(sourcemaps.write('./', {}))
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
export const jsBundler = (source, bundle, target, settings = {}) => {
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
        .pipe(sourcemaps.write('./', {}))
        .pipe(gulp.dest(target))
        .pipe(touch());
};


export {
    gulp,
    through2,
    sourcemaps,
    sass,
    del,
    browserify,
    vinylSource,
    vinylBuffer,
    svgSprite,
    uglify,
    rename,
    touch,
    purify,
    concat
}

