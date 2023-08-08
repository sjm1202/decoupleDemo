const path = require('path');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const { WebpackManifestPlugin } = require('webpack-manifest-plugin');
const VueLoaderPlugin = require("vue-loader/lib/plugin");
const packageJSON = require('./package.json');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports = {
  mode: process.env.NODE_ENV,
  resolve: {
    alias: {
      myDecouple: path.resolve(__dirname, 'decouple'),
    },
  },
  entry: {
    index: path.join(__dirname, 'src/index.js'),
  },
  output: {
    filename: process.env.NODE_ENV === 'production' ? `[name].${packageJSON.name}.[fullhash].js` : `[name].${packageJSON.name}.js`,
    path: path.resolve(__dirname, 'public'),
    clean: true,
    publicPath: process.env.NODE_ENV === 'production' ? '/public' : `/public/local_proxy-${packageJSON.name}`
  },
  // externals: {
  //   vue: 'Vue',
  // },
  module: {
    rules: [
      {
        test: /\.vue$/,
        use: [ 'vue-loader' ]
      },
      {
        test: /\.css$/i,
        use: [MiniCssExtractPlugin.loader, 'css-loader'],
      },
    ],
  },
  plugins: [
    new WebpackManifestPlugin({}),
    new MiniCssExtractPlugin(),
    new VueLoaderPlugin(),
    new CleanWebpackPlugin(),
  ],
  // devtool: 'inline-source-map',
};

