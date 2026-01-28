<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from './composables/useRouter'

const { currentPath, navigate } = useRouter()

const menuItems = [
  { path: '/', label: 'Home', icon: 'House' },
  { path: '/subapp', label: 'Sub App Home', icon: 'Grid' },
  { path: '/subapp/products', label: 'Sub App - Products', icon: 'ShoppingCart' },
  { path: '/subapp/users', label: 'Sub App - Users', icon: 'User' },
  { path: '/subapp/config', label: 'Sub App - Config', icon: 'Setting' }
]

const isCollapse = ref(false)

// 判断是否在子应用页面
const isInSubApp = computed(() => currentPath.value.startsWith('/subapp'))

// 获取当前子应用的路由路径
const subAppRoute = computed(() => {
  if (currentPath.value === '/subapp') return '/'
  return currentPath.value.replace('/subapp', '') || '/'
})
</script>

<template>
  <el-container class="main-container">
    <!-- Sidebar -->
    <el-aside :width="isCollapse ? '64px' : '200px'" class="sidebar">
      <div class="logo">
        <el-icon size="24"><Connection /></el-icon>
        <span v-show="!isCollapse">Qiankun Demo</span>
      </div>

      <el-menu
        :default-active="currentPath"
        :collapse="isCollapse"
        background-color="#304156"
        text-color="#bfcbd9"
        active-text-color="#409EFF"
        @select="navigate"
      >
        <el-menu-item v-for="item in menuItems" :key="item.path" :index="item.path">
          <el-icon><component :is="item.icon" /></el-icon>
          <template #title>{{ item.label }}</template>
        </el-menu-item>
      </el-menu>

      <div class="collapse-btn" @click="isCollapse = !isCollapse">
        <el-icon>
          <Fold v-if="!isCollapse" />
          <Expand v-else />
        </el-icon>
      </div>
    </el-aside>

    <!-- Main Content -->
    <el-container>
      <el-header class="header">
        <span class="header-title">Qiankun Micro Frontend Demo</span>
        <div class="header-actions">
          <el-tag v-if="isInSubApp" type="warning">子应用已加载</el-tag>
          <el-tag type="success">主应用</el-tag>
        </div>
      </el-header>

      <el-main class="main-content">
        <!-- Home Content -->
        <div v-if="currentPath === '/'" class="home-content">
          <el-card>
            <template #header>
              <div class="card-header">
                <el-icon size="20"><InfoFilled /></el-icon>
                <span>Welcome to Qiankun Main App</span>
              </div>
            </template>

            <el-descriptions :column="1" border>
              <el-descriptions-item label="Main App Port">8000</el-descriptions-item>
              <el-descriptions-item label="Sub App Name">vue-qiankun-element</el-descriptions-item>
              <el-descriptions-item label="Sub App Entry">http://localhost:5173</el-descriptions-item>
              <el-descriptions-item label="Sub App Base Route">/subapp</el-descriptions-item>
              <el-descriptions-item label="Sub App Routes">
                /subapp, /subapp/products, /subapp/users, /subapp/config
              </el-descriptions-item>
            </el-descriptions>

            <el-divider />

            <el-alert
              title="How to use"
              type="info"
              :closable="false"
            >
              <ol style="margin: 0; padding-left: 20px;">
                <li>Start the sub app: <code>cd vue-qiankun-element && npm run dev</code></li>
                <li>Start this main app: <code>cd qiankun-main && npm run dev</code></li>
                <li>Use the sidebar to navigate to different pages</li>
              </ol>
            </el-alert>

            <el-divider />

            <el-space>
              <el-button type="primary" @click="navigate('/subapp')">
                <el-icon><Grid /></el-icon>
                Go to Sub App Home
              </el-button>
              <el-button type="success" @click="navigate('/subapp/products')">
                <el-icon><ShoppingCart /></el-icon>
                Go to Products
              </el-button>
            </el-space>
          </el-card>
        </div>

        <!-- Sub App Container -->
        <div v-show="isInSubApp">
          <!-- 子应用内导航（可选） -->
          <div class="subapp-nav-hint" v-if="isInSubApp">
            <el-alert type="info" :closable="false">
              <template #title>
                当前位置: {{ currentPath }} (子应用路由: {{ subAppRoute }})
              </template>
            </el-alert>
          </div>
          <div id="subapp-container"></div>
        </div>
      </el-main>
    </el-container>
  </el-container>
</template>

<style scoped>
.main-container {
  height: 100vh;
}

.sidebar {
  background-color: #304156;
  transition: width 0.3s;
  display: flex;
  flex-direction: column;
}

.logo {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  color: #fff;
  font-size: 16px;
  font-weight: bold;
  border-bottom: 1px solid #3a4a5e;
}

.el-menu {
  border-right: none;
  flex: 1;
}

.collapse-btn {
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #bfcbd9;
  cursor: pointer;
  border-top: 1px solid #3a4a5e;
}

.collapse-btn:hover {
  background-color: #3a4a5e;
}

.header {
  background-color: #fff;
  border-bottom: 1px solid #e6e6e6;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
}

.header-title {
  font-size: 18px;
  font-weight: bold;
  color: #303133;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.main-content {
  background-color: #f5f7fa;
  padding: 20px;
}

.home-content {
  max-width: 800px;
  margin: 0 auto;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: bold;
}

#subapp-container {
  min-height: calc(100vh - 200px);
  background: #fff;
  border-radius: 4px;
}

.subapp-nav-hint {
  margin-bottom: 15px;
}

code {
  background: #f5f5f5;
  padding: 2px 6px;
  border-radius: 4px;
  font-family: monospace;
}
</style>
