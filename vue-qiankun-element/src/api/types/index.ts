/**
 * 类型定义统一导出入口
 * 外部引用时只需: import type { Product, OracleUser } from '@/api/types'
 */

// 公共类型
export type {
  PageParams,
  PageResult,
  ResponseData,
  TokenCache
} from './common'

// 用户相关类型
export type { OracleUser, UserQueryParams } from './user'

// 产品相关类型
export type { Product, ProductQueryParams } from './product'

// 配置相关类型
export type { AppConfig } from './config'
