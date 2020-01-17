import {
  currentApp,
  currentComponent,
  getCurrentInstance,
  AppInstance,
  PageInstance,
  ComponentInstance
} from './instance'
import { AppLifecycle } from './app'
import { PageLifecycle, Query } from './page'
import { ComponentLifecycle } from './component'
import { toHiddenField } from './utils'

const warnMsg =
  'Page specific lifecycle injection APIs can only be used during execution of setup() in definePage() or defineComponent().'

export const onAppShow = createAppHook<
  (options: WechatMiniprogram.App.LaunchShowOption) => unknown
>(AppLifecycle.ON_SHOW)
export const onAppHide = createAppHook(AppLifecycle.ON_HIDE)
export const onAppError = createAppHook<(error: string) => unknown>(
  AppLifecycle.ON_ERROR
)
export const onPageNotFound = createAppHook<
  (options: WechatMiniprogram.App.PageNotFoundOption) => unknown
>(AppLifecycle.ON_PAGE_NOT_FOUND)
export const onUnhandledRejection = createAppHook<
  (options: WechatMiniprogram.OnUnhandledRejectionCallbackResult) => unknown
>(AppLifecycle.ON_UNHANDLED_REJECTION)

export const onReady = createPageHook(PageLifecycle.ON_READY)
export const onShow = createPageHook(PageLifecycle.ON_SHOW)
export const onHide = createPageHook(PageLifecycle.ON_HIDE)
export const onUnload = createPageHook(PageLifecycle.ON_UNLOAD)
export const onPullDownRefresh = createPageHook(
  PageLifecycle.ON_PULL_DOWN_REFRESH
)
export const onReachBottom = createPageHook(PageLifecycle.ON_REACH_BOTTOM)
export const onResize = createPageHook<
  (resize: WechatMiniprogram.Page.IResizeOption) => unknown
>(PageLifecycle.ON_RESIZE)
export const onTabItemTap = createPageHook<
  (tap: WechatMiniprogram.Page.ITabItemTapOption) => unknown
>(PageLifecycle.ON_TAB_ITEM_TAP)

export const onPageScroll = (
  hook: (scroll: WechatMiniprogram.Page.IPageScrollOption) => unknown
): void => {
  const currentInstance = getCurrentInstance()
  if (currentInstance) {
    if (currentInstance._listenPageScroll) {
      injectHook(currentInstance, PageLifecycle.ON_PAGE_SCROLL, hook)
    } else if (__DEV__) {
      console.warn(
        'onPageScroll() hook only works when `listenPageScroll` is configured to true.'
      )
    }
  } else if (__DEV__) {
    console.warn(warnMsg)
  }
}

export const onShareAppMessage = (
  hook: (
    share: WechatMiniprogram.Page.IShareAppMessageOption
  ) => WechatMiniprogram.Page.ICustomShareContent
): void => {
  const currentInstance = getCurrentInstance()
  if (currentInstance) {
    if (currentInstance._isInjectedShareHook) {
      const hiddenField = toHiddenField(PageLifecycle.ON_SHARE_APP_MESSAGE)
      if (currentInstance[hiddenField] === undefined) {
        currentInstance[hiddenField] = hook
      } else if (__DEV__) {
        console.warn('onShareAppMessage() hook can only be called once.')
      }
    } else if (__DEV__) {
      console.warn(
        'onShareAppMessage() hook only works when `onShareAppMessage` option is not exist.'
      )
    }
  } else if (__DEV__) {
    console.warn(warnMsg)
  }
}

export const onLoad = createComponentHook<(query: Query) => unknown>(
  PageLifecycle.ON_LOAD
)
export const onAttach = createComponentHook(ComponentLifecycle.ATTACHED)
export const onMove = createComponentHook(ComponentLifecycle.MOVED)
export const onDetach = createComponentHook(ComponentLifecycle.DETACHED)
export const onError = createComponentHook<(error: Error) => unknown>(
  ComponentLifecycle.ERROR
)

function createAppHook<T extends Function = () => unknown>(
  lifecycle: AppLifecycle
) {
  return (hook: T): void => {
    if (currentApp) {
      injectHook(currentApp, lifecycle, hook)
    } else if (__DEV__) {
      console.warn(
        'App specific lifecycle injection APIs can only be used during execution of setup() in createApp().'
      )
    }
  }
}

function createPageHook<T extends Function = () => unknown>(
  lifecycle: PageLifecycle
) {
  return (hook: T): void => {
    const currentInstance = getCurrentInstance()
    if (currentInstance) {
      injectHook(currentInstance, lifecycle, hook)
    } else if (__DEV__) {
      console.warn(warnMsg)
    }
  }
}

function createComponentHook<T extends Function = () => unknown>(
  lifecycle: PageLifecycle.ON_LOAD | ComponentLifecycle
) {
  return (hook: T): void => {
    if (currentComponent) {
      injectHook(currentComponent, lifecycle, hook)
    } else if (__DEV__) {
      console.warn(
        'Component specific lifecycle injection APIs can only be used during execution of setup() in defineComponent().'
      )
    }
  }
}

function injectHook(
  currentInstance: AppInstance | PageInstance | ComponentInstance,
  lifecycle: AppLifecycle | PageLifecycle | ComponentLifecycle,
  hook: Function
): void {
  const hiddenField = toHiddenField(lifecycle)
  if (currentInstance[hiddenField] === undefined) {
    currentInstance[hiddenField] = []
  }

  currentInstance[hiddenField].push(hook)
}
