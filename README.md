# Gulp2Go

[![](https://img.shields.io/github/issues/kosatyi/gulp2go)](https://github.com/kosatyi/gulp2go/issues)
[![](https://img.shields.io/github/forks/kosatyi/gulp2go)](https://github.com/kosatyi/gulp2go)
[![](https://img.shields.io/github/stars/kosatyi/gulp2go)](https://github.com/kosatyi/gulp2go)

[![](https://img.shields.io/npm/v/gulp2go)](https://www.npmjs.com/package/gulp2go)
[![](https://img.shields.io/npm/dt/gulp2go)](https://www.npmjs.com/package/gulp2go)
[![](https://img.shields.io/github/license/kosatyi/gulp2go)](https://github.com/kosatyi/gulp2go/blob/master/LICENSE)
[![](https://img.shields.io/badge/official-website-green)](https://kosatyi.com/gulp2go/)

![nodei.co](https://nodei.co/npm/gulp2go.png?downloads=true&downloadRank=true&stars=true)

> Gulp bundlers for *.js *.scss and *.svg files.

## Installation

### Node

If you’re using [NPM](https://npmjs.com/) in your project, you can add `gulp2go` dependency to `package.json`
with following command:

```cmd
npm i --save-dev gulp2go
```

or add dependency manually:

```json
{
  "dependency": {
    "gulp2go":"^1.0"
  }
}
```

## Quick start

```javascript
const gulp = require('gulp');
const {jsBundler,scssBundler,svgBundler} = require('gulp2go');
/** bundle with browserify **/
gulp.task('javascript',()=>{
    return jsBundler('path/to/build.js','bundlefile.js','path/to/js/dist',{
        /** optional **/
        babelify:{
            extensions:['.tsx','.ts']
        },
        /** optional **/
        schemify:{
            'jquery':'$'
        },
        /** optional **/
        tsify:{
            target:'es6'
        }
    });
});
/** bundle with sass **/
gulp.task('styles',()=>{
    return scssBundler('path/to/*.scss','path/to/scss/dist')
});
/** make svg icon sprite **/
gulp.task('sprites',()=>{
    return scssBundler('path/to/*.svg','sprite.svg','path/to/svg/dist');
});
```

## License

[MIT](https://github.com/kosatyi/gulp2go/blob/HEAD/LICENSE)

## Author

Stepan Kosatyi, stepan@kosatyi.com

[![Stepan Kosatyi](https://img.shields.io/badge/stepan-kosatyi-purple.svg)](https://kosatyi.com/)


