# Vue-Qiankun-Element 前端模板化开发指南

## 1. 目录结构规范

```
src/
├── api/                    # API 层 - 核心 api 文件夹
│   ├── types/              # 类型声明文件
│   │   ├── common.d.ts     # 公共通用类型（PageResult、ResponseData）
│   │   ├── user.d.ts       # 用户相关类型（OracleUser、UserQueryParams）
│   │   ├── product.d.ts    # 产品相关类型（Product、ProductQueryParams）
│   │   ├── config.d.ts     # 配置相关类型（AppConfig）
│   │   └── index.ts        # 类型统一导出入口
│   ├── modules/            # 业务模块 API 函数
│   │   ├── user.ts         # 用户相关接口（fetchOracleUsers）
│   │   ├── product.ts      # 产品相关接口（fetchProducts、addProduct）
│   │   ├── config.ts       # 配置相关接口（fetchAppConfig）
│   │   └── index.ts        # 模块统一导出
│   ├── utils/              # API 辅助工具
│   │   ├── request.ts      # Axios 请求封装、拦截器配置
│   │   ├── transform.ts    # 数据转换工具函数
│   │   └── index.ts        # 工具统一导出
│   └── index.ts            # API 总入口文件（外部仅需引入此文件）
├── components/             # 可复用 UI 组件
│   └── ProductFormDialog.vue
├── views/                  # 页面级组件（路由页面）
│   ├── Home.vue
│   ├── Products.vue
│   ├── ProductsTab.vue
│   ├── Users.vue
│   ├── UsersTab.vue
│   ├── Config.vue
│   └── ConfigTab.vue
├── router/                 # Vue Router 配置
│   └── index.ts
├── types/                  # 兼容层（已废弃，请使用 @/api/types）
│   └── defines.ts
├── App.vue                 # 根组件（导航布局）
└── main.ts                 # 应用入口（qiankun 生命周期）
```

### 命名规范

| 类型 | 规范 | 示例 |
|------|------|------|
| 组件文件 | PascalCase | `ProductFormDialog.vue` |
| 页面文件 | PascalCase | `Products.vue` |
| API 函数 | camelCase 动词开头 | `fetchProducts`, `addProduct` |
| 类型接口 | PascalCase | `Product`, `OracleUser` |
| 类型文件 | 小写 kebab-case 或 camelCase | `product.d.ts`, `common.d.ts` |

---

## 2. 类型定义规范

### 2.1 公共类型

**文件**: `api/types/common.d.ts`

```typescript
/** 通用分页请求参数 */
export interface PageParams {
  page: number
  pageSize: number
}

/** 通用分页响应结构 */
export interface PageResult<T> {
  list: T[]
  total: number
  page: number
  pageSize: number
}

/** 通用响应数据结构 */
export interface ResponseData<T = unknown> {
  code: number
  message: string
  data: T
}
```

### 2.2 业务类型

**文件**: `api/types/product.d.ts`

```typescript
/** 产品信息 */
export interface Product {
  id?: number           // 可选：数据库自动生成
  productName: string
  category: string
  price: number
  stock: number
  createTime?: string   // 可选：数据库自动生成
}

/** 产品查询参数 */
export interface ProductQueryParams {
  keyword?: string
  category?: string
  page?: number
  pageSize?: number
}
```

### 2.3 类型统一导出

**文件**: `api/types/index.ts`

```typescript
// 公共类型
export type { PageParams, PageResult, ResponseData, TokenCache } from './common'

// 用户相关类型
export type { OracleUser, UserQueryParams } from './user'

// 产品相关类型
export type { Product, ProductQueryParams } from './product'

// 配置相关类型
export type { AppConfig } from './config'
```

**使用方式**:

```typescript
// 推荐：从统一入口导入
import type { Product, OracleUser } from '@/api/types'

// 或从 API 入口直接导入
import type { Product } from '@/api'
```

---

## 3. API 层规范

### 3.1 请求封装

**文件**: `api/utils/request.ts`

