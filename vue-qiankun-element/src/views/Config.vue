<template>
  <div class="page-container">
    <el-card>
      <template #header>
        <div class="page-header">
          <el-button @click="goBack" :icon="ArrowLeft" circle />
          <span class="page-title">系统配置</span>
        </div>
      </template>

      <ConfigTab :data="currentConfig" />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowLeft } from '@element-plus/icons-vue'
import type { AppConfig } from '@/types/defines'
import { fetchAppConfig } from '@/api/api'
import ConfigTab from '@/views/ConfigTab.vue'

const router = useRouter()
const currentConfig = ref<AppConfig>({
  id: 0,
  name: '',
  desc: '',
  version: '',
  environment: ''
})

const loadConfig = async () => {
  try {
    currentConfig.value = await fetchAppConfig()
  } catch (error) {
    console.error('Failed to load config:', error)
    ElMessage.error('加载配置失败')
  }
}

const goBack = () => router.back()

onMounted(() => {
  loadConfig()
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
</style>
