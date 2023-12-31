/**
 * 加载JS
 */

import { ModuleStatus } from '../cache/cache';
import cache, { JSModule } from '../cache/js';
import addItem from './define'

type ImportAJSOption = {
  umd: boolean
  crossOrigin: string
}

function doImportAJs(item: JSModule, url: string, options: ImportAJSOption): Promise<any> {
  item.status = ModuleStatus.LOADING

  const { umd, crossOrigin } = options

  return new Promise((resolve, reject) => {
    const el = document.createElement('script')

    el.src = url
    // 保持时序
    el.async = false
    el.crossOrigin = crossOrigin

    if (umd) {
      // 用于define函数发生错误时调用, 详见define.ts
      item.reject = reject

      // 以//开头的地址以及相对地址, 传给el.src后会被补全
      const realURL = el.src
      // 插入加载队列, 详见define.ts
      addItem(realURL, item)
    }

    const loadCallback = () => {
      el.removeEventListener('load', loadCallback)

      item.status = ModuleStatus.LOADED
      item.el = null

      resolve(item.exportThing)
    }

    const errorCallback = (evt: ErrorEvent) => {
      el.removeEventListener('error', errorCallback)

      const error = evt.error || new Error(`Load javascript failed. src=${url}`)

      item.status = ModuleStatus.ERROR
      item.error = error
      item.el = null

      reject(error)
    }

    el.addEventListener('load', loadCallback)
    el.addEventListener('error', errorCallback)

    item.el = el
    document.body.appendChild(el)
  })
}

function importAJS(url: string, options: ImportAJSOption): Promise<any> {
  const item = cache.getOrCreateItemByURL(url)
  const { status, exportThing, error } = item

  if (status === ModuleStatus.LOADED) {
    return Promise.resolve(exportThing)
  }

  if (status === ModuleStatus.ERROR) {
    return Promise.reject(error)
  }

  if (status === ModuleStatus.LOADING) {
    const { el } = item

    return new Promise((resolve, reject) => {
      const loadCallback = () => {
        el!.removeEventListener('load', loadCallback)
        resolve(item.exportThing)
      }

      const errorCallback = (evt: ErrorEvent) => {
        el!.removeEventListener('error', errorCallback)
        reject(evt.error)
      }

      el!.addEventListener('load', loadCallback)
      el!.addEventListener('error', errorCallback)
    })
  }

  return doImportAJs(item, url, options)
}

type ImportJSOption = {
  umd?: boolean
  crossOrigin?: string
}

const defaultImportOptions = {
  umd: true,
  // 避免window.onerror拿不到脚本的报错, 需要服务器支持
  crossOrigin: 'anonymous'
}

export function importJs(urls: Array<string>, options: ImportJSOption): Promise<any> {
  const opt = { ...defaultImportOptions, ...options }

  let chain = Promise.resolve()
  const lastIndex = urls.length - 1
  const { umd } = opt

  urls.forEach((url, index) => {
    // 只有最后一个js使用umd模式加载
    const useUmd = umd && index === lastIndex
    chain = chain.then(() => importAJS(url, { ...opt, umd: useUmd }))
  })

  return chain
}
