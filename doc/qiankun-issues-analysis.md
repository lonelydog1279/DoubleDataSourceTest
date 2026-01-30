# Qiankun 微前端通信问题分析报告

## 问题概览

| # | 问题 | 严重程度 | 文件位置 |
|---|------|----------|----------|
| 1 | 路由同步竞态条件 | HIGH | `qiankun-main/src/composables/useRouter.ts` |
| 2 | 事件监听器内存泄漏 | HIGH | `qiankun-main/src/composables/useRouter.ts` |
| 3 | 路由状态未重置 | HIGH | `vue-qiankun-element/src/main.ts` |
| 4 | 异步挂载竞态条件 | **CRITICAL** | `vue-qiankun-element/src/main.ts` |
| 5 | Token 缓存未清理 | MEDIUM | `vue-qiankun-element/src/api/api.ts` |
| 6 | Props 未被使用 | LOW | 两个 main.ts 文件 |
| 7 | 无 401 响应拦截器 | HIGH | `vue-qiankun-element/src/api/api.ts` |
| 8 | 待处理请求未取消 | MEDIUM | Views + api.ts |

---

## 问题 1: 路由同步竞态条件

**文件**: `qiankun-main/src/composables/useRouter.ts`

**问题代码**:
```typescript
const navigate = (path: string) => {
  window.history.pushState({}, '', path)
  currentPath.value = path
  // popstate 事件同步触发，子应用可能还没准备好
  window.dispatchEvent(new PopStateEvent('popstate', { state: {} }))
}
```

**症状**:
- 子应用路由可能无法立即接收到 `popstate` 事件
- 主应用 URL 和子应用显示的路由可能不同步
- 快速点击菜单可能导致导航跳过或重复
- 浏览器历史记录可能损坏

**修复方案**:
```typescript
const navigate = (path: string) => {
  window.history.pushState({}, '', path)
  currentPath.value = path

  // 使用 setTimeout 确保事件监听器已准备好
  setTimeout(() => {
    window.dispatchEvent(new PopStateEvent('popstate', { state: {} }))
  }, 0)
}
```

---

## 问题 2: 事件监听器内存泄漏

**文件**: `qiankun-main/src/composables/useRouter.ts`

**问题代码**:
```typescript
onMounted(() => {
  window.addEventListener('popstate', handlePopState)
})

onUnmounted(() => {
  window.removeEventListener('popstate', handlePopState)  // ← 问题
})
```

**症状**:
- 如果多个 Vue 组件使用同一个 composable，每个实例都会添加监听器
- 组件挂载/卸载多次时，事件监听器会累积
- 内存使用随导航增加
- 导航时触发多次路由更新

**修复方案**:
```typescript
// 全局追踪监听器数量，防止重复
let globalListenerCount = 0
const globalPathRef = ref(window.location.pathname || '/')

export function useRouter() {
  const currentPath = globalPathRef

  const handlePopState = () => {
    currentPath.value = window.location.pathname || '/'
  }

  onMounted(() => {
    if (globalListenerCount === 0) {
      window.addEventListener('popstate', handlePopState)
    }
    globalListenerCount++
  })

  onUnmounted(() => {
    globalListenerCount--
    if (globalListenerCount === 0) {
      window.removeEventListener('popstate', handlePopState)
    }
  })

  return { currentPath, navigate }
}
```

---

## 问题 3: 子应用路由实例未正确重置

**文件**: `vue-qiankun-element/src/main.ts`

**问题代码**:
```typescript
let routerInstance = router  // ← 静态引用

function render(props) {
  routerInstance = createRouterInstance()  // ← 创建新实例但历史未清除
  // ...
  routerInstance.replace(subPath)  // ← 可能在路由未就绪时调用
}
```

**症状**:
- 离开子应用再返回时，路由显示旧的历史记录
- 浏览器前进/后退按钮行为异常
- 子应用路由状态在挂载/卸载周期间泄漏
- 多个子应用实例可能相互干扰

**修复方案**:
```typescript
function render(props) {
  routerInstance = createRouterInstance()
  // ... 其他初始化

  // 在 app 挂载后且路由就绪后再同步
  routerInstance.isReady().then(() => {
    const currentPath = window.location.pathname
    if (currentPath.startsWith('/subapp')) {
      const subPath = currentPath.replace('/subapp', '') || '/'
      routerInstance.push(subPath)
    }
  })
}
```

