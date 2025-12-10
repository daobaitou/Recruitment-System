import { defineStore } from 'pinia'
import { candidateApi, fundApi } from '@/api'
import { ElMessage } from 'element-plus'
import { ref, reactive } from 'vue'

export const useCandidateStore = defineStore('candidate', () => {
  // 响应式状态
  const candidates = ref([])
  const currentCandidate = ref(null)
  const loading = ref(false)

  // 获取候选人列表
  async function fetchCandidates() {
    try {
      console.log('开始获取候选人数据...')
      loading.value = true
      const response = await candidateApi.getCandidates()
      console.log('成功加载候选人列表，共', response.data.length, '条记录')
      candidates.value = response.data || []
      return candidates.value
    } catch (error) {
      console.error('获取候选人列表失败:', error)
      ElMessage.error('获取候选人列表失败')
      throw error
    } finally {
      loading.value = false
    }
  }

  // 根据ID获取候选人详情
  async function fetchCandidateById(id) {
    try {
      console.log('加载候选人详情，ID:', id)
      loading.value = true
      const response = await candidateApi.getCandidate(id)
      console.log('候选人详情加载成功')
      currentCandidate.value = response.data
      return currentCandidate.value
    } catch (error) {
      console.error('获取候选人详情失败:', error)
      ElMessage.error('候选人不存在')
      throw error
    } finally {
      loading.value = false
    }
  }

  // 添加候选人
  async function addCandidate(candidateData) {
    try {
      console.log('正在添加候选人:', candidateData)
      // 构造正确的候选人数据对象
      const candidatePayload = {
        fundId: candidateData.fundId,
        name: candidateData.name,
        position: candidateData.position,
        phone: candidateData.phone,
        email: candidateData.email || '',
        source: candidateData.source || '',
        education: candidateData.education || '',
        experience: candidateData.experience || '',
        expectedSalary: candidateData.expectedSalary || '',
        process: candidateData.process || 'invite', // 默认面试阶段为'邀约'
        interviewStatus: candidateData.interviewStatus || 'pending' // 默认面试状态为'待约'
      }
      
      const response = await candidateApi.addCandidate(candidatePayload)
      const newCandidate = response.data
      
      // 确保 interviewStatus 有默认值
      if (!newCandidate.interviewStatus) {
        newCandidate.interviewStatus = 'pending'
      }
      
      candidates.value.push(newCandidate)
      console.log('成功添加候选人:', newCandidate)
      ElMessage.success('成功添加候选人')
      return newCandidate
    } catch (error) {
      console.error('添加候选人失败:', error)
      console.error('错误详情:', {
        message: error.message,
        code: error.code,
        stack: error.stack,
        data: candidateData
      })
      ElMessage.error('添加候选人失败')
      throw error
    }
  }

  // 更新候选人
  async function updateCandidate(id, candidateData) {
    try {
      console.log('正在更新候选人:', id, candidateData)
      const response = await candidateApi.updateCandidate(id, candidateData)
      const updatedCandidate = response.data
      const index = candidates.value.findIndex(item => item.id == id)
      if (index !== -1) {
        candidates.value[index] = updatedCandidate
      }
      if (currentCandidate.value && currentCandidate.value.id == id) {
        currentCandidate.value = updatedCandidate
      }
      console.log('成功更新候选人:', updatedCandidate)
      ElMessage.success('成功更新候选人')
      return updatedCandidate
    } catch (error) {
      console.error('更新候选人失败:', error)
      ElMessage.error('更新候选人失败')
      throw error
    }
  }

  // 删除候选人
  async function deleteCandidate(id) {
    try {
      console.log('正在删除候选人:', id)
      await candidateApi.deleteCandidate(id)
      const index = candidates.value.findIndex(item => item.id == id)
      if (index !== -1) {
        candidates.value.splice(index, 1)
      }
      if (currentCandidate.value && currentCandidate.value.id == id) {
        currentCandidate.value = null
      }
      console.log('成功删除候选人:', id)
      ElMessage.success('成功删除候选人')
    } catch (error) {
      console.error('删除候选人失败:', error)
      ElMessage.error('删除候选人失败')
      throw error
    }
  }

  // 根据资金ID筛选候选人
  async function fetchCandidatesByFundId(fundId) {
    try {
      console.log('开始根据资金ID获取候选人数据:', fundId)
      loading.value = true
      await fetchCandidates() // 先获取所有候选人
      // 然后筛选出指定资金ID的候选人
      return candidates.value.filter(candidate => candidate.fundId == fundId)
    } catch (error) {
      console.error('根据资金ID获取候选人失败:', error)
      ElMessage.error('根据资金ID获取候选人失败')
      throw error
    } finally {
      loading.value = false
    }
  }

  // 设置当前候选人
  function setCurrentCandidate(candidate) {
    currentCandidate.value = candidate
  }

  // 清除当前候选人
  function clearCurrentCandidate() {
    currentCandidate.value = null
  }

  return {
    candidates,
    currentCandidate,
    loading,
    fetchCandidates,
    fetchCandidateById,
    addCandidate,
    updateCandidate,
    deleteCandidate,
    fetchCandidatesByFundId,
    setCurrentCandidate,
    clearCurrentCandidate
  }
})