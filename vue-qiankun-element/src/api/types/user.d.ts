/**
 * 用户相关类型定义
 */

/** Oracle 数据源用户 */
export interface OracleUser {
  id: number
  userName: string
  age: number
}

/** 用户查询参数 */
export interface UserQueryParams {
  keyword?: string
  page?: number
  pageSize?: number
}
