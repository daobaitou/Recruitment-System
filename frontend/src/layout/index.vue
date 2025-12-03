<template>
  <div class="app-wrapper">
    <el-container>
      <!-- 侧边栏 -->
      <el-aside width="200px" class="sidebar-container">
        <div class="logo">
          <h1>招聘系统</h1>
        </div>
        <el-menu
          :default-active="activeMenu"
          class="sidebar-menu"
          background-color="#304156"
          text-color="#bfcbd9"
          active-text-color="#409eff"
          router
        >
          <sidebar-item 
            v-for="route in permissionRoutes" 
            :key="route.path" 
            :item="route" 
            :base-path="route.path" 
          />
        </el-menu>
      </el-aside>
      
      <el-container>
        <!-- 头部 -->
        <el-header class="header">
          <div class="navbar">
            <div class="user-info">
              <el-dropdown @command="handleUserCommand">
                <span class="el-dropdown-link">
                  {{ userName }}<i class="el-icon-arrow-down el-icon--right"></i>
                </span>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item command="profile">个人中心</el-dropdown-item>
                    <el-dropdown-item command="logout">退出登录</el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
          </div>
        </el-header>
        
        <!-- 主体内容 -->
        <el-main class="main-container">
          <router-view />
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { usePermissionStore } from '@/stores/permission'
import SidebarItem from './components/SidebarItem.vue'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const permissionStore = usePermissionStore()

// 获取用户名称
const userName = computed(() => userStore.userName)

// 获取权限路由
const permissionRoutes = computed(() => permissionStore.permissionRoutes)

// 当前激活菜单
const activeMenu = computed(() => {
  const { meta, path } = route
  if (meta.activeMenu) {
    return meta.activeMenu
  }
  return path
})

// 用户下拉菜单处理
const handleUserCommand = (command) => {
  if (command === 'logout') {
    userStore.logout()
    router.push('/login')
  } else if (command === 'profile') {
    // 跳转到个人中心
  }
}
</script>

<style scoped>
.app-wrapper {
  height: 100vh;
}

.sidebar-container {
  background-color: #304156;
  transition: width 0.28s;
}

.logo {
  height: 60px;
  line-height: 60px;
  text-align: center;
  background-color: #2b2f3a;
}

.logo h1 {
  color: #fff;
  font-size: 16px;
  margin: 0;
}

.sidebar-menu {
  border-right: none;
  height: calc(100% - 60px);
}

.header {
  background-color: #fff;
  box-shadow: 0 1px 4px rgba(0,21,41,.08);
  padding: 0;
}

.navbar {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  height: 100%;
  padding-right: 20px;
}

.main-container {
  padding: 20px;
  background-color: #f0f2f5;
}
</style>