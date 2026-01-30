/**
 * 产品相关类型定义
 */

/** 产品信息 */
export interface Product {
  id?: number
  productName: string
  category: string
  price: number
  stock: number
  createTime?: string
}

/** 产品查询参数 */
export interface ProductQueryParams {
  keyword?: string
  category?: string
  page?: number
  pageSize?: number
}
