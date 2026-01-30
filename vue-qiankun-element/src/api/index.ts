/**
 * API 总入口文件
 * 统一导出所有业务函数，外部仅需引入此文件
 *
 * 使用示例:
 * import { fetchProducts, fetchOracleUsers } from '@/api'
 * import type { Product, OracleUser } from '@/api/types'
 */

// 导出所有业务 API 函数
export * from './modules'

// 导出工具函数（如需在外部使用）
export { clearTokenCache, refreshToken } from './utils'

// 重新导出类型（方便外部直接从 @/api 引入类型）
export type {
  Product,
  ProductQueryParams,
  OracleUser,
  UserQueryParams,
  AppConfig,
  PageParams,
  PageResult,
  ResponseData
} from './types'
