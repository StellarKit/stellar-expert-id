const path = require('path'),
    pkgInfo = require('./package.json'),
    webpack = require('webpack'),
    autoprefixer = require('autoprefixer'),
    MiniCssExtractPlugin = require('mini-css-extract-plugin'),
    cssnano = require('cssnano'),
    BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin

if (!process.env.NODE_ENV) {
    process.env.NODE_ENV = 'development'
}

console.log('NODE_ENV=' + process.env.NODE_ENV)

const isProduction = process.env.NODE_ENV !== 'development'

const settings = {
    mode: process.env.NODE_ENV,
    entry: {
        'se-id': [path.join(__dirname, './ui/app.js')],
        'se-id-styles': [path.join(__dirname, './ui/css/main.scss')]
    },
    output: {
        path: path.join(__dirname, './public/distr/'),
        filename: '[name].js',
        chunkFilename: '[name].js',
        publicPath: '/distr/'
    },
    module: {
        rules: [
            {
                test: /\.js?$/,
                loader: 'babel-loader',
                exclude: /node_modules/
            },
            {
                test: /\.scss$/,
                use: [
                    {
                        loader: MiniCssExtractPlugin.loader
                    },
                    {
                        loader: 'css-loader',
                        options: {
                            importLoaders: 1,
                            url: false,
                            sourceMap: !isProduction
                        }
                    },
                    {
                        loader: 'postcss-loader',
                        options: {
                            ident: 'postcss',
                            plugins: [
                                autoprefixer(),
                                cssnano({
                                    autoprefixer: true,
                                    discardComments: {removeAll: true}
                                })
                            ],
                            sourceMap: !isProduction
                        }
                    },
                    {
                        loader: 'sass-loader',
                        options: {
                            sourceMap: !isProduction
                        }
                    }
                ]
            }
        ]
    },
    plugins: [
        new webpack.IgnorePlugin(/ed25519/),
        new MiniCssExtractPlugin({
            filename: '[name].css'
        }),
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
            appVersion: JSON.stringify(pkgInfo.version)
        }),
        new webpack.ContextReplacementPlugin(/moment[\/\\]locale$/, /en/)
    ]
}

if (!isProduction) {
    settings.devtool = 'source-map'
    settings.devServer = {
        historyApiFallback: true,
        compress: true,
        port: 9001,
        contentBase: [path.join(__dirname, './public/')],
        setup(app) {
            const bodyParser = require('body-parser')
            app.use(bodyParser.urlencoded())
            app.post('*', (req, res) => {
                const querystring = require('querystring')
                res.redirect(req.originalUrl + '?' + querystring.stringify(req.body))
            })
        }
    }
} else {
    settings.plugins.unshift(new webpack.LoaderOptionsPlugin({
        minimize: true,
        debug: !isProduction,
        sourceMap: !isProduction
    }))

    const UglifyJSPlugin = require('uglifyjs-webpack-plugin')
    const uglify = new UglifyJSPlugin({
        uglifyOptions: {
            toplevel: true,
            keep_classnames: true,
            keep_fnames: true
        }
    })
    settings.optimization = {minimizer: [uglify]}

    settings.plugins.push(new BundleAnalyzerPlugin({
        analyzerMode: 'static',
        reportFilename: 'bundle-stats.html',
        openAnalyzer: false
    }))
}

module.exports = settings