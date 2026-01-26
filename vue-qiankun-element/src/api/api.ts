import axios from 'axios'
import type { Product, OracleUser, AppConfig } from '@/types/defines'

const baseUrl = import.meta.env.VITE_BACKEND_BASE_URL

const api = axios.create({
  baseURL: `${baseUrl}`,
  timeout: 10000
})

// Get all Oracle users (from Oracle datasource)
export const fetchOracleUsers = async (): Promise<OracleUser[]> => {
  const response = await api.get<OracleUser[]>('/test')
  return response.data
}

// Get all products (from PostgreSQL datasource)
export const fetchProducts = async (): Promise<Product[]> => {
  const response = await api.get<Product[]>('/products')
  return response.data
}

// Add new product
export const addProduct = async (product: Product): Promise<void> => {
  await api.post('/test1', product)
}

// Get app config (mock for demo)
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