```typescript
import axios, { type AxiosInstance, type InternalAxiosRequestConfig } from 'axios'
import { qiankunWindow } from 'vite-plugin-qiankun/dist/helper'

const baseUrl = import.meta.env.VITE_BACKEND_BASE_URL
const authApiUrl = import.meta.env.VITE_AUTH_API_URL
const authEnabled = import.meta.env.VITE_AUTH_ENABLED === 'true'

// 判断是否需要独立认证
const isStandalone = !qiankunWindow.__POWERED_BY_QIANKUN__
const needAuth = authEnabled && isStandalone

// 创建 axios 实例
const createRequest = (): AxiosInstance => {
  const instance = axios.create({
    baseURL: baseUrl,
    timeout: 10000
  })

  // 请求拦截器
  instance.interceptors.request.use(
    async (config: InternalAxiosRequestConfig) => {
      if (needAuth) {
        // 添加认证逻辑
        config.headers['X-USER'] = await getToken()
      }
      return config
    },
    (error) => Promise.reject(error)
  )

  // 响应拦截器
  instance.interceptors.response.use(
    (response) => response,
    (error) => Promise.reject(error)
  )

  return instance
}

export const request = createRequest()
```

### 3.2 业务模块 API

**文件**: `api/modules/product.ts`

```typescript
import { request } from '../utils/request'
import type { Product } from '../types'

/** 获取所有产品 */
export const fetchProducts = async (): Promise<Product[]> => {
  const response = await request.get<Product[]>('/products')
  return response.data
}

/** 添加新产品 */
export const addProduct = async (product: Product): Promise<Product> => {
  const response = await request.post<Product>('/test1', product)
  return response.data
}

/** 更新产品 */
export const updateProduct = async (id: number, product: Product): Promise<Product> => {
  const response = await request.put<Product>(`/products/${id}`, product)
  return response.data
}

/** 删除产品 */
export const deleteProduct = async (id: number): Promise<void> => {
  await request.delete(`/products/${id}`)
}
```

### 3.3 API 总入口

**文件**: `api/index.ts`

```typescript
// 导出所有业务 API 函数
export * from './modules'

// 导出工具函数
export { clearTokenCache, refreshToken } from './utils'

// 导出类型（方便外部直接从 @/api 引入）
export type { Product, OracleUser, AppConfig } from './types'
```

**使用方式**:

```typescript
// 导入 API 函数
import { fetchProducts, addProduct, fetchOracleUsers } from '@/api'

// 导入类型
import type { Product } from '@/api/types'
// 或
import type { Product } from '@/api'
```

---

## 4. 表单弹窗组件模板

**文件**: `components/ProductFormDialog.vue`

```vue
<template>
  <el-dialog
    :model-value="visible"
    @update:model-value="emit('update:visible', $event)"
    title="新增产品"
    width="500px"
    :close-on-click-modal="false"
  >
    <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
      <el-form-item label="产品名" prop="productName">
        <el-input v-model="form.productName" placeholder="请输入产品名称" />
      </el-form-item>
      <!-- 更多表单项... -->
    </el-form>

    <template #footer>
      <el-button @click="emit('update:visible', false)">取消</el-button>
      <el-button type="primary" @click="handleSubmit" :loading="submitting">
        提交
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import { ElMessage } from 'element-plus'
import { addProduct } from '@/api'
import type { Product } from '@/api/types'

const props = defineProps<{
  visible: boolean
}>()

const emit = defineEmits<{
  'update:visible': [value: boolean]
  'submitting': []
  'success': [product: Product]
  'error': [message: string]
}>()

// 表单逻辑...
</script>
```

---

## 5. 展示组件模板（纯展示，无状态）

**文件**: `views/ProductsTab.vue`

```vue
<template>
  <el-table :data="data" v-loading="loading" stripe border>
    <el-table-column prop="id" label="ID" width="80" />
    <el-table-column prop="productName" label="产品名称" />
    <!-- 更多列... -->
  </el-table>
</template>

<script setup lang="ts">
import type { Product } from '@/api/types'

defineProps<{
  data: Product[]
  loading: boolean
}>()
</script>
```

