const pluginName = 'SubModuleMainfiestEmitPlugin';

class SubModuleMainfiestEmitPlugin {
  apply(compiler) {
    compiler.hooks.assetEmitted.tap(pluginName, (file, { content, source, outputPath, compilation, targetPath }) => {
      if ( file === 'manifest.json') {
        const obj = JSON.parse(content.toString());
        const values = Object.values(obj);
        const js = [];
        const css = [];
        values.forEach(p => {
          if (p.toLowerCase().endsWith('.css')) { // css
              css.push(p);
          } else if (p.toLowerCase().endsWith('.js')) { // js
              js.push(p);
          }
        });
        const fileText = JSON.stringify({
            js, css,
            manifest: content.toString(),
        });
        console.log('submodule-assets:' + fileText);
      }
    })
    compiler.hooks.done.tap(pluginName, (stats) => {
      console.log('----------compiler done----------');
    })
  }
}

module.exports = SubModuleMainfiestEmitPlugin;