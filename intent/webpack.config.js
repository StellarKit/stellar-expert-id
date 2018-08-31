const path = require('path'),
    webpack = require('webpack'),
    UglifyJSPlugin = require('uglifyjs-webpack-plugin')

const settings = {
    mode: 'production',
    devtool: 'source-map',
    entry: {
        'intent.id.stellar.expert': [path.join(__dirname, '/src/index.js')]
    },
    output: {
        path: path.join(__dirname, './lib'),
        filename: '[name].js',
        library: 'intentIdStellarExpert',
        libraryTarget: 'umd'
        /*chunkFilename: '[name].js',
        library: 'intentIdStellarExpert',
        umdNamedDefine: true*/
    },
    module: {
        rules: [
            {
                test: /\.js?$/,
                loader: 'babel-loader',
                exclude: /node_modules/
            }
        ]
    },
    plugins: [
        new webpack.LoaderOptionsPlugin({
            minimize: true,
            debug: false,
            sourceMap: true
        }),
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify('production'),
            'stellarExpertIdApiServer': JSON.stringify(process.env.SERVER_URL || 'https://id.stellar.expert')
        })
    ],
    optimization: {
        minimizer: [
            new UglifyJSPlugin({
                uglifyOptions: {
                    toplevel: true,
                    keep_classnames: true,
                    keep_fnames: true
                }
            })
        ]
    }
}

module.exports = settings