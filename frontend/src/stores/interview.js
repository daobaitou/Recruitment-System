import { defineStore } from 'pinia'
import { 
  interviewApi
} from '@/api'

export const useInterviewStore = defineStore('interview', {
  state: () => ({
    interviews: [],
    currentInterview: null,
    loading: false
  }),

  getters: {
    // 根据候选人ID获取面试记录
    getInterviewsByCandidate: (state) => (candidateId) => {
      return state.interviews.filter(interview => interview.candidate_id == candidateId)
    }
  },

  actions: {
    // 获取所有面试记录
    async fetchInterviews() {
      this.loading = true
      try {
        const response = await interviewApi.getInterviews()
        this.interviews = response.data || response
        return response
      } catch (error) {
        console.error('获取面试记录失败:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    // 根据ID获取面试记录
    async fetchInterviewById(id) {
      this.loading = true
      try {
        const response = await interviewApi.getInterview(id)
        this.currentInterview = response.data || response
        return response
      } catch (error) {
        console.error(`获取面试记录 ${id} 失败:`, error)
        throw error
      } finally {
        this.loading = false
      }
    },

    // 根据候选人ID获取面试记录
    async fetchInterviewsByCandidateId(candidateId) {
      this.loading = true
      try {
        const response = await interviewApi.getInterviewsByCandidateId(candidateId)
        // 只返回当前候选人的面试记录，不存储到全局状态
        return response.data || response
      } catch (error) {
        console.error(`获取候选人 ${candidateId} 的面试记录失败:`, error)
        throw error
      } finally {
        this.loading = false
      }
    },

    // 创建面试记录
    async createInterview(data) {
      try {
        const response = await interviewApi.createInterview(data)
        const newInterview = response.data || response
        
        // 如果是完整对象则添加到列表
        if (newInterview.id) {
          this.interviews.push(newInterview)
        }
        
        return response
      } catch (error) {
        console.error('创建面试记录失败:', error)
        throw error
      }
    },

    // 更新面试记录
    async updateInterview(id, data) {
      try {
        const response = await interviewApi.updateInterview(id, data)
        const updatedInterview = response.data || response
        
        // 更新列表中的面试记录
        const index = this.interviews.findIndex(item => item.id == id)
        if (index !== -1) {
          this.interviews[index] = updatedInterview
        }
        
        // 如果当前面试记录是正在更新的记录，则也更新当前记录
        if (this.currentInterview && this.currentInterview.id == id) {
          this.currentInterview = updatedInterview
        }
        
        return response
      } catch (error) {
        console.error(`更新面试记录 ${id} 失败:`, error)
        throw error
      }
    },

    // 删除面试记录
    async deleteInterview(id) {
      try {
        const response = await interviewApi.deleteInterview(id)
        
        // 从列表中移除
        const index = this.interviews.findIndex(item => item.id == id)
        if (index !== -1) {
          this.interviews.splice(index, 1)
        }
        
        // 如果当前面试记录是正在删除的记录，则清空
        if (this.currentInterview && this.currentInterview.id == id) {
          this.currentInterview = null
        }
        
        return response
      } catch (error) {
        console.error(`删除面试记录 ${id} 失败:`, error)
        throw error
      }
    }
  }
})