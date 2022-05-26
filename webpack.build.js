const path = require('path')
const WebpackBar = require('webpackbar')

// distance, sky, ring
const demoName = "ring"
module.exports = {
  mode: "development",
  // entry: "./src/index.js",
  entry: `./${demoName}/index.js`,
  // entry: "./aaa.js",
  output: {
    filename: "playcanvas-extras.js",
    path: path.join(__dirname, "./build/")
  },
  devtool: "source-map",
  module: "commonjs",
  devServer: {
    port: 8888,
    open: false,
    compress: false,
    contentBase: path.join(__dirname, "./")
  },
  plugins: [
    new WebpackBar(),
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
