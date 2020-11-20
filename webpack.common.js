const path = require('path');
// const webpack = require('webpack');
// const merge = require('webpack-merge');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
// const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');

const srcPath = path.resolve(__dirname, 'src');
const dir = {
  js: `${srcPath}/scripts`,
  style: `${srcPath}/styles`,
  imgs: `${srcPath}/images`,
};

module.exports = {
  entry: {
    index: [
      `${dir.js}/index.js`,
    ],
  },
  // externals: {
  //   jquery: 'jQuery',
  // },
  plugins: [
    new CopyWebpackPlugin([{
      from: `${dir.js}/json`,
      to: './json',
    }]),
    new CleanWebpackPlugin(['dist']),
    new HtmlWebpackPlugin({
      template: `${srcPath}/index.html`,
      favicon: `${dir.imgs}/favicon.png`,
      minify: {
        collapseWhitespace: true,
        removeComments: true,
      },
    }),
    new ExtractTextPlugin({
      filename: '[name].[contenthash].css',
    }),
  ],
  module: {
    rules: [
      {
        test: /\.scss$/,
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: ['css-loader', 'sass-loader'],
        }),
        // use: [
        //   'style-loader',
        //   'css-loader',
        //   'sass-loader',
        // ],
      },

      {
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader',
        },
      },
      {
        test: /\.(png|jpg|svg|gif)$/,
        use: {
          loader: 'url-loader',
          options: {
            limit: 8192,
          },
        },
      },
      {
        test: /\.html$/,
        use: {
          loader: 'html-loader',
        },
      },
    ],
  },
};
