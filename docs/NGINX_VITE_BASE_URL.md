# Nginx Location 与 Vite Base URL 必须一致的原因

## 核心原因

**Vite 打包时会把 base 写死到生成的文件里**，浏览器会按照这个路径去请求资源，所以 nginx 必须能响应这个路径。

## 举个例子

假设 vite.config.ts 配置：

```typescript
base: '/dual-datasource-test/'
```

打包后生成的 `index.html`：

```html
<!-- 子应用 index.html -->
<script src="/dual-datasource-test/assets/js/index-abc123.js"></script>
<link href="/dual-datasource-test/assets/css/style-def456.css">
```

所有资源路径都会带上 `/dual-datasource-test/` 前缀。

## 浏览器加载流程

```
1. qiankun 加载子应用入口
   GET /dual-datasource-test/index.html  ← nginx 需要能响应这个路径

2. 浏览器解析 index.html，发现需要加载 JS
   GET /dual-datasource-test/assets/js/index-abc123.js  ← 路径是写死的

3. nginx 必须有匹配的 location
   location /dual-datasource-test/ {
     alias /usr/share/nginx/html/subapp/;
   }
```

## 如果不一致会怎样？

```
vite base:        /dual-datasource-test/
nginx location:   /subapp-entry/

浏览器请求: GET /dual-datasource-test/assets/js/xxx.js
nginx 响应: 没有匹配的 location → 404 Not Found
```

资源全部加载失败，页面空白。

## 配置对照表

| 配置项 | 位置 | 作用 |
|-------|------|------|
| vite `base` | vite.config.ts | 决定打包后资源路径的**前缀** |
| nginx `location` | nginx.conf | 决定哪些**请求路径**由这个规则处理 |
| qiankun `entry` | 主应用 main.ts | 告诉 qiankun 从哪里加载子应用入口 |

**三者必须一致！**

## 正确配置示例

### vite.config.ts

```typescript
export default defineConfig(({ mode }) => {
  const isUseDevMode = mode === 'development'
  return {
    // 开发环境用 /，生产环境用 /dual-datasource-test/
    base: isUseDevMode ? '/' : '/dual-datasource-test/',
    // ...
  }
})
```

### nginx.conf

```nginx
# 子应用静态资源
location /dual-datasource-test/ {
    alias /usr/share/nginx/html/subapp/;
    try_files $uri $uri/ /usr/share/nginx/html/subapp/index.html;

    # CORS 头 - qiankun 必须
    add_header Access-Control-Allow-Origin *;
}
```

### 主应用 main.ts

```typescript
const subAppEntry = isProduction
  ? '/dual-datasource-test/'  // 生产环境
  : '//localhost:5173'        // 开发环境

registerMicroApps([
  {
    name: 'vue-qiankun-element',
    entry: subAppEntry,
    // ...
  }
])
```

## 常见错误排查

### 1. 子应用资源 404

检查 vite base 和 nginx location 是否一致。

### 2. 子应用加载但样式/JS 丢失

检查 nginx 的 `alias` 路径是否正确指向子应用的 dist 目录。

### 3. 开发环境正常，生产环境 404

检查 vite base 是否根据环境变量正确切换：
- 开发环境：`/`
- 生产环境：`/dual-datasource-test/`

## 为什么 qiankun entry 也要一致？

因为 **qiankun 需要先拿到子应用的 index.html**，然后才能解析里面的 JS/CSS。

```
┌─────────────────────────────────────────────────────────────┐
│  1. 主应用启动 qiankun                                       │
│     entry: '/dual-datasource-test/'                         │
│                      │                                       │
│                      ▼                                       │
│  2. qiankun 发起请求                                         │
│     GET /dual-datasource-test/           ← 请求子应用入口    │
│     (实际请求 /dual-datasource-test/index.html)             │
│                      │                                       │
│                      ▼                                       │
│  3. nginx 响应 index.html                                   │
│     location /dual-datasource-test/ {                       │
│       alias /usr/share/nginx/html/subapp/;                  │
│     }                                                        │
│                      │                                       │
│                      ▼                                       │
│  4. qiankun 解析 index.html，发现需要加载                    │
│     <script src="/dual-datasource-test/assets/js/xxx.js">   │
│                      │                                       │
│                      ▼                                       │
│  5. 浏览器请求 JS 文件                                       │
│     GET /dual-datasource-test/assets/js/xxx.js              │
└─────────────────────────────────────────────────────────────┘
```

三者形成一条链：

```
entry 决定请求路径 → nginx 匹配并返回文件 → 文件里的资源路径由 base 决定
```

任何一个不一致，链条就断了。

## 开发环境为什么不需要考虑路径一致？

开发环境直接指向 vite dev server 的 URL，不经过 nginx：

### 开发环境

```
qiankun entry: '//localhost:5173'
                      │
                      ▼
           直接访问 vite dev server
                      │
                      ▼
        vite 自动处理所有请求，不需要 nginx
```

vite dev server 会自动响应 `/`、`/assets/xxx.js` 等所有请求，不存在路径匹配问题。

### 生产环境

```
qiankun entry: '/dual-datasource-test/'
                      │
                      ▼
              经过 nginx 代理
                      │
                      ▼
      需要 location、base、entry 三者一致
```

### 对比总结

| 环境 | entry | 需要路径一致？ | 原因 |
|-----|-------|--------------|------|
| 开发 | `//localhost:5173` | 不需要 | vite dev server 全包了 |
| 生产 | `/dual-datasource-test/` | 需要 | 经过 nginx，路径必须匹配 |

## 总结

```
vite base = nginx location = qiankun entry
         ↓
    三者路径一致
         ↓
    资源正常加载
```
