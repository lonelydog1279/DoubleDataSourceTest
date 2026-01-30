/**
 * 产品相关 API 接口
 */

import { request } from '../utils/request'
import type { Product } from '../types'

/**
 * 获取所有产品（PostgreSQL 数据源）
 */
export const fetchProducts = async (): Promise<Product[]> => {
  const response = await request.get<Product[]>('/products')
  return response.data
}

/**
 * 添加新产品
 */
export const addProduct = async (product: Product): Promise<Product> => {
  const response = await request.post<Product>('/test1', product)
  return response.data
}

/**
 * 更新产品（预留）
 */
export const updateProduct = async (id: number, product: Product): Promise<Product> => {
  const response = await request.put<Product>(`/products/${id}`, product)
  return response.data
}

/**
 * 删除产品（预留）
 */
export const deleteProduct = async (id: number): Promise<void> => {
  await request.delete(`/products/${id}`)
}
