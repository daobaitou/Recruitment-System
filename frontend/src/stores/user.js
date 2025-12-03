import { defineStore } from 'pinia'
import { userApi } from '@/api'
import { ElMessage } from 'element-plus'
import router from '@/router'

export const useUserStore = defineStore('user', {
  state: () => ({
    token: localStorage.getItem('token') || '',
    userInfo: {},
    users: [], // 添加用户列表
    loading: false,
    error: null
  }),

  getters: {
    isLoggedIn: (state) => !!state.token,
    userName: (state) => state.userInfo.name || state.userInfo.username || '',
    userEmail: (state) => state.userInfo.email || '',
    userPhone: (state) => state.userInfo.phone || '',
    userRoles: (state) => state.userInfo.roles || [],
    userId: (state) => state.userInfo.id || null
  },

  actions: {
    // 用户登录
    async login(loginData) {
      this.loading = true
      this.error = null
      try {
        console.log('正在进行用户登录...', loginData)
        const response = await userApi.login(loginData)
        const { token, userInfo } = response.data
        
        // 保存token到localStorage和state
        this.token = token
        localStorage.setItem('token', token)
        
        // 保存用户信息到state
        this.userInfo = userInfo
        
        console.log('用户登录成功:', userInfo)
        ElMessage.success('登录成功')
        
        // 跳转到首页
        router.push('/')
        return response.data
      } catch (error) {
        console.error('登录失败:', error)
        console.error('错误详情:', {
          message: error.message,
          code: error.code,
          stack: error.stack,
          data: loginData
        })
        this.error = error
        ElMessage.error(error.response?.data?.message || '登录失败，请检查用户名和密码')
        throw error
      } finally {
        this.loading = false
      }
    },

    // 获取用户信息
    async getUserInfo() {
      if (!this.isLoggedIn) {
        console.warn('未登录，无法获取用户信息')
        return null
      }
      
      try {
        console.log('正在获取用户信息...')
        const response = await userApi.getInfo()
        this.userInfo = response.data
        console.log('成功获取用户信息:', response.data)
        return response.data
      } catch (error) {
        console.error('获取用户信息失败:', error)
        console.error('错误详情:', {
          message: error.message,
          code: error.code,
          stack: error.stack
        })
        
        // 清除token和用户信息
        this.logout()
        ElMessage.error('获取用户信息失败，请重新登录')
        throw error
      }
    },

    // 更新用户信息
    async updateUserInfo(userInfo) {
      this.loading = true
      this.error = null
      try {
        console.log('正在更新用户信息...', userInfo)
        const response = await userApi.updateUserInfo(userInfo)
        this.userInfo = response.data
        console.log('用户信息更新成功:', response.data)
        ElMessage.success('用户信息更新成功')
        return response.data
      } catch (error) {
        console.error('更新用户信息失败:', error)
        console.error('错误详情:', {
          message: error.message,
          code: error.code,
          stack: error.stack,
          data: userInfo
        })
        this.error = error
        ElMessage.error(error.response?.data?.message || '更新用户信息失败')
        throw error
      } finally {
        this.loading = false
      }
    },

    // 获取用户列表
    async fetchUsers() {
      if (!this.isLoggedIn) {
        console.warn('未登录，无法获取用户列表')
        return null
      }
      
      this.loading = true
      this.error = null
      try {
        console.log('正在获取用户列表...')
        const response = await userApi.getUsers()
        this.users = response.data
        console.log('成功获取用户列表:', {
          count: response.data.length,
          data: response.data
        })
        return response.data
      } catch (error) {
        console.error('获取用户列表失败:', error)
        console.error('错误详情:', {
          message: error.message,
          code: error.code,
          stack: error.stack
        })
        this.error = error
        ElMessage.error(error.response?.data?.message || '获取用户列表失败')
        throw error
      } finally {
        this.loading = false
      }
    },

    // 用户登出
    logout() {
      console.log('用户登出', this.userInfo)
      this.token = ''
      this.userInfo = {}
      this.users = []
      this.error = null
      localStorage.removeItem('token')
      router.push('/login')
      ElMessage.info('已退出登录')
    }
  }
})