/**
 * js缓存
 */

import { Cache, BaseModule, ModuleStatus } from './cache'
import { getInstance } from '../instance'

export interface JSModule extends BaseModule {
  el: HTMLScriptElement | null
  exportThing: any
}

const jsCache = getInstance('jsCache', () => {
  return new Cache<JSModule>((key: string) => {
    return {
      url: key,
      status: ModuleStatus.NONE,
      el: null,
      error: null,
      reject: null,
      exportThing: void 0
    }
  })
})

export default jsCache
