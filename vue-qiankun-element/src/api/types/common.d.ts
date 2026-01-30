/**
 * 公共通用类型定义
 */

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

/** Token 缓存结构 */
export interface TokenCache {
  token: string
  expireAt: number
}
