<template>
  <el-descriptions :column="1" border>
    <el-descriptions-item label="Config ID">{{ data.id }}</el-descriptions-item>
    <el-descriptions-item label="Name">{{ data.name }}</el-descriptions-item>
    <el-descriptions-item label="Description">{{ data.desc }}</el-descriptions-item>
    <el-descriptions-item label="Version">{{ data.version }}</el-descriptions-item>
    <el-descriptions-item label="Environment">
      <el-tag :type="data.environment === 'production' ? 'danger' : 'success'">
        {{ data.environment }}
      </el-tag>
    </el-descriptions-item>
  </el-descriptions>
</template>

<script setup lang="ts">
import type { AppConfig } from '@/types/defines'

defineProps<{
  data: AppConfig
}>()
</script>
