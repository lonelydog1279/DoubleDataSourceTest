/**
 * 数据转换工具函数
 * 用于请求参数格式化、响应数据处理
 */

import type { PageParams } from '../types'

/**
 * 过滤对象中的空值（undefined, null, ''）
 */
export const filterEmptyParams = <T extends Record<string, unknown>>(params: T): Partial<T> => {
  const result: Partial<T> = {}
  for (const key in params) {
    const value = params[key]
    if (value !== undefined && value !== null && value !== '') {
      result[key] = value
    }
  }
  return result
}

/**
 * 构建分页查询参数
 */
export const buildPageParams = (page: number = 1, pageSize: number = 10): PageParams => {
  return {
    page: Math.max(1, page),
    pageSize: Math.max(1, Math.min(100, pageSize))
  }
}

/**
 * 格式化日期为 YYYY-MM-DD 格式
 */
export const formatDate = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toISOString().split('T')[0] as string
}

/**
 * 格式化日期时间为 YYYY-MM-DD HH:mm:ss 格式
 */
export const formatDateTime = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toISOString().replace('T', ' ').substring(0, 19)
}
