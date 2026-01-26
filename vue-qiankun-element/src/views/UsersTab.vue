<template>
  <el-table :data="data" stripe border style="width: 100%" v-loading="loading">
    <el-table-column prop="id" label="ID" width="80" align="center" />
    <el-table-column prop="userName" label="User Name" min-width="200" />
    <el-table-column prop="age" label="Age" width="100" align="center" />
  </el-table>
</template>

<script setup lang="ts">
import type { OracleUser } from '@/types/defines'

defineProps<{
  data: OracleUser[]
  loading: boolean
}>()
</script>
