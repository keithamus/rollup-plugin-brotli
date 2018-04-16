import { compressStream } from 'iltorb'
import fs from 'fs'

function brotliCompressFile(file, options, minSize) {
  return new Promise(resolve => {
    fs.stat(file, (err, stats) => {
      if(err) {
        console.error('rollup-plugin-brotli: Error reading file ' + file)
        resolve()
        return
      }

      if(minSize && minSize > stats.size) {
        resolve()
      }
      else {
        fs.createReadStream(file)
          .pipe(compressStream(options))
          .pipe(fs.createWriteStream(file + '.br'))
          .on('close', () => resolve())
      }
    })
  })
}

export default function brotli(options) {
  options = Object.assign({
    additional: [],
    minSize: 0,
    options: Object.assign({
      level: 11,
      mode: 1,
    }, (options || {}).options || {})
  }, options)
  return {
    name: 'brotli',
    onwrite: function(buildOpts, bundle) {
      const filesToCompress = [ buildOpts.file ].concat(options.additional)
      return Promise.all(filesToCompress.map(file => brotliCompressFile(file, options.options, options.minSize)))
    }
  }
}
