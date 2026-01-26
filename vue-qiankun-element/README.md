# Vue + Element Plus + Qiankun 前端指南

## 概述

本项目是一个基于 Vue 3 + TypeScript + Element Plus 的单页面应用，支持：
- **独立运行** - 直接访问 http://localhost:5173
- **乾坤微前端** - 作为子应用被主应用加载

## 项目结构

```
vue-qiankun-element/
├── src/
│   ├── api/
│   │   └── api.ts              # API 接口封装
│   ├── types/
│   │   └── defines.ts          # TypeScript 类型定义
│   ├── App.vue                 # 主应用组件
│   ├── main.ts                 # 入口文件 (含乾坤生命周期)
│   └── style.css               # 全局样式
├── vite.config.ts              # Vite 配置 (含乾坤插件)
├── package.json
└── index.html
```

## 技术栈

| 技术 | 版本 | 说明 |
|------|------|------|
| Vue | 3.5.x | 前端框架 |
| TypeScript | 5.9.x | 类型支持 |
| Element Plus | 2.13.x | UI 组件库 |
| Vite | 7.x | 构建工具 |
| Axios | - | HTTP 请求 |
| vite-plugin-qiankun | - | 乾坤微前端支持 |

## 功能说明

### 选项卡页面

1. **Products (PostgreSQL)** - 展示产品列表（来自 PostgreSQL 数据源）
2. **Users (Oracle)** - 展示用户列表（来自 Oracle 数据源）
3. **Config** - 展示当前应用配置

### 表单提交

点击 "Add Product" 按钮，弹出表单对话框，填写后提交到后端接口。

## 乾坤微前端接入

### 核心配置

**1. vite.config.ts**

```typescript
import qiankun from 'vite-plugin-qiankun'

export default defineConfig({
  plugins: [
    vue(),
    qiankun('vue-qiankun-element', {  // 子应用名称
      useDevMode: true
    })
  ],
  server: {
    port: 5173,
    cors: true,
    headers: {
      'Access-Control-Allow-Origin': '*'  // 允许跨域
    }
  }
})
```

**2. main.ts 生命周期**

```typescript
import { renderWithQiankun, qiankunWindow } from 'vite-plugin-qiankun/dist/helper'

let app: VueApp<Element> | null = null

function render(props: { container?: Element } = {}) {
  const { container } = props
  app = createApp(App)
  app.use(ElementPlus)

  // 在乾坤环境下挂载到 container 内的 #app
  const mountElement = container
    ? container.querySelector('#app')
    : document.getElementById('app')

  app.mount(mountElement)
}

// 乾坤生命周期
renderWithQiankun({
  mount(props) { render(props) },
  bootstrap() { console.log('bootstrap') },
  unmount() { app?.unmount(); app = null },
  update(props) { console.log('update', props) }
})

// 独立运行模式
if (!qiankunWindow.__POWERED_BY_QIANKUN__) {
  render()
}
```

### 主应用注册示例

```typescript
import { registerMicroApps, start } from 'qiankun'

registerMicroApps([
  {
    name: 'vue-qiankun-element',
    entry: '//localhost:5173',
    container: '#subapp-container',
    activeRule: '/vue-app'
  }
])

start()
```

## API 接口

### 后端接口

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /test | 获取 Oracle 用户列表 |
| POST | /test1 | 添加产品 |

### 环境变量配置

前端使用环境变量区分不同环境的后端地址：

```
vue-qiankun-element/
├── .env                 # 默认环境变量
├── .env.development     # 开发环境 (npm run dev)
├── .env.production      # 生产环境 (npm run build)
└── .env.staging         # 测试环境
```

**.env.development**
```bash
VITE_BACKEND_BASE_URL=http://localhost:8080
```

**.env.production**
```bash
VITE_BACKEND_BASE_URL=https://api.example.com
```

**在代码中使用：**
```typescript
const baseUrl = import.meta.env.VITE_BACKEND_BASE_URL

const api = axios.create({
  baseURL: baseUrl,
  timeout: 10000
})
```

### 跨域 (CORS) 配置

由于前端直接请求后端 URL（不走 Vite 代理），需要后端配置 CORS。

**后端 CorsConfig.java：**
```java
@Configuration
public class CorsConfig {
    @Bean
    public CorsFilter corsFilter() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowCredentials(true);
        config.addAllowedOriginPattern("*");  // 生产环境请指定具体域名
        config.addAllowedHeader("*");
        config.addAllowedMethod("*");
        config.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return new CorsFilter(source);
    }
}
```

## 运行方式

### 独立运行

```bash
cd vue-qiankun-element
npm install
npm run dev
```

访问 http://localhost:5173

### 作为乾坤子应用

1. 启动本应用: npm run dev
2. 主应用配置子应用入口为 //localhost:5173
3. 访问主应用对应路由

### 构建生产版本

```bash
npm run build
```

## TypeScript 类型

```typescript
export interface Product {
  id?: number
  productName: string
  category: string
  price: number
  stock: number
}

export interface OracleUser {
  id: number
  userName: string
  age: number
}

export interface AppConfig {
  id: number
  name: string
  desc: string
  version: string
  environment: string
}
```

## 常见问题

### Q1: 子应用样式丢失?
确保 Element Plus 样式正确引入: `import 'element-plus/dist/index.css'`

### Q2: 跨域问题?
后端需要配置 CORS，参考上方 "跨域 (CORS) 配置" 部分。
或者使用 Vite 代理（仅开发环境有效）。

### Q3: 路径别名 @ 不生效?
确保 vite.config.ts 配置了 resolve.alias

### Q4: 环境变量不生效?
- 变量必须以 `VITE_` 开头
- 修改 .env 文件后需要重启 dev server
- 使用 `import.meta.env.VITE_XXX` 访问
