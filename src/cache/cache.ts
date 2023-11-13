/**
 * 模块缓存
 */

type Reject = (reason?: any) => void

// 加载模块状态
export enum ModuleStatus {
  NONE,
  LOADING,
  LOADED,
  ERROR
}

// 模块基本信息
export interface BaseModule {
  url: string;            // 模块地址
  status: ModuleStatus    // 模块状态
  el: HTMLElement | null  // 模块dom
  error: Error | null     // 错误信息
  reject: Reject | null   // 加载失败信息
}

type Modules<Module extends BaseModule> = Record<string, Module | null>

export class Cache<Module extends BaseModule> {

  data: Modules<Module> = {}
  private factory: (key: string) => Module

  constructor(factory: (key: string) => Module) {
    this.factory = factory
  }

  getOrCreateItemByURL(key: string): Module {
    let module = this.data[key];

    if (!module) {
      module = this.data[key] = this.factory(key);
    }

    return module;
  }

  tryGetItemByURL(key: string): Module | null {
    return this.data[key] ?? null;
  }

  removeItemByURL(key: string) {
    const module = this.data[key];

    if (!module) {
      return module;
    }

    this.data[key] = null;

    return module;
  }
}
