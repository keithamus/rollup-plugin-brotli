export default {
    entry: 'src/index.js',
    external: ['fs', 'iltorb'],

    targets: [
        {
            format: 'cjs',
            dest: 'lib/index.cjs.js'
        },
        {
            format: 'es',
            dest: 'lib/index.es.js'
        }
    ]
}
