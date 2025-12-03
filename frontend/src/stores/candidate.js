import { defineStore } from 'pinia'
import { ElMessage } from 'element-plus'
import { candidateApi } from '@/api'

export const useCandidateStore = defineStore('candidate', {
  state: () => ({
    candidates: [],
    currentCandidate: null,
    loading: false
  }),

  getters: {
    getCandidateById: (state) => (id) => {
      return state.candidates.find(candidate => candidate.id === id)
    },
    
    getCandidatesByFundId: (state) => (fundId) => {
      return state.candidates.filter(candidate => 
        !fundId || candidate.fundId === fundId
      )
    },

    // 根据面试阶段和状态获取候选人数量
    getCandidateCountByStage: (state) => ({ fundId, stage }) => {
      return state.candidates.filter(candidate => {
        const fundMatch = !fundId || candidate.fundId === fundId
        const stageMatch = !stage || candidate.process === stage
        return fundMatch && stageMatch
      }).length
    }
  },

  actions: {
    setCurrentCandidate(candidate) {
      this.currentCandidate = candidate
    },

    async loadCandidates() {
      this.loading = true
      try {
        const response = await candidateApi.getCandidates()
        this.candidates = response.data || []
        console.log('成功加载候选人列表，共', this.candidates.length, '条记录')
      } catch (error) {
        console.error('获取候选人列表失败:', error)
        console.error('错误详情:', {
          message: error.message,
          code: error.code,
          stack: error.stack
        })
        ElMessage.error('获取候选人列表失败: ' + error.message)
        throw error
      } finally {
        this.loading = false
      }
    },

    async fetchCandidates() {
      console.log('开始获取候选人数据...')
      try {
        await this.loadCandidates()
        console.log('候选人数据获取完成')
      } catch (error) {
        console.error('获取候选人数据失败:', error)
        ElMessage.error('获取候选人数据失败')
        throw error
      }
    },

    async addCandidate(candidateData) {
      try {
        console.log('正在添加候选人:', candidateData)
        const response = await candidateApi.createCandidate(candidateData)
        const newCandidate = response.data
        // 确保 interviewStatus 有默认值
        if (!newCandidate.interviewStatus) {
          newCandidate.interviewStatus = 'pending'
        }
        this.candidates.push(newCandidate)
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
        ElMessage.error('添加候选人失败: ' + error.message)
        throw error
      }
    },

    async updateCandidate(id, candidateData) {
      try {
        console.log('正在更新候选人:', id, candidateData)
        const response = await candidateApi.updateCandidate(id, candidateData)
        const updatedCandidate = response.data
        
        // 更新候选人信息
        const index = this.candidates.findIndex(candidate => candidate.id === id)
        if (index !== -1) {
          // 确保 interviewStatus 有默认值
          if (!updatedCandidate.interviewStatus) {
            updatedCandidate.interviewStatus = 'pending'
          }
          
          // 更新状态文本
          updatedCandidate.statusText = getInterviewStatusText(
            updatedCandidate.interviewStage,
            updatedCandidate.interviewStatus
          )
          
          this.candidates.splice(index, 1, updatedCandidate)
          console.log('成功更新候选人:', updatedCandidate)
          ElMessage.success('成功更新候选人')
        } else {
          console.warn('未找到要更新的候选人:', id)
          ElMessage.warning('未找到要更新的候选人')
        }
        
        return updatedCandidate
      } catch (error) {
        console.error('更新候选人失败:', error)
        console.error('错误详情:', {
          message: error.message,
          code: error.code,
          stack: error.stack,
          id: id,
          data: candidateData
        })
        ElMessage.error('更新候选人失败: ' + error.message)
        throw error
      }
    },

    async deleteCandidate(id) {
      try {
        console.log('正在删除候选人:', id)
        await candidateApi.deleteCandidate(id)
        this.candidates = this.candidates.filter(candidate => candidate.id !== id)
        console.log('成功删除候选人:', id)
        ElMessage.success('成功删除候选人')
      } catch (error) {
        console.error('删除候选人失败:', error)
        console.error('错误详情:', {
          message: error.message,
          code: error.code,
          stack: error.stack,
          id: id
        })
        ElMessage.error('删除候选人失败: ' + error.message)
        throw error
      }
    }
  }
})

// 获取面试状态文本
function getInterviewStatusText(stage, status) {
  const statusMap = {
    'pending': '待约',
    'unconfirmed': '未确认',
    'confirmed': '已确认',
    'completed': '已完成',
    'rejected': '已拒'
  }
  
  return statusMap[status] || '待约'
}