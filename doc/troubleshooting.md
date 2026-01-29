# Qiankun 微前端常见问题排查

## 问题 1: MIME 类型错误

### 错误信息
```
Failed to load module script: Expected a JavaScript-or-Wasm module script
but the server responded with a MIME type of "text/html".
Strict MIME type checking is enforced for module scripts per HTML spec.
```

### 原因分析
浏览器请求 JS 模块文件时，服务器返回了 HTML 内容（通常是 404 页面或 index.html 回退）。

### 常见原因

1. **子应用未构建或 dist 目录为空**
   ```bash
   # 检查构建产物
   ls -la vue-qiankun-element/dist/
   ls -la vue-qiankun-element/dist/assets/js/
   ```

2. **Nginx 配置错误**
   - `try_files` 回退到 index.html 导致 JS 请求返回 HTML
   - `alias` 路径配置错误

3. **系统代理拦截 localhost 请求**（本项目遇到的问题）
   - ClashX、Surge、V2Ray 等代理软件可能拦截 localhost 流量
   - 代理无法正确处理请求，返回 502 Bad Gateway

### 排查步骤

```bash
# 1. 检查 dist 目录是否存在
ls -la vue-qiankun-element/dist/

# 2. 检查容器内文件是否正确挂载
docker exec <container_name> ls -la /usr/share/nginx/html/subapp/assets/js/

# 3. 从容器内部测试（绕过系统代理）
docker exec <container_name> curl -s -I http://127.0.0.1/dual-datasource-test/assets/js/index-xxx.js

# 4. 检查系统代理
curl -s -I http://localhost/dual-datasource-test/assets/js/index-xxx.js
# 如果返回 502 Bad Gateway，说明有代理拦截
```

### 解决方案

**如果是代理问题：**
1. 在代理软件中设置 `localhost` 和 `127.0.0.1` 为直连（DIRECT）
2. 或临时关闭代理
3. 或使用 `http://127.0.0.1` 代替 `http://localhost` 访问

**如果是 Nginx 配置问题：**
确保 nginx.conf 正确配置：
```nginx
location /dual-datasource-test/ {
    alias /usr/share/nginx/html/subapp/;
    try_files $uri $uri/ /usr/share/nginx/html/subapp/index.html;

    # CORS 头 - qiankun 必须
    add_header Access-Control-Allow-Origin *;
}
```

---

## 问题 2: 异步消息通道关闭错误

### 错误信息
```
Uncaught (in promise) Error: A listener indicated an asynchronous response
by returning true, but the message channel closed before a response was received
```

### 原因分析
这个错误来自 **Chrome 扩展的消息 API** (`chrome.runtime.onMessage`)，不是 qiankun 本身的问题。

### 常见触发扩展
- Vue DevTools
- React DevTools
- Redux DevTools
- 广告拦截器 (uBlock, AdBlock)
- Grammarly
- 密码管理器

### 为什么在 qiankun 中更常见
微前端导航时 DOM 容器被替换，浏览器扩展注入的内容脚本上下文被销毁，导致消息通道在异步响应发送前关闭。

### 解决方案
1. **验证是否为扩展问题**：在无痕模式（禁用所有扩展）下测试
2. **忽略**：此错误通常不影响应用功能，只是控制台噪音
3. **逐个禁用扩展**找出具体是哪个扩展导致的

---

## 问题 3: 子应用路由不同步

### 症状
- 导航后子应用显示空白或错误路由
- 浏览器前进/后退按钮行为异常

### 原因
- 主应用和子应用路由同步存在竞态条件
- 子应用 mount 生命周期未正确等待路由初始化

### 解决方案
确保子应用 mount 返回 Promise 等待路由就绪：
```typescript
renderWithQiankun({
  mount(props) {
    render(props)
    return routerInstance.isReady().then(() => {
      // 路由同步逻辑
    })
  }
})
```

---

## 开发环境 vs 生产环境

| 环境 | 主应用地址 | 子应用入口 |
|------|-----------|-----------|
| 开发 | http://localhost:8000 | //localhost:5173 |
| 生产 | http://localhost (Nginx) | /dual-datasource-test/ (Nginx 代理) |

### 开发环境启动
```bash
# 终端 1 - 子应用
cd vue-qiankun-element && npm run dev

# 终端 2 - 主应用
cd qiankun-main && npm run dev
```

### 生产环境启动
```bash
# 1. 构建两个应用
cd vue-qiankun-element && npm run build
cd qiankun-main && npm run build

# 2. 启动 Docker
docker-compose up -d
```

---

## 项目结构

```
DoubleDatasourceTest/
├── qiankun-main/           # 主应用 (端口 8000)
│   ├── src/
│   │   └── main.ts         # qiankun 注册配置
│   └── dist/               # 构建产物 → /usr/share/nginx/html/main
├── vue-qiankun-element/    # 子应用 (端口 5173)
│   ├── src/
│   │   └── main.ts         # qiankun 生命周期
│   └── dist/               # 构建产物 → /usr/share/nginx/html/subapp
├── nginx.conf              # Nginx 配置
└── docker-compose.yml      # Docker 编排
```
