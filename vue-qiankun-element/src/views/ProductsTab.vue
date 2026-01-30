<template>
  <el-table :data="data" stripe border style="width: 100%" v-loading="loading">
    <el-table-column prop="id" label="ID" width="80" align="center" />
    <el-table-column prop="productName" label="Product Name" min-width="150" />
    <el-table-column prop="category" label="Category" width="120" align="center" />
    <el-table-column prop="price" label="Price" width="100" align="right">
      <template #default="{ row }">
        ¥{{ row.price?.toFixed(2) }}
      </template>
    </el-table-column>
    <el-table-column prop="stock" label="Stock" width="100" align="center" />
  </el-table>
</template>

<script setup lang="ts">
import type { Product } from '@/api/types'

defineProps<{
  data: Product[]
  loading: boolean
}>()
</script>
