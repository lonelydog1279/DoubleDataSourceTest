import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { qiankunWindow } from 'vite-plugin-qiankun/dist/helper'

// 路由配置 - 使用懒加载，每个页面单独打包成 chunk
const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/Home.vue'),
    meta: { title: '首页' }
  },
  {
    path: '/products',
    name: 'Products',
    component: () => import('@/views/Products.vue'),
    meta: { title: '产品管理 (PostgreSQL)' }
  },
  {
    path: '/users',
    name: 'Users',
    component: () => import('@/views/Users.vue'),
    meta: { title: '用户管理 (Oracle)' }
  },
  {
    path: '/config',
    name: 'Config',
    component: () => import('@/views/Config.vue'),
    meta: { title: '系统配置' }
  }
]

/**
 * 创建路由实例
 * qiankun 环境使用 VITE_QIANKUN_ROUTER_BASE，独立运行使用 VITE_ROUTER_BASE
 */
export function createRouterInstance() {
  const isQiankun = qiankunWindow.__POWERED_BY_QIANKUN__

  // 从环境变量读取 router base
  const routerBase = import.meta.env.VITE_ROUTER_BASE || '/dual-datasource-test/'
  const qiankunRouterBase = import.meta.env.VITE_QIANKUN_ROUTER_BASE || '/subapp'

  const history = isQiankun
    ? createWebHistory(qiankunRouterBase)
    : createWebHistory(routerBase)

  const router = createRouter({
    history,
    routes
  })

  return router
}

export default createRouterInstance()
