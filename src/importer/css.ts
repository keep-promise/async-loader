/**
 * 加载CSS
 */

import { CacheStatus } from '../cache/cache'
import cache from '../cache/css'

function importACss(url: string): Promise<void> {
  const item = cache.getOrCreateItemByURL(url)
  const { status, error } = item

  if (status === CacheStatus.LOADED) {
    return Promise.resolve()
  }

  if (status === CacheStatus.ERROR) {
    return Promise.reject(error)
  }

  if (status === CacheStatus.LOADING) {
    return new Promise((resolve, reject) => {
      const { el } = item
      const loadCallback = () => {
        el!.removeEventListener('load', loadCallback)
        resolve()
      }
      const errorCallback = (evt: ErrorEvent) => {
        el!.removeEventListener('error', errorCallback)
        reject(evt.error)
      }

      el!.addEventListener('load', loadCallback)
      el!.addEventListener('error', errorCallback)
    })
  }

  item.status = CacheStatus.LOADING

  return new Promise((resolve, reject) => {
    const el = document.createElement('link')

    el.rel = 'stylesheet'
    el.href = url

    const loadCallback = () => {
      el.removeEventListener('load', loadCallback)

      item.status = CacheStatus.LOADED
      item.el = null
      resolve()
    }

    const errorCallback = (evt: ErrorEvent) => {
      el!.removeEventListener('error', errorCallback)

      const error = evt.error || new Error(`Load css failed. href=${url}`)

      item.status = CacheStatus.ERROR
      item.error = error
      item.el = null

      reject(error)
    }

    el.addEventListener('load', loadCallback)
    el.addEventListener('error', errorCallback)

    item.el = el
    document.head.appendChild(el)
  })
}

function removeACSS(url: string): Promise<void> {
  const item = cache.tryGetItemByURL(url)

  if (!item || !item.el) {
    return Promise.resolve()
  }

  if (item.status === CacheStatus.LOADING) {
    return Promise.reject(new Error(`Can NOT unimport a loading css file.`))
  }

  document.head.removeChild(item.el)

  return Promise.resolve()
}

export function importCss(urls: Array<string>): Promise<void> {
  return Promise.all(urls.map(url => importACss(url)))
    .then(() => {
      return Promise.resolve()
    })
    .catch(err => {
      return Promise.reject(err)
    })
}

export function unimportCSS(urls: Array<string>) {
  urls.forEach(url => removeACSS(url))
}
