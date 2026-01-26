<template>
  <div class="home-container">
    <el-card class="welcome-card">
      <template #header>
        <div class="card-header">
          <el-icon size="24"><HomeFilled /></el-icon>
          <span>欢迎使用双数据源管理系统</span>
        </div>
      </template>

      <el-space direction="vertical" :size="20" fill style="width: 100%">
        <el-alert
          title="系统说明"
          type="info"
          :closable="false"
        >
          本系统演示了如何在 Vue 3 应用中同时使用 PostgreSQL 和 Oracle 双数据源。
        </el-alert>

        <el-descriptions title="数据源配置" :column="1" border>
          <el-descriptions-item label="PostgreSQL">
            使用 JPA + Spring Data，管理产品数据
          </el-descriptions-item>
          <el-descriptions-item label="Oracle">
            使用 MyBatis，管理用户数据
          </el-descriptions-item>
        </el-descriptions>

        <el-divider />

        <div class="action-buttons">
          <el-button type="primary" size="large" @click="goToProducts">
            <el-icon><ShoppingCart /></el-icon>
            查看产品
          </el-button>
          <el-button type="success" size="large" @click="goToUsers">
            <el-icon><User /></el-icon>
            查看用户
          </el-button>
          <el-button type="warning" size="large" @click="goToConfig">
            <el-icon><Setting /></el-icon>
            系统配置
          </el-button>
        </div>
      </el-space>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

const goToProducts = () => router.push('/products')
const goToUsers = () => router.push('/users')
const goToConfig = () => router.push('/config')
</script>

<style scoped>
.home-container {
  padding: 20px;
  max-width: 900px;
  margin: 0 auto;
}

.welcome-card {
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 18px;
  font-weight: bold;
}

.action-buttons {
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
  justify-content: center;
}
</style>
