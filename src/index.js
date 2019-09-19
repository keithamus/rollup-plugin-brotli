import fs from 'fs'
import {join, dirname} from 'path'
import {createBrotliCompress} from 'zlib'

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
      } else {
        fs.createReadStream(file)
          .pipe(createBrotliCompress(options))
          .pipe(fs.createWriteStream(file + '.br'))
          .on('close', () => resolve())
      }
    })
  })
}

export default function brotli(options = {}) {
  let _dir = ''
  options = Object.assign({
    additional: [],
    minSize: 0,
    options: {},
  }, options)
  return {
    name: 'brotli',
    generateBundle: buildOpts => {
      _dir = (buildOpts.file && dirname(buildOpts.file)) || buildOpts.dir || ''
    },
    writeBundle: async bundle => {
      const compressCollection = []
      const files = [...options.additional, ...Object.keys(bundle).map(f => join(_dir, f))]
      for (const file of files) {
        compressCollection.push(brotliCompressFile(file, options.options, options.minSize))
      }
      await Promise.all(compressCollection)
    }
  }
}
