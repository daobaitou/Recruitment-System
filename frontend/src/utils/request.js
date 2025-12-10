import axios from 'axios'
import { ElMessage } from 'element-plus'

// 创建axios实例
const service = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
  timeout: 10000, // 设置请求超时时间为10秒
  headers: { 'Content-Type': 'application/json' }
})

// 请求拦截器
service.interceptors.request.use(
  (config) => {
    // 从localStorage获取token
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    console.error('请求拦截器错误:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
service.interceptors.response.use(
  (response) => {
    const { code, data, message } = response.data
    
    // 根据code判断是否成功
    if (code === 200) {
      return data
    } else {
      // 处理业务错误
      ElMessage({
        message: message || '请求失败',
        type: 'error',
        duration: 5 * 1000
      })
      
      // 如果状态码是 401，说明 token 过期或者无效
      if (code === 401) {
        // 清除 token
        localStorage.removeItem('token')
        localStorage.removeItem('userInfo')
        // 跳转到登录页
        window.location.href = '/login'
      }
      
      const error = new Error(message || '请求失败')
      error.response = response
      throw error
    }
  },
  (error) => {
    console.error('响应拦截器错误:', error)
    
    // 处理HTTP错误状态码
    if (error.response) {
      const { status, data } = error.response
      let errorMessage = ''
      switch (status) {
        case 401:
          // 未授权，清除token并跳转到登录页
          errorMessage = '未授权，请重新登录'
          localStorage.removeItem('token')
          localStorage.removeItem('userInfo')
          window.location.href = '/login'
          break
        case 403:
          errorMessage = '权限不足'
          break
        case 404:
          errorMessage = '请求的资源不存在'
          break
        case 500:
          errorMessage = '服务器内部错误'
          break
        default:
          errorMessage = `请求失败: ${status}`
      }
      ElMessage({
        message: data?.message || errorMessage,
        type: 'error',
        duration: 5 * 1000
      })
    } else if (error.code === 'ECONNABORTED') {
      // 请求超时
      ElMessage({
        message: '请求超时，请稍后重试',
        type: 'error',
        duration: 5 * 1000
      })
    } else if (error.request) {
      // 网络错误
      ElMessage({
        message: '网络错误，请检查网络连接',
        type: 'error',
        duration: 5 * 1000
      })
    } else {
      // 其他错误
      ElMessage({
        message: '请求异常',
        type: 'error',
        duration: 5 * 1000
      })
    }
    
    return Promise.reject(error)
  }
)

export default service