---

## 问题 4: 异步挂载竞态条件 (CRITICAL)

**文件**: `vue-qiankun-element/src/main.ts`

**问题代码**:
```typescript
renderWithQiankun({
  mount(props) {
    render(props)  // ← 没有 await，不返回 Promise
    // 路由同步立即发生，可能与 app 初始化产生竞态
    routerInstance.replace(subPath)  // ← routerInstance 可能未就绪
  },
})
```

**症状**:
- 挂载后子应用显示空白或错误路由
- 尝试导航时路由 undefined 或未就绪
- 内容应该可见后用户仍看到加载状态
- qiankun 生命周期钩子可能在子应用完全初始化前触发

**修复方案**:
```typescript
renderWithQiankun({
  mount(props) {
    console.log('[vue-qiankun-element] mount with props:', props)
    render(props)

    // 返回 Promise 让 qiankun 等待完全初始化
    return routerInstance.isReady().then(() => {
      const currentPath = window.location.pathname
      if (currentPath.startsWith('/subapp')) {
        const subPath = currentPath.replace('/subapp', '') || '/'
        routerInstance.push(subPath).catch((err) => {
          if (err.name !== 'NavigationDuplicated') {
            console.warn('[vue-qiankun-element] Router navigation failed:', err)
          }
        })
      }
    }).catch(err => {
      console.error('[vue-qiankun-element] Router initialization failed:', err)
    })
  },
  bootstrap() {
    return Promise.resolve()
  },
  unmount() {
    if (app) {
      app.unmount()
      app = null
    }
    return Promise.resolve()
  },
  update(props) {
    return Promise.resolve()
  }
})
```

---

## 问题 5: Token 缓存在子应用卸载时未清理

**文件**: `vue-qiankun-element/src/api/api.ts`

**问题代码**:
```typescript
let tokenCache: TokenCache | null = null  // ← 模块级状态

const fetchDevToken = async (): Promise<string> => {
  if (tokenCache && !isTokenExpired()) {
    return tokenCache.token  // ← 复用之前挂载的过期 token
  }
  // ...
}
```

**症状**:
- 子应用卸载后重新挂载时使用之前会话的 token
- 如果 token 已被服务端失效，API 请求返回 401
- 安全问题：过期 token 在应该失效后仍被使用
- 难以调试，因为 token 看起来有效（expireAt 未过）

**修复方案**:

在 `api.ts` 中添加:
```typescript
export const clearTokenCache = () => {
  tokenCache = null
  console.log('[Auth] Token cache cleared')
}
```

在 `main.ts` 的 unmount 中调用:
```typescript
unmount() {
  clearTokenCache()  // ← 卸载时清理 token

  if (app) {
    app.unmount()
    app = null
  }
  return Promise.resolve()
}
```

---

## 问题 6: 主应用传递的 Props 未被使用

**文件**: `qiankun-main/src/main.ts` 和 `vue-qiankun-element/src/main.ts`

**主应用传递了 Props**:
```typescript
props: {
  msg: 'Hello from main app',
  mainAppRouter: window.location.pathname
}
```

**子应用只是打印了日志**:
```typescript
mount(props) {
  console.log('[vue-qiankun-element] mount with props:', props)  // ← Props 被忽略
  render(props)
```

**症状**:
- 主应用传递的 props 完全被忽略
- 子应用无法访问主应用状态或配置
- 无法从主应用向子应用通信配置变更
- 限制了微前端架构的扩展性

**修复方案**:
```typescript
let qiankunProps: Record<string, any> = {}

export const getQiankunProps = () => qiankunProps

function render(props) {
  qiankunProps = props

  // 通过 provide/inject 让所有组件可访问
  app.provide('qiankunProps', props)
  // ...
}

// 在组件中使用
import { inject } from 'vue'
const qiankunProps = inject('qiankunProps', {})
```

---

## 问题 7: 无响应拦截器处理 401

**文件**: `vue-qiankun-element/src/api/api.ts`

**问题代码**:
```typescript
api.interceptors.request.use(
  async (config) => {
    if (needAuth) {
      try {
        const token = await fetchDevToken()
        config.headers['X-USER'] = token
      } catch (error) {
        console.warn('[Auth] Could not add X-USER header')  // ← 静默失败
      }
    }
    return config
  }
)

// 没有响应拦截器处理 token 过期！
```

