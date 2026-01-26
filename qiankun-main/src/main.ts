import { createApp } from 'vue'
import { registerMicroApps, start, setDefaultMountApp } from 'qiankun'
import ElementPlus from 'element-plus'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import 'element-plus/dist/index.css'
import App from './App.vue'
import './style.css'

const app = createApp(App)

// Register Element Plus icons
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

app.use(ElementPlus)
app.mount('#main-app')

// Register micro apps
registerMicroApps(
  [
    {
      name: 'vue-qiankun-element',
      entry: '//localhost:5173',
      container: '#subapp-container',
      // 支持子应用的所有路由
      activeRule: (location) => {
        return location.pathname.startsWith('/subapp')
      },
      props: {
        msg: 'Hello from main app',
        // 传递主应用的路由信息给子应用
        mainAppRouter: window.location.pathname
      }
    }
  ],
  {
    beforeLoad: [
      (app) => {
        console.log('[Main App] before load', app.name)
        return Promise.resolve()
      }
    ],
    beforeMount: [
      (app) => {
        console.log('[Main App] before mount', app.name)
        return Promise.resolve()
      }
    ],
    afterMount: [
      (app) => {
        console.log('[Main App] after mount', app.name)
        return Promise.resolve()
      }
    ],
    afterUnmount: [
      (app) => {
        console.log('[Main App] after unmount', app.name)
        return Promise.resolve()
      }
    ]
  }
)

// Set default mount app (optional)
setDefaultMountApp('/subapp')

// Start qiankun
start({
  sandbox: {
    experimentalStyleIsolation: true
  }
})
