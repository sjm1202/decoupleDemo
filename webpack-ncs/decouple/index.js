import load from 'load-script';
import loadcss from 'loadcss';

if (!window.MICRO_APP_DECOUPLE_SUB_MODULE_STACK) {
    window.MICRO_APP_DECOUPLE_SUB_MODULE_STACK = new Map();
}

const MICROAPP_DECOUPLE = window.MICRO_APP_DECOUPLE_SUB_MODULE_STACK;

/**
 * 注册
 * @param {string} scope 作用域
 * @param {string} name 名称
 * @param {Object} opts 参数
 * @return {boolean} any
 */
export function register(scope, name, opts) {
    return MICROAPP_DECOUPLE.set(`${scope}#${name}`, opts);
}

export function set(scope, name, opts) {
    return register(scope, name, opts);
}

const InitedCache = {};

// 异步的，返回 promise
export function get(scope, name) {
    if (!scope || !name) return Promise.resolve();
    const info = MICROAPP_DECOUPLE.get(`${scope}#${name}`);
    if (!info && window.MicroApp) {
        const manifests = window.MicroApp.get('manifests');
        if (manifests) {
            const js = [];
            const css = [];
            const item = manifests[scope];
            if (item) {
                css.push(...(item.css || []));
                js.push(...(item.js || []));
            }
            if (css.length) {
                const _css = css.filter(i => !InitedCache[i]).map(i => {
                    InitedCache[i] = true;
                    return i;
                });
                if (_css.length) {
                    loadcss(_css, links => {
                        links.forEach(link => {
                            console.log('[Decouple LoadCss]', link.href);
                        });
                    });
                }
            }
            if (js.length) {
                return loadJs(js).then(() => {
                    return MICROAPP_DECOUPLE.get(`${scope}#${name}`);
                });
            }
        }
    }
    return Promise.resolve(info);
}

function loadJs(jss) {
    return [].concat(jss).reduce((chain, js) => {
        if (!InitedCache[js]) {
            chain = chain.then(() => new Promise(resolve => {
                load(js, { async: false }, function(err, script) {
                    if (err) {
                        // print useful message
                        console.error('[Decouple Load Error]', err);
                    } else {
                        InitedCache[js] = true;
                        console.log('[Decouple LoadJs]', script.src);
                    }
                    resolve(script);
                });
            }));
        }
        return chain;
    }, Promise.resolve());
}


export default {
    register, get, set,
};