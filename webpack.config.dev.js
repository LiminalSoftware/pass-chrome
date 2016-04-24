var webpack = require('webpack');
var path = require('path');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var CleanWebpackPlugin = require('clean-webpack-plugin');
var CopyWebpackPlugin = require('copy-webpack-plugin');



module.exports = {
  entry: {
    popup  : [
    /**
     * NOT CURRENTLY USED FOR CHROME EXTENSION DEV ENV / DEBUGGING WORKFLOW
     //'webpack-dev-server/client?http://0.0.0.0:8080', // WebpackDevServer host and port
     //'webpack/hot/only-dev-server',
     */
      './src/index.jsx' // Your appʼs entry point
    ],
    options: ['./src/options/index.js'],
    background: ['./src/bg/background.js']
  },
  devtool: process.env.WEBPACK_DEVTOOL || 'source-map',
  output: {
    path: path.join(__dirname, 'dist'),
    filename: '[name]/[name].bundle.js'
  },
  resolve: {
    extensions: ['', '.js', '.jsx']
  },
  module: {
    loaders: [
      {
        test: /\.jsx?$/,
        exclude: /(node_modules|bower_components)/,
        //loaders: ['react-hot', 'babel'],
        loaders: ['babel'],
      },

      {
        test: /\.css$/,
        loader: 'style-loader!css-loader'
      },
      {
        test: /\.eot(\?v=\d+\.\d+\.\d+)?$/,
        loader: "file"
      },
      {
        test: /\.(woff|woff2)$/,
        loader: "url?prefix=font/&limit=5000"
      },
      {
        test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/,
        loader: "url?limit=10000&mimetype=application/octet-stream"
      },
      {
        test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
        loader: "url?limit=10000&mimetype=image/svg+xml"
      },
      {
        test: /\.gif/,
        loader: "url-loader?limit=10000&mimetype=image/gif"
      },
      {
        test: /\.jpg/,
        loader: "url-loader?limit=10000&mimetype=image/jpg"
      },
      {
        test: /\.png/,
        loader: "url-loader?limit=10000&mimetype=image/png"
      }
    ]
  },
  /**
   * NOT CURRENTLY USED FOR CHROME EXTENSION DEV ENV / DEBUGGING WORKFLOW
  //devServer: {
  //  //contentBase: "./",
  //  noInfo: true, //  --no-info option
  //  hot: true,
  //  inline: true
  //},
   */
  plugins: [
    new webpack.NoErrorsPlugin(),
    new CleanWebpackPlugin(['dist']),
    new CopyWebpackPlugin([
      { from: 'manifest.json' },
      {
        from: 'icons', to: 'icons'
      },
      {
        from: '_locales', to: '_locales'
      },
      {
        from: 'src/options_custom',
        to: 'options'
      }
    ]),
    //new HtmlWebpackPlugin({
    //  filename: 'options/options.html',
    //  chunks: ['options'],
    //  template: 'src/options_custom/index.html',
    //  inject: 'head'
    //}),
    /*
     * Instead of using file loader in index.jsx:1 we could use this plugin
     *   with a custom template that contains the app render element target (e.g. #myApp)
     */
    //new HtmlWebpackPlugin({
    //  filename: 'popup/popup.html',
    //  chunks: ['popup'],
    //  inject: 'head',
    //  template: 'src/popup.jsx'
    //}),
    new HtmlWebpackPlugin({
      filename: 'background/background.html',
      chunks: ['background'],
      inject: 'head'
    }),
  ]
};