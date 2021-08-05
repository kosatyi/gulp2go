const tools = require('browserify-transform-tools');

const wrapper = (p) => {
    return `(typeof window !== "undefined" ? window['${p}'] : typeof global !== "undefined" ? global['${p}'] : null)`;
}

module.exports = tools.makeRequireTransform('schemify',{
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
