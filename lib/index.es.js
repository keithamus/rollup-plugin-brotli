import { compressStream } from 'iltorb';
import fs from 'fs';

function brotliCompressFile(file, options, minSize) {
  return new Promise(resolve => {
    fs.stat(file, (err, stats) => {
      if(err) {
        console.error('rollup-plugin-brotli: Error reading file ' + file);
        resolve();
        return
      }

      if(minSize && minSize > stats.size) {
        resolve();
      } else {
        fs.createReadStream(file)
          .pipe(compressStream(options))
          .pipe(fs.createWriteStream(file + '.br'))
          .on('close', () => resolve());
      }
    });
  })
}

function brotli(options) {
  const outputFiles = new Set();
  options = Object.assign({
    additional: [],
    minSize: 0,
    options: Object.assign({
      level: 11,
      mode: 1,
    }, (options || {}).options || {})
  }, options);
  return {
    name: 'brotli',
    generateBundle: buildOpts => {
      const filesToCompress = [buildOpts.file, ...options.additional];
      for (const file of filesToCompress) {
        outputFiles.add(file);
      }
    },
    writeBundle: async () => {
      const compressCollection = [];
      for (const file of outputFiles) {
        compressCollection.push(brotliCompressFile(file, options.options, options.minSize));
      }
      await Promise.all(compressCollection);
    }
  }
}

export default brotli;
