const {mkdirSync} = require('fs')
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
const rimrafAsync = promisify(rimraf)
const accessAsync = promisify(access)
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

})
