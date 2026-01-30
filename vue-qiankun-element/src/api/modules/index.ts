/**
 * API 模块统一导出
 */

// 用户相关
export { fetchOracleUsers, getUserById } from './user'

// 产品相关
export { fetchProducts, addProduct, updateProduct, deleteProduct } from './product'

// 配置相关
export { fetchAppConfig } from './config'
