export interface Product {
  id?: number
  productName: string
  category: string
  price: number
  stock: number
  createTime?: string
}

export interface OracleUser {
  id: number
  userName: string
  age: number
}

export interface AppConfig {
  id: number
  name: string
  desc: string
  version: string
  environment: string
}
