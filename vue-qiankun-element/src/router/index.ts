import { createRouter, createMemoryHistory, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { qiankunWindow } from 'vite-plugin-qiankun/dist/helper'

// 页面组件
import Home from '@/views/Home.vue'
import Products from '@/views/Products.vue'
import Users from '@/views/Users.vue'
import Config from '@/views/Config.vue'

// 路由配置
const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: Home,
    meta: { title: '首页' }
  },
  {
    path: '/products',
    name: 'Products',
    component: Products,
    meta: { title: '产品管理 (PostgreSQL)' }
  },
  {
    path: '/users',
    name: 'Users',
    component: Users,
    meta: { title: '用户管理 (Oracle)' }
  },
  {
    path: '/config',
    name: 'Config',
    component: Config,
    meta: { title: '系统配置' }
  }
]

/**
 * 创建路由实例
 * 在 qiankun 环境中使用 memory 模式，独立运行时使用 web 模式
 */
export function createRouterInstance() {
  const isQiankun = qiankunWindow.__POWERED_BY_QIANKUN__

  // 在 qiankun 中使用内存路由，避免与主应用路由冲突
  const history = isQiankun
    ? createMemoryHistory('/subapp')
    : createWebHistory('/')

  const router = createRouter({
    history,
    routes
  })

  return router
}

export default createRouterInstance()
