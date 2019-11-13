const {mkdirSync} = require('fs')
const { brotliDecompress } = require('zlib')
const {describe,it,beforeEach,afterEach} = require('mocha')
const chai = require('chai')
const rimraf = require('rimraf')
const {rollup} = require('rollup')
const brotli = require('../lib/index.cjs')
const {promisify} = require('util')
const {writeFile, readFile, readdir, access} = require('fs')
const readFileAsync = promisify(readFile)
const writeFileAsync = promisify(writeFile)
const rimrafAsync = promisify(rimraf)
const readdirAsync = promisify(readdir)
const accessAsync = promisify(access)
const decompress = promisify(brotliDecompress)
const {expect} = chai

// helper
function _plugin(name, content) {
  return {
    name,
    generateBundle: () => writeFileAsync(`test/__output/${name}.txt`, content)
  }
}

describe('rollup-plugin-brotli', () => {

  beforeEach(() => rimrafAsync('test/__output'))
  afterEach(() => rimrafAsync('test/__output'))

  it('has sensible defaults', async () => {
    const bundle = await rollup({
      input: 'test/sample/index.js',
      plugins: [
        brotli()
      ]
    })
    await bundle.write({
      file: 'test/__output/bundle.js',
      format: 'iife',
      sourceMap: true
    })
    const uncompressed = await readFileAsync('test/__output/bundle.js')
    const compressed = await decompress(await readFileAsync('test/__output/bundle.js.br'))
    expect(uncompressed).to.eql(compressed)
  })

  it('has sensible defaults', async () => {
    mkdirSync('test/__output', {recursive: true, mode: 0o755})
    const bundle = await rollup({
      input: 'test/sample/index.js',
      plugins: [
        // file that is above the size option => gets compressed
        _plugin('test1', 'This is a test'),
        // short file that is below the size option => not compressed
        _plugin('test2', 'Short'),
        brotli({
          options: {
            level: 9,
          },
          additional: [
            'test/__output/test1.txt',
            'test/__output/test2.txt',
          ],
          minSize: 10
        })
      ]
    })
    await bundle.write({
      file: 'test/__output/bundle.js',
      format: 'cjs',
      sourceMap: true
    })
    const uncompressed = await readFileAsync('test/__output/bundle.js')
    const compressed = await decompress(await readFileAsync('test/__output/bundle.js.br'))
    expect(uncompressed).to.eql(compressed)
    const uncompressedTxt = await readFileAsync('test/__output/test1.txt')
    const compressedTxt = await decompress(await readFileAsync('test/__output/test1.txt.br'))
    expect(uncompressedTxt).to.eql(compressedTxt)
    let access = null
    try {
      access = await accessAsync(await readFileAsync('test/__output/test2.txt.br'))
    } catch(e) {
      access = null
    }
    expect(access).to.equal(null)
  })

  it('does not brotli up gzips', async () => {
    mkdirSync('test/__output', {recursive: true, mode: 0o755})
    const bundle = await rollup({
      input: 'test/sample/index.js',
      plugins: [
        {
          name: 'plugin1',
          generateBundle(opts,bundle) {
            bundle['test1.js.gz'] = {
              fileName: 'test1.js.gz',
              isAsset: true,
              source: Buffer.from('hello world'),
              type: 'asset'
            }
          }
        },
        brotli({ minSize: 0 })
      ]
    })
    await bundle.write({
      file: 'test/__output/bundle.js',
      format: 'cjs',
      sourceMap: true
    })
    const uncompressed = await readFileAsync('test/__output/bundle.js')
    const compressed = await decompress(await readFileAsync('test/__output/bundle.js.br'))
    expect(uncompressed).to.eql(compressed)
    expect(await readdirAsync('test/__output')).to.eql([
      'bundle.js',
      'bundle.js.br',
      'test1.js.gz',
    ])
  })

  it('does not brotli up gzips (magic bytes)', async () => {
    mkdirSync('test/__output', {recursive: true, mode: 0o755})
    const bundle = await rollup({
      input: 'test/sample/index.js',
      plugins: [
        {
          name: 'plugin1',
          generateBundle(opts,bundle) {
            bundle['test1.js'] = {
              fileName: 'test1.js',
              isAsset: true,
              source: Buffer.concat([Buffer.from([0x1F, 0x8B]), Buffer.from('hello world')]),
              type: 'asset'
            }
          }
        },
        brotli({ minSize: 0 })
      ]
    })
    await bundle.write({
      file: 'test/__output/bundle.js',
      format: 'cjs',
      sourceMap: true
    })
    const uncompressed = await readFileAsync('test/__output/bundle.js')
    const compressed = await decompress(await readFileAsync('test/__output/bundle.js.br'))
    expect(uncompressed).to.eql(compressed)
    expect(await readdirAsync('test/__output')).to.eql([
      'bundle.js',
      'bundle.js.br',
      'test1.js',
    ])
  })

})
