import { defineStore } from 'pinia'
import { fundApi } from '@/api'
import { ElMessage } from 'element-plus'

export const useFundStore = defineStore('fund', {
  state: () => ({
    funds: [],
    loading: false
  }),

  getters: {
    getFundById: (state) => (id) => {
      return state.funds.find(fund => fund.id === id)
    },
    activeFunds: (state) => state.funds.filter(fund => fund.status === 'using'),
    usedFunds: (state) => state.funds.filter(fund => fund.status === 'used'),
    expiredFunds: (state) => state.funds.filter(fund => fund.status === 'expired')
  },

  actions: {
    async loadFunds() {
      this.loading = true
      try {
        console.log('开始加载资金数据...')
        const response = await fundApi.getFunds()
        this.funds = response.data || []
        console.log('成功加载资金数据，共', this.funds.length, '条记录')
      } catch (error) {
        console.error('获取资金列表失败:', error)
        console.error('错误详情:', {
          message: error.message,
          code: error.code,
          stack: error.stack
        })
        ElMessage.error('获取资金列表失败: ' + error.message)
        throw error
      } finally {
        this.loading = false
      }
    },

    async fetchFunds() {
      console.log('开始获取资金数据...')
      try {
        await this.loadFunds()
        console.log('资金数据获取完成')
      } catch (error) {
        console.error('获取资金数据失败:', error)
        ElMessage.error('获取资金数据失败')
        throw error
      }
    },

    async createFund(fundData) {
      try {
        console.log('开始创建资金记录...', fundData)
        const response = await fundApi.createFund(fundData) // 修复方法调用
        const newFund = response.data
        
        // 更新本地状态
        this.funds.push(newFund)
        
        console.log('成功创建资金记录:', newFund)
        ElMessage.success('创建资金记录成功')
        return newFund
      } catch (error) {
        console.error('创建资金记录失败:', error)
        console.error('错误详情:', {
          message: error.message,
          code: error.code,
          stack: error.stack,
          data: fundData
        })
        ElMessage.error('创建资金记录失败: ' + error.message)
        throw error
      }
    },

    async updateFund(fundData) {
      try {
        console.log('开始更新资金记录...', fundData)
        const response = await fundApi.updateFund(fundData.id, fundData) // 修复方法调用
        const updatedFund = response.data
        
        // 更新本地状态
        const index = this.funds.findIndex(fund => fund.id === fundData.id)
        if (index !== -1) {
          this.funds.splice(index, 1, updatedFund)
        }
        
        console.log('成功更新资金记录:', updatedFund)
        ElMessage.success('更新资金记录成功')
        return updatedFund
      } catch (error) {
        console.error('更新资金记录失败:', error)
        console.error('错误详情:', {
          message: error.message,
          code: error.code,
          stack: error.stack,
          id: fundData.id,
          data: fundData
        })
        ElMessage.error('更新资金记录失败: ' + error.message)
        throw error
      }
    },

    async deleteFund(id) {
      try {
        console.log('开始删除资金记录...', id)
        await fundApi.deleteFund(id) // 修复方法调用
        
        // 更新本地状态
        const index = this.funds.findIndex(fund => fund.id === id)
        if (index !== -1) {
          this.funds.splice(index, 1)
        }
        
        console.log('成功删除资金记录:', id)
        ElMessage.success('删除资金记录成功')
      } catch (error) {
        console.error('删除资金记录失败:', error)
        console.error('错误详情:', {
          message: error.message,
          code: error.code,
          stack: error.stack,
          id: id
        })
        ElMessage.error('删除资金记录失败: ' + error.message)
        throw error
      }
    }
  }
})