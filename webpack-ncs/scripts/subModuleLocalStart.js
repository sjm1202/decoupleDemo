const path = require('path');
const url = require('url');
const shell = require('shelljs');
process.env.NODE_ENV = 'development';
let submodules = [];
const submoduleArg = process.argv.find(i => i.startsWith('--submodule-local='));
if (submoduleArg) {
  submodules = submoduleArg.replace('--submodule-local=', '').split(',')
}
const submoduleAssets = {}
const submoduleUrls = {}
let pArr = submodules.map(sub => {
  return new Promise(resolve => {
    const cwd = path.resolve(process.env.PWD, `../webpack-${sub}`);
    const child = shell.exec('npm run dev:asSubModule', {
        async: true, cwd,
        silent: true,
    });
    let i = 0;
    child.stdout.on('data', function(data) {
      data.split('\n').forEach(line => {
        if (/^submodule-assets:/.test(line)) {
          if(!submoduleAssets[`submodule-assets-${sub}`]) {
            const assets = JSON.parse(line.slice(17).trim());
            submoduleAssets[`submodule-assets-${sub}`] = assets;
          }
        }
        if (/Local:/.test(line)) {
          if (!submoduleUrls[`submodule-url-${sub}`]) {
              const r = url.parse(line.slice(10).trim());
              submoduleUrls[`submodule-url-${sub}`] = r
              
          }
        }
        if (/----------compiler done----------/.test(line)) {
          resolve();
        }
      });
    })
    child.on('error', function(err) {
      console.error(err);
      process.exit(1);
    });
  })
})

Promise.all(pArr).then(() => {
  console.log('--------------------------all sub start------------------------');
  runStart();
})

function runStart() {
  const WebpackDevServer = require('webpack-dev-server');
  const webpackConfig = require('../webpack.config');
  const devServer = require('./devServer')(submodules, submoduleAssets, submoduleUrls);
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
  // devServer.proxy = devServer.proxy || [];
  // devServer.proxy.unshift()
  const webpack = require('webpack');
  const compiler = webpack(webpackConfig);
  const options = devServer;
  const devservice = new WebpackDevServer(options, compiler);
  devservice.start();
}

