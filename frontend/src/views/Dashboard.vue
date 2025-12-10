<template>
  <div class="dashboard-container">
    <el-card class="welcome-card">
      <template #header>
        <div class="welcome-header">
          <div class="welcome-title">
            <h2>欢迎使用招聘管理系统</h2>
          </div>
          <div class="welcome-actions">
            <el-button type="primary" @click="handleEditProfile" size="small">
              编辑个人信息
            </el-button>
          </div>
        </div>
      </template>
      <div class="welcome-content">
        <p>当前用户：{{ userStore.userName }}</p>
        <p>今天是：{{ currentDate }}</p>
      </div>
    </el-card>

    <el-row :gutter="20" class="stats-row">
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <h3>总资金</h3>
            <p class="stat-number">{{ formatCurrency(totalAmount) }}</p>
            <p class="stat-desc">所有招聘平台资金总和</p>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <h3>活跃资金</h3>
            <p class="stat-number">{{ activeFunds.length }}</p>
            <p class="stat-desc">当前正在使用的资金</p>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <h3>候选人</h3>
            <p class="stat-number">{{ candidates.length }}</p>
            <p class="stat-desc">所有候选人数量</p>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <h3>待处理</h3>
            <p class="stat-number">{{ pendingCandidates.length }}</p>
            <p class="stat-desc">待处理的候选人</p>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20">
      <el-col :span="12">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <span>资金分布</span>
            </div>
          </template>
          <div class="chart-container" ref="fundChartRef" style="width: 100%; height: 300px;"></div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <span>候选人状态</span>
            </div>
          </template>
          <div class="chart-container" ref="candidateChartRef" style="width: 100%; height: 300px;"></div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useFundStore } from '@/stores/fund'
import { useCandidateStore } from '@/stores/candidate'
import * as echarts from 'echarts'

// 路由
const router = useRouter()

// Store
const userStore = useUserStore()
const fundStore = useFundStore()
const candidateStore = useCandidateStore()

// 图表引用
const fundChartRef = ref(null)
const candidateChartRef = ref(null)

// 图表实例
let fundChart = null
let candidateChart = null

// 响应式数据
const loading = ref(false)
const currentDate = ref(new Date().toLocaleDateString('zh-CN', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  weekday: 'long'
}))

// 计算属性
const candidates = computed(() => candidateStore.candidates)

const pendingCandidates = computed(() => {
  return candidateStore.candidates.filter(candidate => 
    candidate.status === 'pending' || !candidate.status
  )
})

const activeFunds = computed(() => {
  return fundStore.funds.filter(fund => fund.status === 'using')
})

// 修复总金额计算，确保只计算数值类型
const totalAmount = computed(() => {
  return fundStore.funds.reduce((total, fund) => {
    const amount = parseFloat(fund.amount) || 0
    return total + amount
  }, 0)
})

const candidateStats = computed(() => {
  const stats = {
    invite: 0,
    firstInterview: 0,
    secondInterview: 0,
    offer: 0,
    entry: 0
  }
  
  candidateStore.candidates.forEach(candidate => {
    switch (candidate.process) {
      case 'invite':
        stats.invite++
        break
      case 'first-interview':
        stats.firstInterview++
        break
      case 'second-interview':
        stats.secondInterview++
        break
      case 'offer':
        stats.offer++
        break
      case 'entry':
        stats.entry++
        break
    }
  })
  
  return stats
})

// 格式化货币显示
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency: 'CNY',
    minimumFractionDigits: 2
  }).format(amount)
}

// 初始化资金分布图表
const initFundChart = () => {
  if (fundChartRef.value) {
    fundChart = echarts.init(fundChartRef.value)
    
    // 统计各平台资金分布
    const platformMap = {}
    fundStore.funds.forEach(fund => {
      const platform = fund.platform || '未知平台'
      const amount = parseFloat(fund.amount) || 0
      platformMap[platform] = (platformMap[platform] || 0) + amount
    })
    
    const platforms = Object.keys(platformMap)
    const amounts = Object.values(platformMap)
    
    const option = {
      tooltip: {
        trigger: 'item',
        formatter: '{a} <br/>{b}: {c} ({d}%)'
      },
      legend: {
        orient: 'vertical',
        left: 'left'
      },
      series: [
        {
          name: '资金分布',
          type: 'pie',
          radius: '50%',
          data: platforms.map((platform, index) => ({
            value: amounts[index],
            name: platform
          })),
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          }
        }
      ]
    }
    
    fundChart.setOption(option)
  }
}

// 初始化候选人状态图表
const initCandidateChart = () => {
  if (candidateChartRef.value) {
    candidateChart = echarts.init(candidateChartRef.value)
    
    const stats = candidateStats.value
    const categories = ['邀约', '一面', '二面', 'Offer', '入职']
    const values = [
      stats.invite,
      stats.firstInterview,
      stats.secondInterview,
      stats.offer,
      stats.entry
    ]
    
    const option = {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        }
      },
      xAxis: {
        type: 'category',
        data: categories
      },
      yAxis: {
        type: 'value'
      },
      series: [
        {
          name: '候选人数量',
          type: 'bar',
          data: values,
          itemStyle: {
            color: '#409EFF'
          }
        }
      ]
    }
    
    candidateChart.setOption(option)
  }
}

// 加载数据
const loadData = async () => {
  try {
    loading.value = true
    await Promise.all([
      fundStore.fetchFunds(),
      candidateStore.fetchCandidates()
    ])
  } catch (error) {
    console.error('加载数据失败:', error)
  } finally {
    loading.value = false
  }
}

// 页面加载时获取数据
onMounted(() => {
  loadData().then(() => {
    nextTick(() => {
      initFundChart()
      initCandidateChart()
    })
  })
})

// 监听数据变化，更新图表
watch([() => fundStore.funds, () => candidateStore.candidates], () => {
  nextTick(() => {
    if (fundChart) {
      fundChart.dispose()
      initFundChart()
    }
    
    if (candidateChart) {
      candidateChart.dispose()
      initCandidateChart()
    }
  })
})

// 编辑个人信息
const handleEditProfile = () => {
  router.push({ name: 'ProfileEdit' })
}
</script>

<style scoped>
.dashboard-container {
  background-color: #f5f5f5;
  min-height: calc(100vh - 84px);
  padding: 20px;
}

.welcome-card {
  margin-bottom: 20px;
}

.welcome-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.welcome-title h2 {
  margin: 0;
  color: #333;
}

.welcome-content p {
  margin: 5px 0;
  color: #666;
}

.stats-row {
  margin-bottom: 20px;
}

.stat-card {
  text-align: center;
}

.stat-content h3 {
  margin: 0 0 10px 0;
  color: #666;
  font-size: 16px;
}

.stat-number {
  margin: 0;
  font-size: 24px;
  font-weight: bold;
  color: #409eff;
}

.stat-desc {
  margin: 5px 0 0 0;
  color: #999;
  font-size: 12px;
}

.chart-card {
  height: 350px;
}

.chart-container {
  width: 100%;
  height: calc(100% - 20px);
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}
</style>