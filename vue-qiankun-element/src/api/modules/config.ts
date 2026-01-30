/**
 * 应用配置相关 API 接口
 */

import type { AppConfig } from '../types'

/**
 * 获取应用配置（Mock 演示数据）
 */
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
