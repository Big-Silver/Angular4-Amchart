const path = require('path')
const webpackMerge = require('webpack-merge')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const HtmlPlugin = require('html-webpack-plugin')
const { DefinePlugin, ProgressPlugin, optimize, ContextReplacementPlugin, NormalModuleReplacementPlugin } = require('webpack')
const { AngularCompilerPlugin } = require('@ngtools/webpack')

const TEST_ASSETS = /assets[\/\\].*\.scss$/;
const OUTPUT_PATH = path.resolve(__dirname, 'dist')
const SOURCE_PATH = path.resolve(__dirname, 'src')
const STATS = {
  colors: true,
  hash: true,
  timings: true,
  chunks: true,
  chunkModules: false,
  children: false,
  modules: false,
  reasons: false,
  warnings: true,
  assets: false,
  version: false
}
const ENV = process.env.ENV = process.env.NODE_ENV = 'development';
function getAotOptions () {
  let options = {
    tsConfigPath: './src/tsconfig.app.json'
  }
  switch (process.env.NODE_ENV) {
    case 'testing':
      options.skipCodeGeneration = true
      options.tsConfigPath = './src/tsconfig.spec.json'
      break
    case 'development':
      options.skipCodeGeneration = true
      options.mainPath = path.resolve(__dirname, SOURCE_PATH, 'main.ts')
      break
    case 'production':
      options.mainPath = path.resolve(__dirname, SOURCE_PATH, 'main.ts')
      break
  }
  return options;
}

function chunksSortMethod (a, b) {
  let priority = ['main', 'vendor', 'polyfills']
  return priority.indexOf(b.names[0])
}

const webpackConfig = {
  context: __dirname,
  resolve: {
    extensions: ['.ts', '.js'],
    modules: [
      path.resolve(__dirname, 'node_modules'),
      SOURCE_PATH
    ],
    symlinks: true
  },
  output: {
    path: OUTPUT_PATH,
    publicPath: '',
    filename: '[name].bundle.js'
  },
  plugins: [
    new AngularCompilerPlugin(getAotOptions()),
    new ProgressPlugin(),
    new ExtractTextPlugin('main.css'),
    new DefinePlugin({
      'process.env': {
        'NODE_ENV': JSON.stringify(process.env.NODE_ENV)
      }
    }),
    new optimize.CommonsChunkPlugin({
      name: 'vendor',
      chunks: ['main'],
      minChunks(module) {
        return /node_modules/.test(module.resource)
      }
    }),
    new optimize.OccurrenceOrderPlugin(true),
    new ContextReplacementPlugin(/angular(\\|\/)core(\\|\/)src(\\|\/)linker/,
      SOURCE_PATH, {
        // your Angular Async Route paths relative to this root directory
      })
  ],
  module: {
    rules: [
      // { test: /\.scss$/, exclude: TEST_ASSETS, loaders: ['raw-loader', 'sass-loader'] },
      { test: TEST_ASSETS, use: ExtractTextPlugin.extract({
        fallback: 'style-loader',
        use: ['css-loader', 'sass-loader']
      })},
      // load scss from app as raw css strings
      { test: /\.scss$/, exclude: TEST_ASSETS, loaders: ['to-string-loader', 'css-loader', 'sass-loader'] },
      { test: /\.css$/, loader: 'raw-loader' },
      { test: /\.ts$/, loader: '@ngtools/webpack' },
      { test: /\.jpg$/, loader: "file-loader" },
      { test: /\.png$/, loader: "url-loader?mimetype=image/png" },
      { test: /\.(woff(2)?|ttf|eot|svg)(\?v=\d+\.\d+\.\d+)?$/, loader: 'url-loader?limit=10000' },
      { test: /\.html$/, loader: 'raw-loader' },
      { test: /\.pug$/, loaders: [
        'html-loader', {
          loader: 'pug-html-loader',
          options: {
            doctype: 'html'
          }
        }
      ]}
    ]
  },
  stats: STATS
};

const webpackEnv = {
  // Production
  production: {
    // devtool: 'source-map',
    entry: {
      polyfills: path.join(SOURCE_PATH, 'polyfills.ts'),
      main: path.join(SOURCE_PATH, 'main.ts')
    },
    plugins: [
      new HtmlPlugin({
        filetype: 'pug',
        template: path.join(SOURCE_PATH, 'index.pug'),
        chunksSortMode: chunksSortMethod,
        hash: true
      }),
      new NormalModuleReplacementPlugin(
        /src\/environments\/environment.ts/,
        'environment.production.ts'
      ),
      new optimize.UglifyJsPlugin({
        beautify: false,
        output: {
          comments: false
        },
        mangle: {
          screw_ie8: true
        },
        compress: {
          screw_ie8: true,
          warnings: false,
          conditionals: true,
          unused: true,
          comparisons: true,
          sequences: true,
          dead_code: true,
          evaluate: true,
          if_return: true,
          join_vars: true,
          negate_iife: false
        }
      })
    ]
  },
  // Development
  development: {
    devtool: 'inline-source-map',
    entry: {
      polyfills: path.join(SOURCE_PATH, 'polyfills.ts'),
      main: path.join(SOURCE_PATH, 'main.ts')
    },
    plugins: [
      new HtmlPlugin({
        filetype: 'pug',
        template: path.join(SOURCE_PATH, 'index.pug'),
        chunksSortMode: chunksSortMethod,
        hash: true
      })
    ],
    devServer: {
      contentBase: OUTPUT_PATH,
      historyApiFallback: true,
      stats: STATS
      // headers: {
      //   'Access-Control-Allow-Origin': '*',
      //   'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
      //   'Access-Control-Allow-Headers': 'X-Requested-With, content-type, Authorization',
      //   'Access-Control-Allow-Credentials': 'true',
      //   'Content-Security-Policy': 'default-src \'self\' \'unsafe-inline\''
      // }
    }
  },
  // Testing
  testing: {}
}

module.exports = webpackMerge(webpackConfig, webpackEnv[process.env.NODE_ENV]);
