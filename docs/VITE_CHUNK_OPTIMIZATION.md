# Vite Vue 项目 Chunk 打包优化指南

## 概述

在 Vite 打包 Vue 项目时，如果不进行优化配置，可能会遇到以下问题：

- 单个 chunk 文件过大（超过 500KB 警告）
- 首屏加载时间过长
- 第三方库没有合理分割

本文档介绍如何优化 Vite 的打包配置，减小 chunk 体积，提升加载性能。

## 问题诊断

### 1. 查看打包警告

运行 `npm run build` 时，Vite 会提示超过 500KB 的 chunk：

```
(!) Some chunks are larger than 500 kB after minification. Consider:
- Using dynamic import() to code-split the application
- Use build.rollupOptions.output.manualChunks to improve chunking
```

### 2. 使用可视化分析工具

安装 `rollup-plugin-visualizer` 分析打包结果：

```bash
npm install -D rollup-plugin-visualizer
```

在 `vite.config.ts` 中配置：

```typescript
import { visualizer } from 'rollup-plugin-visualizer'

export default defineConfig({
  plugins: [
    vue(),
    visualizer({
      open: true,  // 打包后自动打开分析页面
      filename: 'stats.html',
      gzipSize: true,
      brotliSize: true
    })
  ]
})
```

运行 `npm run build` 后会生成 `stats.html`，可以直观看到每个模块的体积占比。

## 优化方案

### 方案一：路由懒加载（推荐）

将路由组件改为动态导入，实现按需加载：

```typescript
// router/index.ts

// 优化前 - 所有组件打包到一起
import Home from '@/views/Home.vue'
import Products from '@/views/Products.vue'
import Users from '@/views/Users.vue'

// 优化后 - 每个路由组件单独打包成一个 chunk
const routes = [
  {
    path: '/',
    component: () => import('@/views/Home.vue')
  },
  {
    path: '/products',
    component: () => import('@/views/Products.vue')
  },
  {
    path: '/users',
    component: () => import('@/views/Users.vue')
  }
]
```

### 方案二：手动分割第三方库（manualChunks）

在 `vite.config.ts` 中配置 `manualChunks`，将大型第三方库单独打包：

```typescript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // 将 Vue 相关库打包到 vue-vendor chunk
          'vue-vendor': ['vue', 'vue-router', 'pinia'],
          // 将 Element Plus 单独打包
          'element-plus': ['element-plus'],
          // 将其他大型库单独打包
          'lodash': ['lodash-es'],
          'echarts': ['echarts']
        }
      }
    }
  }
})
```

### 方案三：按依赖类型自动分割

使用函数形式的 `manualChunks` 实现更灵活的分割策略：

```typescript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          // 将 node_modules 中的依赖按包名分割
          if (id.includes('node_modules')) {
            // 提取包名
            const packageName = id
              .toString()
              .split('node_modules/')[1]
              .split('/')[0]
              .toString()

            // 大型库单独打包
            const bigLibs = ['element-plus', 'echarts', 'lodash-es', '@vueuse']
            if (bigLibs.some(lib => packageName.includes(lib))) {
              return `vendor-${packageName.replace('@', '')}`
            }

            // 其他依赖统一打包到 vendor
            return 'vendor'
          }
        }
      }
    }
  }
})
```

### 方案四：Element Plus 按需导入

Element Plus 是常见的大型依赖，建议使用按需导入：

```bash
npm install -D unplugin-vue-components unplugin-auto-import
```

```typescript
// vite.config.ts
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'

export default defineConfig({
  plugins: [
    vue(),
    AutoImport({
      resolvers: [ElementPlusResolver()]
    }),
    Components({
      resolvers: [ElementPlusResolver()]
    })
  ]
})
```

使用前后对比：
- 全量导入：~800KB
- 按需导入：~200KB（根据实际使用的组件）

### 方案五：配置 chunk 大小警告阈值

如果某些 chunk 确实需要较大体积，可以调整警告阈值：

```typescript
// vite.config.ts
export default defineConfig({
  build: {
    chunkSizeWarningLimit: 1000  // 单位 KB，默认 500
  }
})
```

**注意：** 这只是隐藏警告，不是真正的优化。

### 方案六：启用 Gzip/Brotli 压缩

