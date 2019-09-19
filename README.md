# rollup-plugin-brotli

Creates a compressed `.br` artifact for your Rollup bundle.

This uses the built in Node Brotli APIs, and as such requires Node v11.7.0 or higher

Based off of [@kryops](https://github.com/kryops)' [rollup-plugin-gzip](https://github.com/kryops/rollup-plugin-gzip).

## Installation

```
npm install --save-dev rollup-plugin-brotli
```


## Usage

```js
import {rollup} from "rollup";
import brotli from "rollup-plugin-brotli";

rollup({
    entry: 'src/index.js',
    plugins: [
        brotli()
    ]
}).then(/* ... */)
```

### Configuration

```js
brotli({
    options: {
        mode: 0 // "generic mode"
        level: 7 // turn down the quality, resulting in a faster compression
        // ... see all options https://nodejs.org/api/zlib.html#zlib_zlib_createbrotlicompress_options
    },
    additional: [
        //  Manually list more files to compress alongside.
        'dist/bundle.css'
    ],
    // Ignore files smaller than this
    minSize: 1000
})
```

**options**: Brotli compression options

The options available are the [standard options for the `zlib.createBrotliCompress` builtin](https://nodejs.org/api/zlib.html#zlib_class_options).

**additional**: Compress additional files

This option allows you to compress additional files that were created by other Rollup plugins.

**minSize**: Minimum size for compression

Specified the minimum size in Bytes for a file to get compressed. Files that are smaller than this threshold will not be compressed. This applies to both the generated bundle and specified additional files.

## License

MIT
