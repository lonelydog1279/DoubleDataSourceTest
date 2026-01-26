<template>
  <div class="page-container">
    <el-card>
      <template #header>
        <div class="page-header">
          <el-button @click="goBack" :icon="ArrowLeft" circle />
          <span class="page-title">产品管理 (PostgreSQL)</span>
          <el-button type="primary" :icon="Plus" @click="dialogVisible = true">
            新增产品
          </el-button>
        </div>
      </template>

      <ProductsTab :data="products" :loading="loading" />

      <div class="page-actions">
        <el-button @click="loadData" :icon="Refresh">刷新数据</el-button>
      </div>
    </el-card>

    <ProductFormDialog
      v-model:visible="dialogVisible"
      @success="loadData"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowLeft, Plus, Refresh } from '@element-plus/icons-vue'
import type { Product } from '@/types/defines'
import { fetchProducts } from '@/api/api'
import ProductsTab from '@/views/ProductsTab.vue'
import ProductFormDialog from '@/components/ProductFormDialog.vue'

const router = useRouter()
const products = ref<Product[]>([])
const loading = ref(false)
const dialogVisible = ref(false)

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
