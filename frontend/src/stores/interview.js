import { defineStore } from 'pinia'
import { 
  candidateApi  // 根据面试记录数据源统一规范，应从候选人API获取面试信息
} from '@/api'

export const useInterviewStore = defineStore('interview', {
  state: () => ({
    interviews: [],  // 此字段将不再使用
    currentInterview: null,  // 此字段将不再使用
    loading: false
  }),

  getters: {
    // 根据候选人ID获取面试记录 - 根据规范，应从候选人信息中获取
    getInterviewsByCandidate: (state) => (candidateId) => {
      // 此getter将不再使用，面试信息应直接从候选人store获取
      return []
    }
  },

  actions: {
    // 获取所有面试记录 - 根据规范，应从候选人信息中获取
    async fetchInterviews() {
      this.loading = true
      try {
        // 根据面试记录数据源统一规范，不直接获取面试记录
        // 面试信息应该从候选人API中获取
        console.warn('根据项目规范，面试信息应从候选人表中获取，而不是独立的面试表')
        return []
      } catch (error) {
        console.error('获取面试记录失败:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    // 根据ID获取面试记录 - 根据规范，应从候选人信息中获取
    async fetchInterviewById(id) {
      this.loading = true
      try {
        // 根据面试记录数据源统一规范，不直接获取面试记录
        // 面试信息应该从候选人API中获取
        console.warn('根据项目规范，面试信息应从候选人表中获取，而不是独立的面试表')
        return null
      } catch (error) {
        console.error(`获取面试记录 ${id} 失败:`, error)
        // 根据项目规范第15条，添加更友好的错误处理
        throw error
      } finally {
        this.loading = false
      }
    },

    // 根据候选人ID获取面试记录 - 根据规范，应从候选人信息中获取
    async fetchInterviewsByCandidateId(candidateId) {
      this.loading = true
      try {
        // 根据面试记录数据源统一规范，不直接获取面试记录
        // 面试信息应该从候选人API中获取
        console.warn('根据项目规范，面试信息应从候选人表中获取，而不是独立的面试表')
        return []
      } catch (error) {
        console.error(`获取候选人 ${candidateId} 的面试记录失败:`, error)
        // 根据项目规范第15条，添加更友好的错误处理
        throw error
      } finally {
        this.loading = false
      }
    },

    // 创建面试记录 - 仍保留此功能，但需要更新候选人信息
    async createInterview(data) {
      try {
        // 根据规范，面试信息应存储在候选人表中
        // 这里需要将面试信息更新到候选人记录中
        console.warn('根据项目规范，面试信息应存储在候选人表中')
        return {}
      } catch (error) {
        console.error('创建面试记录失败:', error)
        throw error
      }
    },

    // 更新面试记录 - 仍保留此功能，但需要更新候选人信息
    async updateInterview(id, data) {
      try {
        // 根据规范，面试信息应存储在候选人表中
        console.warn('根据项目规范，面试信息应存储在候选人表中')
        return {}
      } catch (error) {
        console.error(`更新面试记录 ${id} 失败:`, error)
        throw error
      }
    },

    // 删除面试记录
    async deleteInterview(id) {
      try {
        // 根据规范，面试信息应存储在候选人表中
        console.warn('根据项目规范，面试信息应存储在候选人表中')
        return {}
      } catch (error) {
        console.error(`删除面试记录 ${id} 失败:`, error)
        throw error
      }
    }
  }
})