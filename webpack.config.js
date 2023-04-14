const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const webpack = require('webpack')
module.exports = function (env, argv) {
  return {
    entry: './src/index.ts',
    output: {
      filename: 'main.[contenthash].js',
      path: path.resolve(__dirname, 'dist'),
      clean: true
    },
    resolve: {
      extensions: ['.wasm', '.mjs', '.js', '.json', '.ts', '.tsx']
    },
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          loader: 'ts-loader'
        },
        {
          test: /\.(wgsl|glsl|vert|frag|txt)$/,
          type: 'asset/source'
        }
      ]
    },
    plugins: [
      new webpack.DefinePlugin({
        PRODUCTION: JSON.stringify(argv.mode === 'production')
      }),
      new HtmlWebpackPlugin({
        template: 'src/index.html'
      })
    ],
    experiments: {
      topLevelAwait: true
    },
    devtool: 'source-map',
    devServer: {
      // host: 'dev.bilibili.com',
      host: '0.0.0.0',
      port: 8000,
      hot: true,
      static: path.join(__dirname, 'public')
    }
  }
}
