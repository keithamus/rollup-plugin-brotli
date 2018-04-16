const { decompress } = require('iltorb')
const {describe,it,beforeEach,afterEach} = require('mocha')
const chai = require('chai')
const rimraf = require('rimraf')
const {rollup} = require('rollup')
const brotli = require('../lib/index.cjs')
const {promisify} = require('util')
const {writeFile, readFile, access} = require('fs')
const readFileAsync = promisify(readFile)
const writeFileAsync = promisify(writeFile)
const decompressAsync = promisify(decompress)
const rimrafAsync = promisify(rimraf)
const accessAsync = promisify(access)
const {expect} = chai

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
    const compressed = await decompressAsync(await readFileAsync('test/__output/bundle.js.br'))
    expect(uncompressed).to.eql(compressed)
  })

  it('has sensible defaults', async () => {
    const bundle = await rollup({
      input: 'test/sample/index.js',
      plugins: [
        // file that is above the size option => gets compressed
        {
          name: 'test',
          onwrite: (options, bundle) => writeFileAsync('test/__output/test1.txt', 'This is a test')
        },
        // short file that is below the size option => not compressed
        {
          name: 'test2',
          onwrite: (options, bundle) => writeFileAsync('test/__output/test2.txt', 'Short')
        },
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
    const compressed = await decompressAsync(await readFileAsync('test/__output/bundle.js.br'))
    expect(uncompressed).to.eql(compressed)
    const uncompressedTxt = await readFileAsync('test/__output/test1.txt')
    const compressedTxt = await decompressAsync(await readFileAsync('test/__output/test1.txt.br'))
    expect(uncompressedTxt).to.eql(compressedTxt)
    let access = null
    try {
      access = await accessAsync(await readFileAsync('test/__output/test2.txt.br'))
    } catch(e) {
      access = null
    }
    expect(access).to.equal(null)
  })

})
