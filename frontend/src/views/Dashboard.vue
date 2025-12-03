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
            <p class="stat-number">¥{{ totalAmount }}</p>
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
          <div class="chart-container">
            <div class="placeholder-chart">
              [资金分布图表占位]
              <p>前程无忧: 30%</p>
              <p>智联招聘: 20%</p>
              <p>Boss直聘: 25%</p>
              <p>猎聘网: 15%</p>
              <p>其他: 10%</p>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <span>候选人状态</span>
            </div>
          </template>
          <div class="chart-container">
            <div class="placeholder-chart">
              [候选人状态图表占位]
              <p>邀约: {{ candidateStats.invite }}</p>
              <p>一面: {{ candidateStats.firstInterview }}</p>
              <p>二面: {{ candidateStats.secondInterview }}</p>
              <p>Offer: {{ candidateStats.offer }}</p>
              <p>入职: {{ candidateStats.entry }}</p>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useFundStore } from '@/stores/fund'
import { useCandidateStore } from '@/stores/candidate'

const router = useRouter()
const userStore = useUserStore()
const fundStore = useFundStore()
const candidateStore = useCandidateStore()

// 当前日期
const currentDate = new Date().toLocaleDateString('zh-CN', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  weekday: 'long'
})

// 加载状态
const loading = ref(false)

// 获取资金列表
const funds = computed(() => fundStore.funds)

// 获取活跃资金
const activeFunds = computed(() => fundStore.activeFunds)

// 获取候选人列表
const candidates = computed(() => candidateStore.candidates)

// 获取待处理候选人
const pendingCandidates = computed(() => {
  return candidateStore.candidates.filter(candidate => candidate.status === 'pending')
})

// 候选人状态统计
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

// 总金额计算
const totalAmount = computed(() => {
  return fundStore.funds.reduce((total, fund) => total + fund.amount, 0)
})

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
  loadData()
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
  margin: 10px 0;
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

.charts-row {
  margin-bottom: 20px;
}

.chart-card {
  height: 300px;
}

.fund-card, .candidate-card {
  margin-top: 20px;
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