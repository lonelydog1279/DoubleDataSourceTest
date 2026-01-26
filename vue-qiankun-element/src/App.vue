<template>
  <div class="app-wrapper">
    <!-- 顶部导航栏 -->
    <div class="navbar">
      <div class="nav-brand">
        <el-icon size="20"><Grid /></el-icon>
        <span>双数据源管理系统</span>
      </div>
      <div class="nav-menu">
        <router-link to="/" custom v-slot="{ navigate, isActive }">
          <el-button
            :type="isActive ? 'primary' : 'default'"
            text
            @click="navigate"
          >
            <el-icon><HomeFilled /></el-icon>
            首页
          </el-button>
        </router-link>
        <router-link to="/products" custom v-slot="{ navigate, isActive }">
          <el-button
            :type="isActive ? 'primary' : 'default'"
            text
            @click="navigate"
          >
            <el-icon><ShoppingCart /></el-icon>
            产品
          </el-button>
        </router-link>
        <router-link to="/users" custom v-slot="{ navigate, isActive }">
          <el-button
            :type="isActive ? 'primary' : 'default'"
            text
            @click="navigate"
          >
            <el-icon><User /></el-icon>
            用户
          </el-button>
        </router-link>
        <router-link to="/config" custom v-slot="{ navigate, isActive }">
          <el-button
            :type="isActive ? 'primary' : 'default'"
            text
            @click="navigate"
          >
            <el-icon><Setting /></el-icon>
            配置
          </el-button>
        </router-link>
      </div>
      <!-- 运行模式标识 -->
      <div class="mode-badge">
        <el-tag :type="isQiankun ? 'warning' : 'success'" size="small">
          {{ isQiankun ? '微前端模式' : '独立模式' }}
        </el-tag>
      </div>
    </div>

    <!-- 路由视图 -->
    <div class="app-content">
      <router-view />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { qiankunWindow } from 'vite-plugin-qiankun/dist/helper'

// 判断是否在 qiankun 环境中运行
const isQiankun = computed(() => qiankunWindow.__POWERED_BY_QIANKUN__)
</script>

<style scoped>
.app-wrapper {
  min-height: 100vh;
  background-color: #f5f7fa;
}

.navbar {
  background-color: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  padding: 0 20px;
  height: 56px;
  position: sticky;
  top: 0;
  z-index: 100;
}

.nav-brand {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: bold;
  color: #303133;
  margin-right: 40px;
}

.nav-menu {
  display: flex;
  gap: 8px;
  flex: 1;
}

.nav-menu .el-button {
  display: flex;
  align-items: center;
  gap: 4px;
}

.mode-badge {
  margin-left: auto;
}

.app-content {
  padding: 0;
}

/* 路由过渡动画 */
.app-content > :deep(div) {
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
