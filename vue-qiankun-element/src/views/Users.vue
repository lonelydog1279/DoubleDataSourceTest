<template>
  <div class="page-container">
    <el-card>
      <template #header>
        <div class="page-header">
          <el-button @click="goBack" :icon="ArrowLeft" circle />
          <span class="page-title">用户管理 (Oracle)</span>
        </div>
      </template>

      <UsersTab :data="oracleUsers" :loading="loading" />

      <div class="page-actions">
        <el-button @click="loadData" :icon="Refresh">刷新数据</el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowLeft, Refresh } from '@element-plus/icons-vue'
import { fetchOracleUsers } from '@/api'
import type { OracleUser } from '@/api/types'
import UsersTab from '@/views/UsersTab.vue'

const router = useRouter()
const oracleUsers = ref<OracleUser[]>([])
const loading = ref(false)

const loadData = async () => {
  loading.value = true
  try {
    oracleUsers.value = await fetchOracleUsers()
  } catch (error) {
    console.error('Failed to load users:', error)
    ElMessage.error('加载用户数据失败')
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
