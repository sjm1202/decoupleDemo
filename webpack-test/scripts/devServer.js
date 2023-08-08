const packageJSON = require('../package.json');
const fs = require('fs');
const { result } = require('lodash');
const path = require('path');

function injectDevServerJs(req, html) {
  const devEnvStr = createDevEnvStr(req);
  html = html.replace('</body>', `${devEnvStr}</body>`);
  return html;
}
function changeBody(proxyRes, req, res, cb) {
  let body = Buffer.from('');
  if (!res.$$$end) { res.$$$end = res.end; }
  res.write = () => ({});
  proxyRes.on('data', data => {
      body = Buffer.concat([ body, data ]);
  });
  res.end = function(data, encoding) {
      let output = body.toString('utf-8');
      cb && (output = cb(output));
      output = Buffer.from(output);
      res.setHeader('content-length', output.length);
      return res.$$$end(output);
  };
}

function changeAssets(req, filename, submodules, submoduleAssets, output) {
  const tempLoadHtml = '<h1>Loading...</h1><script>(function() { console.info("auto reload..."); setTimeout(function() { location.reload(); }, 1500);})();</script>';
  if (!filename) return tempLoadHtml;
  const jsStr = `<script type="text/javascript">(function(){var dev = document.createElement('div');dev.innerHTML = "<div style='position: fixed;bottom: 0px;right: 0px;padding: 3px 10px;font-size: 12px;text-align: center;background: black;opacity: 0.5;color: #ffffff;z-index: 100000;pointer-events: none;'>当前页面为本地开发<div>";document.body.appendChild(dev);})()</script>\n`;

  const htmlPath = path.resolve('public', `${filename}.html`);
  if (!fs.existsSync(htmlPath)) return tempLoadHtml;

  const html = fs.readFileSync(htmlPath);
  const cheerio = require('cheerio');
  const _$ = cheerio.load(html);
  const $ = cheerio.load(output);
  $('body').find('script[src]').remove();
  $('head').find('script[src]').remove();
  $('head>script').each((index, ele) => _$('head').append(ele));
  $('body>script').each((index, ele) => _$('body').append(ele));

  if (submodules.length) {
    submodules.forEach(sub => { // 本地开发修改
      const devEnvStr = submoduleAssets[`submodule-assets-${sub}`];
      $('body>div[id=_MICRO_APP_INJECT_]').append(
          `<script type="text/javascript">
              MicroApp.get('manifests').${sub} = ${JSON.stringify(devEnvStr)};
          </script>`
      );
  });
  }
  const el = $('body>div[id=_MICRO_APP_INJECT_]').get();
  _$('body').prepend(el);
  _$('body').append(jsStr);
  return _$.html();
}

function generateSubProxy(submodules, submoduleUrls) {
  const result = {};
  submodules.forEach(sub => {
    result[`^/public/local_proxy-${sub}`] = {
      target: '/',
      router(req) { // 动态target
        if (req && req.hostname) {
          // console.log(`${req.protocol}://${req.hostname}:${submoduleUrls[`submodule-url-${sub}`].port}`)
          return `${req.protocol}://${req.hostname}:${submoduleUrls[`submodule-url-${sub}`].port}`;
        }
        return ''
      },
      changeOrigin: true,
    }
  });
  return result;
}


module.exports = function (submodules = [], submoduleAssets = {}, submoduleUrls = {}) {
  console.log(submoduleAssets)
  return {
    onListening: function (devServer) {
      if (!devServer) {
        throw new Error('webpack-dev-server is not defined');
      }
      const port = devServer.server.address().port;
      console.log(`Local: http://localhost:${port}`);
    },
    compress: true,
    allowedHosts: 'all',
    devMiddleware: {
      writeToDisk: (filePath) => {
        return true;
        // return /.html$/.test(filePath) || /manifest.json$/.test(filePath);
      },
    },
    proxy: {
      // '/apis': {
      //   target: 'http://console.test253-qingzhou.com',
      //   pathRewrite: { '^/apis': '' },
      //   changeOrigin: true,
      // },
      // '/kubecube/proxy': {
      //   target: '/',
      //   router(req) { // 动态target
      //       console.log('/auth/proxy');
      //       if (req && req.hostname) {
      //           return `${req.protocol}://${req.hostname.replace(/^dev\./ig, '')}`;
      //       }
      //       return ''
      //   },
      //   changeOrigin: true,
      // },
      // submodule静态资源代理
      ...generateSubProxy(submodules, submoduleUrls),
      // 
      '/' : {
        target: '/',
        router(req) { // 动态target
            // console.log(req.hostname) // dev.console.test253-qingzhou.com
            if (req && req.hostname) {
                return `${req.protocol}://${req.hostname.replace(/^dev\./ig, '')}`;
            }
            return ''
        },
        changeOrigin: true,
        onProxyReq(proxyReq, req, res) {
          // 期望Http响应采用的压缩方式 gzip deflate sdch为压缩算法  q=0 为设置算法权重优先级
          proxyReq.setHeader('accept-encoding', 'gzip;q=0,deflate,sdch');
          proxyReq.setHeader('cache-control', 'max-age=0');
        },
        onProxyRes(proxyRes, req, res) {
          // console.log(req.headers);
          if (proxyRes.req.method === 'GET' && proxyRes.req.res && proxyRes.req.res.headers && /html/.test(proxyRes.req.res.headers['content-type'])) {
            // 请求html
            changeBody(proxyRes, req, res, (output) => {
              // 将当前模块的html替换成本地html
              if (req.originalUrl === `/${packageJSON.name}`) {
                output = changeAssets(req, packageJSON.name, submodules, submoduleAssets, output);
              }
              res.status(200);
              res.setHeader('content-type', 'text/html;charset=utf-8');
              res.setHeader('cache-control', 'max-age=0');
              return output;
            })
            
          }
        }
      }
    },
  };
}