process.env.NODE_ENV = 'development'

const WebpackDevServer = require('webpack-dev-server');
const webpackConfig = require('../webpack.config');
const devServer = require('./devServer')();
const HtmlWebpackPlugin = require('html-webpack-plugin');
const packageJSON = require('../package.json');
webpackConfig.plugins.unshift(
  new HtmlWebpackPlugin({
    template: 'src/index.html',
    title: packageJSON.name,
    filename: `${packageJSON.name}.html`,
  })
)
// 
if(devServer.proxy && typeof devServer.proxy === 'object' && !Array.isArray(devServer.proxy)) {
  devServer.proxy = Object.keys(devServer.proxy).map(context => {
    return {
      ...devServer.proxy[context],
      context(pathname) {
        return pathname.match(context)
      },
    }
  })
}
const webpack = require('webpack');
const compiler = webpack(webpackConfig);
const options = devServer;
const devservice = new WebpackDevServer(options, compiler);
devservice.start();


