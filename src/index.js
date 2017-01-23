import { compressStream } from 'iltorb';
import fs from 'fs';

function brotliCompressFile(file, options, minSize) {
    return new Promise(resolve => {
        fs.stat(file, (err, stats) => {
            if(err) {
                console.error('rollup-plugin-brotli: Error reading file ' + file);
                resolve();
                return;
            }

            if(minSize && minSize > stats.size) {
                resolve();
            }
            else {
                fs.createReadStream(file)
                    .pipe(compressStream(options))
                    .pipe(fs.createWriteStream(file + '.br'))
                    .on('close', () => resolve());
            }
        });
    });
}

export default function brotli(options) {
    options = options || {};

    const brotliOptions = Object.assign({
      mode: 1,
    }, options.options || {});
    const additionalFiles = options.additional || [];
    const minSize = options.minSize || 0;

    return {
        name: 'brotli',

        onwrite: function(buildOpts, bundle) {

            // we have to read from the actual written bundle file rather than use bundle.code
            // as it does not contain the source map comment
            const filesToCompress = [ buildOpts.dest ].concat(additionalFiles);

            return Promise.all(filesToCompress.map(
                file => brotliCompressFile(file, brotliOptions, minSize)));
        }
    };
}
