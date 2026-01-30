/**
 * Axios 请求封装
 * 包含请求实例创建、拦截器配置、认证处理
 */

import axios, { type AxiosInstance, type InternalAxiosRequestConfig } from 'axios'
import { qiankunWindow } from 'vite-plugin-qiankun/dist/helper'
import type { TokenCache } from '../types'

// 环境变量配置
const baseUrl = import.meta.env.VITE_BACKEND_BASE_URL
const authApiUrl = import.meta.env.VITE_AUTH_API_URL
const authEnabled = import.meta.env.VITE_AUTH_ENABLED === 'true'
const tokenExpireMinutes = Number(import.meta.env.VITE_AUTH_TOKEN_EXPIRE_MINUTES) || 30

// 判断是否需要独立认证（开发环境 + 非 qiankun + 认证开启）
const isStandalone = !qiankunWindow.__POWERED_BY_QIANKUN__
const needAuth = authEnabled && isStandalone

// Token 缓存（带过期时间）
const TOKEN_EXPIRE_MS = tokenExpireMinutes * 60 * 1000
let tokenCache: TokenCache | null = null

/**
 * 检查 token 是否过期
 */
const isTokenExpired = (): boolean => {
  if (!tokenCache) return true
  return Date.now() > tokenCache.expireAt
}

/**
 * 获取开发环境 token
 */
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

/**
 * 主动清除 token 缓存
 */
export const clearTokenCache = (): void => {
  tokenCache = null
  console.log('[Auth] Token cache cleared')
}

/**
 * 刷新 token（清除后重新获取）
 */
export const refreshToken = async (): Promise<string> => {
  clearTokenCache()
  return fetchDevToken()
}

/**
 * 创建 axios 实例
 */
const createRequest = (): AxiosInstance => {
  const instance = axios.create({
    baseURL: baseUrl,
    timeout: 10000
  })

  // 请求拦截器 - 添加 X-USER header
  instance.interceptors.request.use(
    async (config: InternalAxiosRequestConfig) => {
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

  // 响应拦截器 - 可扩展统一错误处理
  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      // 可在此处添加统一错误处理逻辑
      return Promise.reject(error)
    }
  )

  return instance
}

/** 导出请求实例 */
export const request = createRequest()
