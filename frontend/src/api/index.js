import request from '@/utils/request'
import axios from 'axios'
import { ElMessage } from 'element-plus'

// 创建axios实例
const service = axios.create({
  baseURL: '/api', // api的base_url
  timeout: 5000 // 请求超时时间
})

// request拦截器
service.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers['Authorization'] = 'Bearer ' + token
    }
    return config
  },
  error => {
    console.log(error)
    Promise.reject(error)
  }
)

// respone拦截器
service.interceptors.response.use(
  response => {
    const res = response.data
    
    // 如果响应中包含错误码，则显示错误消息
    if (res.code && res.code !== 200) {
      ElMessage.error(res.message || '请求失败')
      return Promise.reject(new Error(res.message || '请求失败'))
    }
    
    return res
  },
  error => {
    console.error('响应错误:', error)
    ElMessage.error(error.message || '网络错误')
    return Promise.reject(error)
  }
)

// 用户相关API
export const userApi = {
  login: (data) => service.post('/auth/login', data),
  logout: () => service.post('/auth/logout'),
  getInfo: () => service.get('/auth/userinfo'),
  getUsers: () => service.get('/auth/users'),
  addUser: (data) => service.post('/users', data),
  updateUser: (id, data) => service.put(`/users/${id}`, data),
  deleteUser: (id) => service.delete(`/users/${id}`)
}

// 资金相关API
export const fundApi = {
  getFunds: () => service.get('/funds'),
  getFund: (id) => service.get(`/funds/${id}`),
  getFundsByName: (name) => service.get(`/funds?name=${encodeURIComponent(name)}`),
  createFund: (data) => service.post('/funds', data),  // 修复方法名称
  updateFund: (id, data) => service.put(`/funds/${id}`, data),
  deleteFund: (id) => service.delete(`/funds/${id}`)
}

// 候选人相关API
export const candidateApi = {
  getCandidates: () => service.get('/candidates'),
  getCandidate: (id) => service.get(`/candidates/${id}`),
  addCandidate: (data) => service.post('/candidates', data),
  updateCandidate: (id, data) => service.put(`/candidates/${id}`, data),
  deleteCandidate: (id) => service.delete(`/candidates/${id}`)
}

export default service
