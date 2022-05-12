const path = require('path')
const WebpackBar = require('webpackbar')
const HtmlWebpackPlugin = require('html-webpack-plugin')

// distance, sky, ring
const demoName = "ring"
module.exports = {
  mode: "development",
  // entry: "./app.js",
  entry: `./${demoName}/index.js`,
  output: {
    filename: "build.js",
    path: path.join(__dirname, "./dist")
  },
  devtool: "source-map",
  module: "commonjs",
  devServer: {
    port: 8888,
    open: false,
    compress: false,
    contentBase: path.join(__dirname, `./${demoName}`)
    // contentBase: path.join(__dirname, `./`)
  },
  plugins: [
    new WebpackBar(),
    new HtmlWebpackPlugin({
      title: "hello",
      filename: "index.html",
      template: "./index.html",
      inject: true
    })
  ],
  module: {
    rules: [{
        test: /\.frag$/,
        use: [{
          // 本地引用loader
          loader: path.resolve('./shader-chunks-loader'),
        }]
      },
      {
        test: /\.vert$/,
        use: [{
          // 本地引用loader
          loader: path.resolve('./shader-chunks-loader'),
        }]
      },
      {
        test: /\.js$/,
        use: [{
          loader: 'babel-loader',
        }]
      }
    ]
  }
}