使用压缩插件减小传输体积：

```bash
npm install -D vite-plugin-compression
```

```typescript
// vite.config.ts
import viteCompression from 'vite-plugin-compression'

export default defineConfig({
  plugins: [
    vue(),
    viteCompression({
      algorithm: 'gzip',
      ext: '.gz'
    }),
    viteCompression({
      algorithm: 'brotliCompress',
      ext: '.br'
    })
  ]
})
```

同时需要在 Nginx 中启用压缩支持：

```nginx
# nginx.conf
gzip on;
gzip_types text/plain application/javascript application/x-javascript text/css text/javascript;
gzip_static on;  # 优先使用预压缩的 .gz 文件

# Brotli 支持（需要 ngx_brotli 模块）
brotli on;
brotli_types text/plain application/javascript application/x-javascript text/css text/javascript;
brotli_static on;
```

## 完整配置示例

结合以上优化方案的完整 `vite.config.ts` 配置：

```typescript
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import { visualizer } from 'rollup-plugin-visualizer'
import viteCompression from 'vite-plugin-compression'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'

export default defineConfig(({ mode }) => ({
  plugins: [
    vue(),
    // Element Plus 按需导入
    AutoImport({
      resolvers: [ElementPlusResolver()]
    }),
    Components({
      resolvers: [ElementPlusResolver()]
    }),
    // Gzip 压缩
    viteCompression({
      algorithm: 'gzip',
      ext: '.gz'
    }),
    // 打包分析（仅在需要时启用）
    mode === 'analyze' && visualizer({
      open: true,
      filename: 'stats.html',
      gzipSize: true
    })
  ].filter(Boolean),

  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  },

  build: {
    // 调整警告阈值
    chunkSizeWarningLimit: 800,

    rollupOptions: {
      output: {
        // 手动分割 chunk
        manualChunks: {
          'vue-vendor': ['vue', 'vue-router', 'pinia'],
          'element-plus': ['element-plus'],
          'icons': ['@element-plus/icons-vue']
        },
        // 自定义 chunk 文件名
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]'
      }
    }
  }
}))
```

## 优化效果对比

| 优化措施 | 优化前 | 优化后 | 减少 |
|---------|--------|--------|------|
| 路由懒加载 | 单文件 800KB | 多文件各 50-100KB | 首屏 -70% |
| Element Plus 按需 | 800KB | 200KB | -75% |
| manualChunks 分割 | vendor 1.2MB | 多个 100-300KB | 并行加载 |
| Gzip 压缩 | 500KB | 150KB | -70% |

## 常见问题

### Q1: manualChunks 导致循环依赖警告？

使用函数形式的 `manualChunks` 时可能出现循环依赖，解决方案：

```typescript
manualChunks(id, { getModuleInfo }) {
  // 使用 getModuleInfo 检查依赖关系
  const moduleInfo = getModuleInfo(id)
  // 根据实际依赖关系调整分割策略
}
```

### Q2: 某些第三方库不支持 Tree Shaking？

检查是否使用了 ES Module 版本：
- `lodash` → `lodash-es`
- `moment` → `dayjs`（更轻量的替代方案）

### Q3: 动态导入的组件加载慢？

使用预加载提示：

```typescript
// 在路由守卫中预加载下一个可能的页面
router.beforeEach((to, from) => {
  if (to.path === '/products') {
    import('@/views/Products.vue')
  }
})
```

或使用 `<link rel="prefetch">`：

```html
<link rel="prefetch" href="/assets/js/Products-xxx.js">
```

## 相关文件

| 文件 | 作用 |
|-----|-----|
| `vite.config.ts` | Vite 打包配置 |
| `src/router/index.ts` | 路由配置（懒加载） |
| `nginx.conf` | Nginx 压缩配置 |
| `stats.html` | 打包分析报告（运行 analyze 后生成） |

## 参考资料

- [Vite 官方文档 - 构建生产版本](https://cn.vitejs.dev/guide/build.html)
- [Rollup 官方文档 - manualChunks](https://rollupjs.org/configuration-options/#output-manualchunks)
- [Element Plus 按需导入](https://element-plus.org/zh-CN/guide/quickstart.html#%E6%8C%89%E9%9C%80%E5%AF%BC%E5%85%A5)
