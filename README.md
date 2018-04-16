# rollup-plugin-brotli

Creates a compressed `.br` artifact for your Rollup bundle.

All credit goes to [@kryops](https://github.com/kryops) with https://github.com/kryops/rollup-plugin-gzip. This just changes `zlib` to `brotli` and adds the additional (`iltorb`) dependency.

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
        // ...
    },
    additional: [
        'dist/bundle.css'
    ],
    minSize: 1000
})
```

**options**: Brotli compression options

The options available are the [standard options for the `iltorb` module](https://github.com/mayhemydg/iltorb#brotliparams).

**additional**: Compress additional files

This option allows you to compress additional files that were created by other Rollup plugins.

As the `onwrite` callback for all plugins is executed in the same order they are listed in the `plugins` array, this might only work if the brotli plugin is positioned after all other plugins that create additional files.

**minSize**: Minimum size for compression

Specified the minimum size in Bytes for a file to get compressed. Files that are smaller than this threshold will not be compressed. This applies to both the generated bundle and specified additional files.

## License

MIT
