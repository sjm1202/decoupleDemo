process.env.NODE_ENV = 'development'

const WebpackDevServer = require('webpack-dev-server');
const webpackConfig = require('../webpack.config');
const devServer = require('./devServer')();
const extendConfig = require('../extend.config');
const SubModuleMainfiestEmitPlugin = require('./plugins/subModuleMainfiestEmit');
const fs = require('fs');
const path = require('path');
const tmp = require('tmp');
const tmpobj = tmp.dirSync();
// console.log(tmpobj); 
// console.log(__dirname); // 当前js所在路径
// console.log(process.env.PWD) // 项目根路径

webpackConfig.plugins.unshift(
  new SubModuleMainfiestEmitPlugin()
)

if(extendConfig.subModule) {
  const namespace = extendConfig.subModule.namespace;
  const entry = extendConfig.subModule.entry;
  const subEntry = {};
  Object.keys(entry).forEach((key) => {
    const destPath = path.join(tmpobj.name, `subs-temp-file_${namespace}-${key}.js`);
    const sourcePath = path.join(process.env.PWD, entry[key]);
    fs.writeFileSync(destPath, `
      import subModule from '${sourcePath}';
      import decouple from 'myDecouple';
      decouple.register('${namespace}', '${key}', subModule);
    `);
    subEntry[key] = destPath;
  })
  webpackConfig.entry = subEntry;
  
}

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


