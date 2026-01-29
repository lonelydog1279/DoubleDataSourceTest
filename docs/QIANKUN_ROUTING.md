# Qiankun 主应用与子应用路由配置指南

## 概述

本项目使用 [qiankun](https://qiankun.umijs.org/) 微前端框架，包含一个主应用（qiankun-main）和一个子应用（vue-qiankun-element）。

## 架构图

```
┌─────────────────────────────────────────────────────────────┐
│                      浏览器地址栏                             │
│                  http://localhost/subapp/products            │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     主应用 (qiankun-main)                    │
│                        端口: 8000                            │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  activeRule: /subapp/*                              │    │
│  │  监听 URL 变化，当路径以 /subapp 开头时加载子应用      │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                  子应用 (vue-qiankun-element)                │
│                        端口: 5173                            │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  base: /subapp                                      │    │
│  │  接收到的路由: /products                             │    │
│  │  (Vue Router 自动去掉 base 前缀)                     │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

## 路由映射关系

| 浏览器 URL | 主应用识别 | 子应用路由 | 渲染组件 |
|-----------|-----------|----------|---------|
| `/` | 主应用首页 | - | 主应用 Home |
| `/subapp` | 加载子应用 | `/` | 子应用 Home.vue |
| `/subapp/products` | 加载子应用 | `/products` | 子应用 Products.vue |
| `/subapp/users` | 加载子应用 | `/users` | 子应用 Users.vue |
| `/subapp/config` | 加载子应用 | `/config` | 子应用 Config.vue |

## 主应用配置

### 1. 注册子应用 (main.ts)

```typescript
import { registerMicroApps, start } from 'qiankun'

registerMicroApps([
  {
    name: 'vue-qiankun-element',
    entry: '//localhost:5173',  // 子应用入口
    container: '#subapp-container',  // 挂载容器
    activeRule: (location) => {
      // 当 URL 以 /subapp 开头时激活子应用
      return location.pathname.startsWith('/subapp')
    }
  }
])

start()
```

### 2. 主应用导航菜单 (App.vue)

```typescript
const menuItems = [
  { path: '/', label: 'Home' },
  { path: '/subapp', label: '子应用首页' },
  { path: '/subapp/products', label: '产品管理' },
  { path: '/subapp/users', label: '用户管理' },
  { path: '/subapp/config', label: '系统配置' }
]
```

### 3. 路由导航 (useRouter.ts)

```typescript
export function useRouter() {
  const currentPath = ref(window.location.pathname)

  const navigate = (path: string) => {
    window.history.pushState({}, '', path)
    currentPath.value = path
    // 关键：触发 popstate 事件，让子应用感知 URL 变化
    window.dispatchEvent(new PopStateEvent('popstate', { state: {} }))
  }

  // ...
}
```

## 子应用配置

### 1. 路由定义 (router/index.ts)

```typescript
import { createRouter, createWebHistory } from 'vue-router'
import { qiankunWindow } from 'vite-plugin-qiankun/dist/helper'

// 路由表 - 不需要包含 /subapp 前缀
const routes = [
  { path: '/', component: Home },
  { path: '/products', component: Products },
  { path: '/users', component: Users },
  { path: '/config', component: Config }
]

export function createRouterInstance() {
  const isQiankun = qiankunWindow.__POWERED_BY_QIANKUN__

  // 从环境变量读取 router base
  const routerBase = import.meta.env.VITE_ROUTER_BASE || '/dual-datasource-test/'
  const qiankunRouterBase = import.meta.env.VITE_QIANKUN_ROUTER_BASE || '/subapp'

  // 关键：根据运行环境设置不同的 base
  const history = isQiankun
    ? createWebHistory(qiankunRouterBase)  // qiankun 环境，base 为 /subapp
    : createWebHistory(routerBase)         // 独立运行，base 为 /dual-datasource-test/

  return createRouter({ history, routes })
}
```

### 2. 生命周期钩子 (main.ts)

```typescript
import { renderWithQiankun } from 'vite-plugin-qiankun/dist/helper'

let routerInstance = null

renderWithQiankun({
  mount(props) {
    render(props)
    // 挂载后同步路由
    const currentPath = window.location.pathname
    if (currentPath.startsWith('/subapp')) {
      const subPath = currentPath.replace('/subapp', '') || '/'
      routerInstance.replace(subPath)
    }
  },
  bootstrap() { },
  unmount() { }
})
```

### 3. Vite 配置 (vite.config.ts)

```typescript
import qiankun from 'vite-plugin-qiankun'

export default defineConfig(({ mode }) => ({
  plugins: [
    vue(),
    qiankun('vue-qiankun-element', {
      useDevMode: mode === 'development'
    })
  ],
  // 生产环境 base 需要与 nginx 配置对应
  base: mode === 'production' ? '/subapp-entry/' : '/'
}))
```

## 路由同步机制

### 问题

主应用使用 `history.pushState()` 改变 URL 时，子应用的 Vue Router 不会自动更新，因为：

1. `history.pushState()` 不会触发 `popstate` 事件
2. Vue Router 只监听 `popstate` 事件（浏览器前进/后退）

### 解决方案

在主应用导航后手动触发 `popstate` 事件：

```typescript
// 主应用 useRouter.ts
const navigate = (path: string) => {
  window.history.pushState({}, '', path)
  currentPath.value = path
  // 手动触发 popstate，让子应用 router 更新
  window.dispatchEvent(new PopStateEvent('popstate', { state: {} }))
}
```

## base 参数详解

`createWebHistory(base)` 中的 `base` 是路由的**前缀**：

```
路由定义     +    base 前缀    =    实际 URL
──────────────────────────────────────────
/            +    /subapp     =    /subapp/
/products    +    /subapp     =    /subapp/products
/users       +    /subapp     =    /subapp/users
```

**重要：** 子应用路由表中**不需要**写 `/subapp` 前缀，Vue Router 会自动处理。

## 不同运行模式

### 开发模式（独立运行）

```bash
cd vue-qiankun-element
npm run dev
# 访问 http://localhost:5173/dual-datasource-test/products
```

- `base = '/dual-datasource-test/'`
- URL: `http://localhost:5173/dual-datasource-test/products`

### 开发模式（qiankun）

```bash
# 终端 1：启动子应用
cd vue-qiankun-element && npm run dev

# 终端 2：启动主应用
cd qiankun-main && npm run dev
# 访问 http://localhost:8000/subapp/products
```

- `base = '/subapp'`
- URL: `http://localhost:8000/subapp/products`

### 生产模式（Docker + Nginx）

```bash
./deploy.sh
# 访问 http://localhost/subapp/products
```

- 子应用 `base = '/subapp-entry/'`（静态资源路径）
- 路由 `base = '/subapp'`（运行时路由）

## 常见问题

### Q1: 子应用路由跳转后，浏览器 URL 没有变化？

检查子应用是否使用了 `createWebHistory` 而不是 `createMemoryHistory`。

### Q2: 刷新页面后子应用显示空白？

确保 Nginx 配置了 `try_files $uri $uri/ /index.html`，将所有路由请求指向主应用的 index.html。

### Q3: 主应用导航后子应用没有更新？

确保主应用在 `history.pushState()` 后触发了 `popstate` 事件。

### Q4: 子应用独立运行正常，但在 qiankun 中路由错误？

检查 `createRouterInstance()` 是否根据 `__POWERED_BY_QIANKUN__` 设置了正确的 base。

## 文件清单

| 文件 | 作用 |
|-----|-----|
| `qiankun-main/src/main.ts` | 注册子应用，配置 activeRule |
| `qiankun-main/src/App.vue` | 主应用布局和导航菜单 |
| `qiankun-main/src/composables/useRouter.ts` | 主应用路由导航 |
| `vue-qiankun-element/src/router/index.ts` | 子应用路由配置 |
| `vue-qiankun-element/src/main.ts` | 子应用生命周期钩子 |
| `vue-qiankun-element/vite.config.ts` | 子应用 Vite 配置 |
| `nginx.conf` | 生产环境 Nginx 路由配置 |
