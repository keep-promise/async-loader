/**
 * 全局单例单例
 */
window.__ASYNC_LOADER_MODULES__ = window.__ASYNC_LOADER_MODULES__ || {};

const __ASYNC_LOADER_MODULES__ = window.__ASYNC_LOADER_MODULES__;

export function getInstance<T>(key: string, factory: () => T) {
  let value: T = __ASYNC_LOADER_MODULES__[key]

  if (typeof value === 'undefined') {
    value = __ASYNC_LOADER_MODULES__[key] = factory()
  }

  return value;
}
