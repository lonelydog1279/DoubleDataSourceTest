# Qiankun Main App

乾坤微前端主应用，用于加载和管理子应用。

## 项目结构

```
qiankun-main/
├── src/
│   ├── composables/
│   │   └── useRouter.ts       # 简单路由管理
│   ├── App.vue                # 主布局 (侧边栏 + 内容区)
│   ├── main.ts                # 入口 (注册子应用)
│   └── style.css              # 全局样式
├── vite.config.ts
└── package.json
```

## 运行方式

### 1. 启动子应用 (端口 5173)

```bash
cd vue-qiankun-element
npm run dev
```

### 2. 启动主应用 (端口 8000)

```bash
cd qiankun-main
npm run dev
```

### 3. 访问

- 主应用: http://localhost:8000
- 点击侧边栏 "Sub App" 加载子应用

## 子应用注册配置

```typescript
// src/main.ts
registerMicroApps([
  {
    name: 'vue-qiankun-element',      // 子应用名称 (需与子应用配置一致)
    entry: '//localhost:5173',         // 子应用入口
    container: '#subapp-container',    // 挂载容器
    activeRule: '/subapp',             // 激活路由
    props: {                           // 传递给子应用的数据
      msg: 'Hello from main app'
    }
  }
])
```

## 添加更多子应用

```typescript
registerMicroApps([
  {
    name: 'vue-qiankun-element',
    entry: '//localhost:5173',
    container: '#subapp-container',
    activeRule: '/subapp'
  },
  {
    name: 'another-app',
    entry: '//localhost:5174',
    container: '#subapp-container',
    activeRule: '/another'
  }
])
```

## 生命周期钩子

主应用可以监听子应用的生命周期：

```typescript
registerMicroApps(apps, {
  beforeLoad: [(app) => { console.log('before load', app.name) }],
  beforeMount: [(app) => { console.log('before mount', app.name) }],
  afterMount: [(app) => { console.log('after mount', app.name) }],
  afterUnmount: [(app) => { console.log('after unmount', app.name) }]
})
```

## 样式隔离

```typescript
start({
  sandbox: {
    experimentalStyleIsolation: true  // 实验性样式隔离
  }
})
```

## 端口说明

| 应用 | 端口 | 说明 |
|------|------|------|
| 主应用 | 8000 | Qiankun 主应用 |
| 子应用 | 5173 | Vue Element 子应用 |
| 后端 | 8080 | Spring Boot 后端 |
