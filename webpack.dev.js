const path = require('path');
const webpack = require('webpack');
const merge = require('webpack-merge');
const common = require('./webpack.common');

module.exports = merge(common, {
  // output: {
  //   filename: '[name].js',
  //   path: path.resolve(__dirname, 'dist'),
  // },
  plugins: [
    // new webpack.NamedModulesPlugin(),
    // new webpack.HotModuleReplacementPlugin(),
  ],
  devtool: 'inline-source-map',
  devServer: {
    contentBase: path.join(__dirname, 'dist'),
    // compress: true,
    // port: 9000,
    // hot: true,
  },

});
