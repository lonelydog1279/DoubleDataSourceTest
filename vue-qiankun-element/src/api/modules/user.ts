/**
 * 用户相关 API 接口
 */

import { request } from '../utils/request'
import type { OracleUser } from '../types'

/**
 * 获取所有 Oracle 用户（Oracle 数据源）
 */
export const fetchOracleUsers = async (): Promise<OracleUser[]> => {
  const response = await request.get<OracleUser[]>('/test')
  return response.data
}

/**
 * 根据 ID 获取用户（预留）
 */
export const getUserById = async (id: number): Promise<OracleUser> => {
  const response = await request.get<OracleUser>(`/users/${id}`)
  return response.data
}
