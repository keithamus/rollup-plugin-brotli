export default {
    input: 'src/index.js',
    external: ['fs', 'iltorb'],
    output: [
        {
            format: 'cjs',
            file: 'lib/index.cjs.js'
        },
        {
            format: 'es',
            file: 'lib/index.es.js'
        }
    ]
}
