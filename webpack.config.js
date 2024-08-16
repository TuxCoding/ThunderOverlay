const path = require('path');

module.exports = {
    entry: './src/index.ts',
    mode: "development",
    output: {
        filename: "bundle.js",
        path: path.resolve(__dirname, 'src/assets/javascript/')
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
        ],
    },
    resolve: {
        extensions: ['.ts'],
    },
};
