const path = require('path')

module.exports = {
    entry: './ui/universe-editor/index.js', // Your main JavaScript file
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'universe.js',
        libraryTarget: 'umd', // This will make your library usable in various environments
        globalObject: 'this',
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env'],
                    },
                },
                exclude: /node_modules/,
            },
        ],
    },
}
