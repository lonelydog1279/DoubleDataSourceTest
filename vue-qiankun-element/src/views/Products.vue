<template>
  <div class="page-container">
    <el-card>
      <template #header>
        <div class="page-header">
          <el-button @click="goBack" :icon="ArrowLeft" circle/>
          <span class="page-title">产品管理 (PostgreSQL)</span>
          <el-button type="primary" :icon="Plus" @click="dialogVisible = true">
            新增产品
          </el-button>
          <el-button type="primary" :icon="Plus" @click="testVisible = true">
            测试
          </el-button>
        </div>
      </template>

      <!-- 状态提示 Alert -->
      <el-alert
          v-if="alertState.show"
          :title="alertState.message"
          :type="alertState.type"
          :closable="alertState.type !== 'info'"
          @close="alertState.show = false"
          show-icon
          style="margin-bottom: 16px"
      />

      <ProductsTab :data="products" :loading="loading"/>

      <div class="page-actions">
        <el-button @click="loadData" :icon="Refresh">刷新数据</el-button>
      </div>
    </el-card>

    <ProductFormDialog
        v-model:visible="dialogVisible"
        @submitting="handleSubmitting"
        @success="handleSuccess"
        @error="handleError"
    />

    <TestDialog v-model:visible="testVisible"
      @submitting="handleTestSubmitting"
      @success="handleTestSuccess"
      @error="handleTestError"
    />
  </div>
</template>

<script setup lang="ts">
import {ref, reactive, onMounted} from 'vue'
import {useRouter} from 'vue-router'
import {ElMessage} from 'element-plus'
import {ArrowLeft, Plus, Refresh} from '@element-plus/icons-vue'
import { fetchProducts } from '@/api'
import type { Product } from '@/api/types'
import ProductsTab from '@/views/ProductsTab.vue'
import ProductFormDialog from '@/components/ProductFormDialog.vue'
import TestDialog from "@/components/TestDialog.vue";

const router = useRouter()
const products = ref<Product[]>([])
const loading = ref(false)
const dialogVisible = ref(false)
const testVisible = ref(false)

// Alert 状态管理
const alertState = reactive<{
  show: boolean
  type: 'info' | 'success' | 'error'
  message: string
}>({
  show: false,
  type: 'info',
  message: ''
})

const handleSubmitting = () => {
  alertState.show = true
  alertState.type = 'info'
  alertState.message = '正在提交...'
}

const handleSuccess = (newProduct: Product) => {
  alertState.show = true
  alertState.type = 'success'
  alertState.message = `产品 "${newProduct.productName}" 添加成功！`
  products.value.push(newProduct)
}

const handleError = (msg: string) => {
  alertState.show = true
  alertState.type = 'error'
  alertState.message = msg || '产品添加失败'
}

const loadData = async () => {
  loading.value = true
  try {
    products.value = await fetchProducts()
  } catch (error) {
    console.error('Failed to load products:', error)
    ElMessage.error('加载产品数据失败')
  } finally {
    loading.value = false
  }
}

const handleTestSubmitting = (msg: string, msg1: string) => {
  ElMessage.info("recieved submitting" + msg + msg1)
}

const handleTestSuccess = () => {
  ElMessage.info("recieved success")
}

const handleTestError = () => {
  ElMessage.info("recieved error")
}

const goBack = () => router.back()

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.page-container {
  padding: 20px;
}

.page-header {
  display: flex;
  align-items: center;
  gap: 15px;
}

.page-title {
  flex: 1;
  font-size: 16px;
  font-weight: bold;
}

.page-actions {
  margin-top: 20px;
}
</style>
