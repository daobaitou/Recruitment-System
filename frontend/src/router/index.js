import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { usePermissionStore } from '@/stores/permission'
import { constantRoutes } from './routes'

const router = createRouter({
  history: createWebHistory(),
  routes: constantRoutes
})

// 免登录白名单
const whiteList = ['/login']

router.beforeEach(async (to, from, next) => {
  const userStore = useUserStore()
  const permissionStore = usePermissionStore()
  
  // 如果是去登录页，直接放行
  if (whiteList.indexOf(to.path) !== -1) {
    next()
    return
  }
  
  // 检查是否有token
  if (userStore.token) {
    // 有token的情况下，如果去登录页，重定向到首页
    if (to.path === '/login') {
      next({ path: '/' })
    } else {
      // 检查是否有用户信息
      if (userStore.userInfo && Object.keys(userStore.userInfo).length > 0) {
        next()
      } else {
        try {
          // 获取用户信息
          await userStore.getUserInfo()
          
          // 获取用户角色并生成可访问路由
          const roles = userStore.userInfo.roles || ['admin']
          const accessRoutes = await permissionStore.generateRoutes(roles)
          
          // 动态添加可访问路由
          accessRoutes.forEach(route => {
            router.addRoute(route)
          })
          
          // 确保添加路由已完成
          next({ ...to, replace: true })
        } catch (error) {
          // 获取用户信息失败，清除token并跳转到登录页
          userStore.logout()
          next(`/login?redirect=${to.path}`)
        }
      }
    }
  } else {
    // 没有token，跳转到登录页
    next(`/login?redirect=${to.path}`)
  }
})

export default router