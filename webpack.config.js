const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')

module.exports = {
  // devtool: 'inline-source-map',
	entry: './src/index.js',
	output: {
		filename: 'main.js',
		path: path.resolve(__dirname, 'dist')
  },
  module: {
    rules: [
      {
        test: /\.(glsl|vert|frag|txt)$/,
        use: 'raw-loader'
      }
    ]
  },
  plugins: [
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      template: 'src/index.html'
    })
  ],
  devServer: {
    port: 8000,
    hot: true,
    disableHostCheck: true,
    contentBase: path.join(__dirname, 'public')
  }
}
