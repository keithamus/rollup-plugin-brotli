'use strict';

var fs = require('fs');
var path = require('path');
var zlib = require('zlib');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var fs__default = /*#__PURE__*/_interopDefaultLegacy(fs);

function brotliCompressFile(file, options, minSize) {
  return new Promise(resolve => {
    fs__default['default'].stat(file, (err, stats) => {
      if(err) {
        console.error('rollup-plugin-brotli: Error reading file ' + file);
        resolve();
        return
      }

      if(minSize && minSize > stats.size) {
        resolve();
      } else {
        fs__default['default'].createReadStream(file)
          .pipe(zlib.createBrotliCompress(options))
          .pipe(fs__default['default'].createWriteStream(file + '.br'))
          .on('close', () => resolve());
      }
    });
  })
}

function brotli(options = {}) {
  let _dir = '';
  options = Object.assign({
    test: /\.(js|css|html|txt|xml|json|svg|ico|ttf|otf|eot)$/,
    additional: [],
    minSize: 0,
    options: {},
  }, options);
  return {
    name: 'brotli',
    generateBundle: buildOpts => {
      _dir = (buildOpts.file && path.dirname(buildOpts.file)) || buildOpts.dir || '';
    },
    writeBundle: async (outputOptions, bundle) => {
      const compressCollection = [];
      const bundlesToCompress = Object.keys(bundle).map(id => bundle[id].fileName).filter(fileName => options.test.test(fileName));
      const files = [...options.additional, ...bundlesToCompress.map(f => path.join(_dir, f))];
      for (const file of files) {
        compressCollection.push(brotliCompressFile(file, options.options, options.minSize));
      }
      await Promise.all(compressCollection);
    }
  }
}

module.exports = brotli;
