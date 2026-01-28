import axios from 'axios'
import { qiankunWindow } from 'vite-plugin-qiankun/dist/helper'
import type { Product, OracleUser, AppConfig } from '@/types/defines'

const baseUrl = import.meta.env.VITE_BACKEND_BASE_URL
const authApiUrl = import.meta.env.VITE_AUTH_API_URL
const authEnabled = import.meta.env.VITE_AUTH_ENABLED === 'true'
const tokenExpireMinutes = Number(import.meta.env.VITE_AUTH_TOKEN_EXPIRE_MINUTES) || 30

// 判断是否需要独立认证（开发环境 + 非 qiankun + 认证开启）
const isStandalone = !qiankunWindow.__POWERED_BY_QIANKUN__
const needAuth = authEnabled && isStandalone

// Token 缓存（带过期时间）
const TOKEN_EXPIRE_MS = tokenExpireMinutes * 60 * 1000

interface TokenCache {
  token: string
  expireAt: number
}

let tokenCache: TokenCache | null = null

// 检查 token 是否过期
const isTokenExpired = (): boolean => {
  if (!tokenCache) return true
  return Date.now() > tokenCache.expireAt
}

// 获取开发环境 token
const fetchDevToken = async (): Promise<string> => {
  if (tokenCache && !isTokenExpired()) {
    return tokenCache.token
  }

  try {
    const response = await axios.get(`${authApiUrl}/auth/dev-token`)
    const token = response.data.token || response.data

    tokenCache = {
      token,
      expireAt: Date.now() + TOKEN_EXPIRE_MS
    }

    console.log('[Auth] Token fetched, expires in 30 minutes')
    return token
  } catch (error) {
    console.error('[Auth] Failed to fetch dev token:', error)
    throw error
  }
}

// 主动清除 token 缓存
export const clearTokenCache = () => {
  tokenCache = null
  console.log('[Auth] Token cache cleared')
}

// 刷新 token（清除后重新获取）
export const refreshToken = async (): Promise<string> => {
  clearTokenCache()
  return fetchDevToken()
}

const api = axios.create({
  baseURL: `${baseUrl}`,
  timeout: 10000
})

// 请求拦截器 - 添加 X-USER header
api.interceptors.request.use(
  async (config) => {
    if (needAuth) {
      try {
        const token = await fetchDevToken()
        config.headers['X-USER'] = token
      } catch (error) {
        console.warn('[Auth] Could not add X-USER header')
      }
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Get all Oracle users (from Oracle datasource)
export const fetchOracleUsers = async (): Promise<OracleUser[]> => {
  const response = await api.get<OracleUser[]>('/test')
  return response.data
}

// Get all products (from PostgreSQL datasource)
export const fetchProducts = async (): Promise<Product[]> => {
  const response = await api.get<Product[]>('/products')
  return response.data
}

// Add new product
export const addProduct = async (product: Product): Promise<Product> => {
  const response = await api.post<Product>('/test1', product)
  return response.data
}

// Get app config (mock for demo)
export const fetchAppConfig = async (): Promise<AppConfig> => {
  // Mock config - replace with real API if needed
  return Promise.resolve({
    id: 1,
    name: 'DoubleDatasource Demo',
    desc: 'PostgreSQL + Oracle dual datasource configuration',
    version: '1.0.0',
    environment: 'development'
  })
}
