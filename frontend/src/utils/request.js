import axios from 'axios'
import { ElMessage } from 'element-plus'

// 创建axios实例
const service = axios.create({
  baseURL: 'http://localhost:3000/api', // 真实的后端服务地址
  timeout: 15000 // 增加请求超时时间到15秒，以更好地处理慢速网络或耗时较长的请求
})

// 请求拦截器
service.interceptors.request.use(
  config => {
    // 在发送请求之前做些什么
    // 从 localStorage 中获取 token
    const token = localStorage.getItem('token')
    if (token) {
      // 在请求头中添加 token
      config.headers['Authorization'] = `Bearer ${token}`
    }
    return config
  },
  error => {
    // 对请求错误做些什么
    console.log(error)
    return Promise.reject(error)
  }
)

// 响应拦截器
service.interceptors.response.use(
  response => {
    // 对响应数据做点什么
    const res = response.data
    
    // 如果返回的状态码不是200，则判断为错误
    if (res.code !== 200) {
      ElMessage({
        message: res.message || 'Error',
        type: 'error',
        duration: 5 * 1000
      })
      
      // 如果状态码是 401，说明 token 过期或者无效
      if (res.code === 401) {
        // 清除 token
        localStorage.removeItem('token')
        // 跳转到登录页
        window.location.href = '/login'
      }
      
      return Promise.reject(new Error(res.message || 'Error'))
    } else {
      return res
    }
  },
  error => {
    // 对响应错误做点什么
    console.log('err' + error) // for debug
    if (error.response && error.response.status) {
      switch (error.response.status) {
        case 401:
          // 未授权，跳转到登录页
          ElMessage({
            message: '未授权，请重新登录',
            type: 'error',
            duration: 5 * 1000
          })
          // 清除token并跳转到登录页
          localStorage.removeItem('token')
          localStorage.removeItem('userInfo')
          window.location.href = '/login'
          break
        case 403:
          // 禁止访问
          ElMessage({
            message: '拒绝访问',
            type: 'error',
            duration: 5 * 1000
          })
          break
        case 404:
          // 页面不存在
          ElMessage({
            message: '请求地址出错',
            type: 'error',
            duration: 5 * 1000
          })
          break
        case 500:
          // 服务器内部错误
          ElMessage({
            message: '服务器错误',
            type: 'error',
            duration: 5 * 1000
          })
          break
        default:
          ElMessage({
            message: error.response.data.message || '未知错误',
            type: 'error',
            duration: 5 * 1000
          })
      }
    } else if (error.code === 'ECONNABORTED') {
      // 请求超时
      ElMessage({
        message: '请求超时，请稍后重试',
        type: 'error',
        duration: 5 * 1000
      })
    } else {
      // 其他错误
      ElMessage({
        message: '网络错误，请检查网络连接',
        type: 'error',
        duration: 5 * 1000
      })
    }
    
    return Promise.reject(error)
  }
)

export default service