# Vue Qiankun 子应用路由管理指南

本文档说明了 `vue-qiankun-element` 子应用在两种不同运行模式下的路由管理方式。

## 目录结构

```
vue-qiankun-element/
├── src/
│   ├── main.ts           # 应用入口，支持 qiankun 和独立模式
│   ├── App.vue           # 根组件，包含导航栏和 router-view
│   ├── router/
│   │   └── index.ts      # 路由配置（支持双模式）
│   ├── views/
│   │   ├── Home.vue      # 首页
│   │   ├── Products.vue  # 产品管理页面
│   │   ├── Users.vue     # 用户管理页面
│   │   └── Config.vue    # 系统配置页面
│   └── components/       # 共享组件
```

## 两种运行模式

### 1. 独立模式 (Standalone Mode)

子应用作为独立的 Web 应用运行，不依赖主应用。

#### 访问方式

```bash
# 启动子应用
cd vue-qiankun-element
npm run dev
```

访问地址：`http://localhost:5173`

#### 路由配置

```typescript
// router/index.ts
const history = createWebHistory('/')  // 使用浏览器 History 模式
```

#### 可用路由

| 路由路径 | 页面 | 说明 |
|---------|------|------|
| `/` | Home | 应用首页 |
| `/products` | Products | 产品管理（PostgreSQL） |
| `/users` | Users | 用户管理（Oracle） |
| `/config` | Config | 系统配置 |

#### URL 示例

```
http://localhost:5173/                    # 首页
http://localhost:5173/products            # 产品页面
http://localhost:5173/users               # 用户页面
http://localhost:5173/config              # 配置页面
```

#### 特点

- 直接访问，无需主应用
- 使用浏览器原生 History API
- 独立的导航栏
- 右上角显示 "独立模式" 标签

---

### 2. 微前端模式 (Qiankun Mode)

子应用作为微前端模块，在主应用中运行。

#### 访问方式

```bash
# 1. 启动子应用
cd vue-qiankun-element
npm run dev

# 2. 启动主应用
cd qiankun-main
npm run dev
```

访问地址：`http://localhost:8000`

#### 路由配置

```typescript
// router/index.ts
const isQiankun = qiankunWindow.__POWERED_BY_QIANKUN__
const history = createMemoryHistory('/subapp')  // 使用内存路由模式
```

#### 主应用路由配置

```typescript
// qiankun-main/src/main.ts
activeRule: (location) => {
  return location.pathname.startsWith('/subapp')
}
```

#### 可用路由

| 主应用路由 | 子应用路由 | 页面 | 说明 |
|-----------|-----------|------|------|
| `/subapp` | `/` | Home | 子应用首页 |
| `/subapp/products` | `/products` | Products | 产品管理 |
| `/subapp/users` | `/users` | Users | 用户管理 |
| `/subapp/config` | `/config` | Config | 系统配置 |

#### URL 示例

```
http://localhost:8000/                    # 主应用首页
http://localhost:8000/subapp              # 子应用首页
http://localhost:8000/subapp/products     # 产品页面
http://localhost:8000/subapp/users        # 用户页面
http://localhost:8000/subapp/config       # 配置页面
```

#### 特点

- 需要通过主应用访问
- 使用内存路由 (Memory History)，避免与主应用路由冲突
- 主应用侧边栏提供导航入口
- 右上角显示 "微前端模式" 标签
- 所有子应用路由都以 `/subapp` 为前缀

---

## 核心实现差异

### 1. 路由模式选择

```typescript
// router/index.ts
export function createRouterInstance() {
  const isQiankun = qiankunWindow.__POWERED_BY_QIANKUN__

  // 根据运行环境选择不同的路由模式
  const history = isQiankun
    ? createMemoryHistory('/subapp')  // 微前端：内存路由
    : createWebHistory('/')           // 独立：Web 路由

  return createRouter({ history, routes })
}
```

### 2. 应用入口处理

```typescript
// main.ts
function render(props: { container?: Element } = {}) {
  const { container } = props

  // 每次渲染创建新的路由实例
  routerInstance = createRouterInstance()

  app = createApp(App)
  app.use(routerInstance)

  // qiankun 模式下挂载到容器内的 #app
  const mountElement = container
    ? container.querySelector('#app')
    : document.getElementById('app')

  app.mount(mountElement)
}
```

### 3. 运行模式检测

```typescript
// App.vue
import { qiankunWindow } from 'vite-plugin-qiankun/dist/helper'

const isQiankun = computed(() => qiankunWindow.__POWERED_BY_QIANKUN__)
```

---

## 主应用侧边栏导航

主应用 (`qiankun-main`) 侧边栏提供以下导航选项：

| 菜单项 | 路由 | 说明 |
|-------|------|------|
| Home | `/` | 主应用首页 |
| Sub App Home | `/subapp` | 子应用首页 |
| Sub App - Products | `/subapp/products` | 产品管理 |
| Sub App - Users | `/subapp/users` | 用户管理 |
| Sub App - Config | `/subapp/config` | 系统配置 |

---

## 开发建议

### 添加新页面

1. 在 `src/views/` 创建新页面组件
2. 在 `src/router/index.ts` 添加路由配置
3. 在 `src/App.vue` 添加导航按钮
4. 在主应用 `qiankun-main/src/App.vue` 添加侧边栏菜单项

### 路由跳转

```typescript
import { useRouter } from 'vue-router'

const router = useRouter()

// 编程式导航
router.push('/products')  // 两种模式下都能正常工作
router.push({ name: 'Products' })
```

### 获取当前路由

```typescript
import { useRoute } from 'vue-router'

const route = useRoute()

// 两种模式下路径一致
console.log(route.path)  // '/products'
```

---

## 故障排除

### 问题：子应用路由在主应用中无法跳转

**解决方案**：确保使用 `createMemoryHistory` 和正确的 base 路径

### 问题：独立运行时路由 404

**解决方案**：确保服务器配置支持 History 模式，或使用 hash 模式

### 问题：样式冲突

**解决方案**：主应用已启用 `experimentalStyleIsolation`，确保子应用样式使用 scoped

---

## 技术栈

- **主应用**：Vue 3 + Qiankun 2.x + Element Plus
- **子应用**：Vue 3 + Vue Router 4 + Vite + Element Plus
- **构建工具**：Vite + vite-plugin-qiankun