**症状**:
- 后端返回的 401 响应不会被捕获
- Token 过期但应用仍尝试使用
- 没有自动刷新 token 机制
- 用户看到通用错误而非有意义的消息
- Token 获取出错时 API 调用静默失败

**修复方案**:
```typescript
// 请求拦截器改进
api.interceptors.request.use(
  async (config) => {
    if (needAuth) {
      try {
        const token = await fetchDevToken()
        config.headers['X-USER'] = token
      } catch (error) {
        console.error('[Auth] Failed to fetch token:', error)
        return Promise.reject(new Error('Authentication failed'))
      }
    }
    return config
  }
)

// 添加响应拦截器
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config

    // 处理 401 Unauthorized
    if (error.response?.status === 401 && needAuth && config) {
      if (!config._retry) {
        config._retry = true
        try {
          const newToken = await refreshToken()
          config.headers['X-USER'] = newToken
          return api(config)  // 重试原请求
        } catch (refreshError) {
          clearTokenCache()
          return Promise.reject(refreshError)
        }
      }
    }

    return Promise.reject(error)
  }
)
```

---

## 问题 8: 待处理 API 请求在组件卸载时未取消

**文件**: `vue-qiankun-element/src/views/Products.vue` 等

**问题代码**:
```typescript
const loadData = async () => {
  loading.value = true
  try {
    products.value = await fetchProducts()  // ← 无法取消
  } catch (error) {
    // ...
  }
}

onMounted(() => {
  loadData()  // ← 卸载时不会中止
})
```

**症状**:
- 内存泄漏：API 响应回调在组件卸载后触发
- 在已卸载组件上更新状态会导致警告
- 用户快速导航时发送多个重复请求
- 后端收到不再需要的重复请求

**修复方案**:

在 `api.ts` 中添加:
```typescript
const abortControllers = new Map<string, AbortController>()

export const createAbortController = (key: string): AbortController => {
  cancelRequest(key)  // 取消已有请求
  const controller = new AbortController()
  abortControllers.set(key, controller)
  return controller
}

export const cancelRequest = (key: string): void => {
  const controller = abortControllers.get(key)
  if (controller) {
    controller.abort()
    abortControllers.delete(key)
  }
}

export const isAbortError = (error: unknown): boolean => {
  return error instanceof AxiosError && error.code === 'ERR_CANCELED'
}

// API 函数支持 signal
export const fetchProducts = async (signal?: AbortSignal): Promise<Product[]> => {
  const response = await api.get<Product[]>('/products', { signal })
  return response.data
}
```

在组件中使用:
```typescript
const LOAD_REQUEST_KEY = 'products-load'

const loadData = async () => {
  loading.value = true
  const controller = createAbortController(LOAD_REQUEST_KEY)

  try {
    products.value = await fetchProducts(controller.signal)
  } catch (error) {
    if (isAbortError(error)) {
      console.log('[Products] Load request was cancelled')
      return
    }
    ElMessage.error('加载数据失败')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadData()
})

onUnmounted(() => {
  cancelRequest(LOAD_REQUEST_KEY)  // 组件卸载时取消请求
})
```

---

## 修复优先级建议

1. **立即修复** (CRITICAL/HIGH):
   - 问题 4: 异步挂载竞态条件
   - 问题 1: 路由同步竞态条件
   - 问题 2: 事件监听器内存泄漏
   - 问题 7: 无 401 响应拦截器

2. **尽快修复** (MEDIUM):
   - 问题 5: Token 缓存未清理
   - 问题 8: 待处理请求未取消
   - 问题 3: 路由状态未重置

3. **可选修复** (LOW):
   - 问题 6: Props 未被使用

---

## 总结

这些问题主要集中在以下几个方面：

1. **生命周期管理** - qiankun 子应用的挂载/卸载需要正确处理异步操作
2. **状态清理** - 模块级状态（token、路由）需要在卸载时清理
3. **事件监听** - 需要防止监听器重复注册和内存泄漏
4. **请求管理** - 需要支持请求取消和错误重试

修复这些问题后，微前端架构将更加稳定和健壮。
