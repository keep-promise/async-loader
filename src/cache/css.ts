/**
 * css缓存
 */

import { Cache, BaseModule, ModuleStatus } from './cache'
import { getInstance } from '../instance'

export interface CSSModule extends BaseModule {
  el: HTMLLinkElement | null
}

const cssCache = getInstance('cssCache', () => {
  return new Cache<CSSModule>((key: string) => {
    return {
      url: key,
      status: ModuleStatus.NONE,
      el: null,
      error: null,
      reject: null
    }
  })
});

export default cssCache;
