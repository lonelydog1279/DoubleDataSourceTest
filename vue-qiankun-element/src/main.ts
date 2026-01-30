import { createApp, type App as VueApp } from 'vue'
import { renderWithQiankun, qiankunWindow } from 'vite-plugin-qiankun/dist/helper'
import App from './App.vue'
import router, { createRouterInstance } from './router'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

import * as ElementPlusIconsVue from '@element-plus/icons-vue'

let app: VueApp<Element> | null = null
let routerInstance = router

function render(props: { container?: Element; data?: any } = {}) {
  const { container } = props

  // 每次渲染时创建新的路由实例
  routerInstance = createRouterInstance()

  app = createApp(App)
  for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component)
  }
  app.use(ElementPlus)
  app.use(routerInstance)

  const mountElement = container
    ? (container.querySelector('#app') as Element)
    : document.getElementById('app')!

  app.mount(mountElement)
}

// Qiankun lifecycle hooks
renderWithQiankun({
  mount(props) {
    console.log('[vue-qiankun-element] mount with props:', props)
    render(props)
    // 挂载后同步路由：根据当前 URL 导航到正确的子应用路由
    // const currentPath = window.location.pathname
    // if (currentPath.startsWith('/subapp')) {
    //   const subPath = currentPath.replace('/subapp', '') || '/'
    //   routerInstance.replace(subPath)
    // }
  },
  bootstrap() {
    console.log('[vue-qiankun-element] bootstrap')
  },
  unmount() {
    console.log('[vue-qiankun-element] unmount')
    if (app) {
      app.unmount()
      app = null
    }
  },
  update(props) {
    console.log('[vue-qiankun-element] update with props:', props)
  }
})

// Standalone mode (not in qiankun)
if (!qiankunWindow.__POWERED_BY_QIANKUN__) {
  render()
}
