/**
 * 加载器：js模块/css模块
 */

 import { importJs } from './importer/js';
import { importCss } from './importer/css';

/**
 * 远程模块信息
 *
 * @interface loadModuleOptions
 */
interface loadModuleOptions {
  // js文件列表
  js: Array<string>
  // css文件列表
  css: Array<string>
  // 是否以umd格式加载js文件
  umd?: boolean
  crossOrigin?: string
}

/**
 * 加载一个模块
 *
 * @export
 * @param {loadModuleOptions} moduleOptions 模块配置信息
 * @returns {Promise<any>}
 */
export async function loadModule(moduleOptions: loadModuleOptions): Promise<any> {
  const { js, css, umd, crossOrigin } = moduleOptions;
  // 加载远程css
  await importCss(css);
  // 加载远程js
  const Module = await importJs(js, {
    umd: typeof umd === 'undefined' ? true : umd,
    crossOrigin: typeof crossOrigin === 'undefined' ? 'anonymous' : crossOrigin
  });

  return Module;
}

type LoadJsOptions = {
  umd?: boolean
  crossOrigin?: string
}

const defaultLoadJsOptions = {
  umd: true,
  crossOrigin: 'anonymous'
}

/**
 * 加载js脚本.
 *
 * @export
 * @param {string} url 脚本地址
 * @param {ImportScriptOptions} [options={ umd: true }] 配置项
 * @returns {Promise<any>}
 */
export async function loadJs(
  url: string,
  options: LoadJsOptions = defaultLoadJsOptions
): Promise<any> {
  const opt = { ...defaultLoadJsOptions, ...options }
  const ret = await loadModule({ js: [url], css: [], ...opt })
  return ret
}

/**
 * 加载一个css文件.
 *
 * @export
 * @param {string} url css地址
 * @returns {Promise<any>}
 */
export async function loadCss(url: string): Promise<void> {
  const ret = await loadModule({ css: [url], js: [] })
  return ret
}

const loader = { loadModule, loadJs, loadCss };

export default loader;