---

## 6. 页面容器组件模板

**文件**: `views/Products.vue`

```vue
<template>
  <div class="page-container">
    <el-card>
      <template #header>
        <div class="page-header">
          <el-button @click="goBack" :icon="ArrowLeft" circle />
          <span class="page-title">产品管理 (PostgreSQL)</span>
          <el-button type="primary" :icon="Plus" @click="dialogVisible = true">
            新增产品
          </el-button>
        </div>
      </template>

      <ProductsTab :data="products" :loading="loading" />
    </el-card>

    <ProductFormDialog
      v-model:visible="dialogVisible"
      @success="handleSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { fetchProducts } from '@/api'
import type { Product } from '@/api/types'
import ProductsTab from '@/views/ProductsTab.vue'
import ProductFormDialog from '@/components/ProductFormDialog.vue'

const products = ref<Product[]>([])
const loading = ref(false)
const dialogVisible = ref(false)

const loadData = async () => {
  loading.value = true
  try {
    products.value = await fetchProducts()
  } finally {
    loading.value = false
  }
}

onMounted(() => loadData())
</script>
```

---

## 7. 快速创建新功能清单

创建新的 CRUD 功能（如订单管理）需要：

| 步骤 | 文件 | 操作 |
|------|------|------|
| 1 | `api/types/order.d.ts` | 创建 `Order` 类型定义 |
| 2 | `api/types/index.ts` | 添加类型导出 |
| 3 | `api/modules/order.ts` | 添加 API 函数 |
| 4 | `api/modules/index.ts` | 添加模块导出 |
| 5 | `views/OrdersTab.vue` | 创建展示组件 |
| 6 | `components/OrderFormDialog.vue` | 创建表单弹窗 |
| 7 | `views/Orders.vue` | 创建页面容器 |
| 8 | `router/index.ts` | 添加路由配置 |
| 9 | `App.vue` | 添加导航菜单项 |

---

## 8. 组件模式速查表

| 组件类型 | Props | Emits | 状态 | 用途 |
|---------|-------|-------|------|------|
| 展示组件 | ✅ | ❌ | ❌ | 纯数据展示 |
| 表单弹窗 | ✅ visible | ✅ 多个事件 | ✅ 表单数据 | 数据录入 |
| 页面容器 | ❌ | ❌ | ✅ 列表+弹窗 | 组合子组件 |

### defineEmits 类型写法

```typescript
const emit = defineEmits<{
  'update:visible': [value: boolean]
  'success': [product: Product]
  'error': [message: string]
}>()

emit('success', newProduct)
```

### defineProps 类型写法

```typescript
// 泛型写法
const props = defineProps<{
  visible: boolean
  initialData?: Product
}>()

// 带默认值
const props = withDefaults(defineProps<{
  loading: boolean
  data: Product[]
}>(), {
  loading: false,
  data: () => []
})
```

---

## 9. 父子组件通信流程图

```
┌─────────────────────────────────────────────────────────────┐
│                    Products.vue (父组件)                      │
│                                                              │
│  ┌─────────────────┐     ┌─────────────────────────────┐    │
│  │ dialogVisible   │────▶│ v-model:visible             │    │
│  │ ref(false)      │◀────│ @update:visible             │    │
│  └─────────────────┘     └─────────────────────────────┘    │
│                                                              │
│  ┌─────────────────┐     ┌─────────────────────────────┐    │
│  │ handleSubmitting│◀────│ @submitting                 │    │
│  │ handleSuccess   │◀────│ @success="handleSuccess"    │    │
│  │ handleError     │◀────│ @error="handleError"        │    │
│  └─────────────────┘     └─────────────────────────────┘    │
│                                   │                          │
│                                   ▼                          │
│                    ┌──────────────────────────┐              │
│                    │  ProductFormDialog.vue   │              │
│                    │      (子组件)            │              │
│                    └──────────────────────────┘              │
└─────────────────────────────────────────────────────────────┘
```
