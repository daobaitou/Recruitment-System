<template>
  <div class="fund-detail-container">
    <el-page-header 
      title="返回" 
      content="资金详情" 
      @back="goBack"
      class="page-header"
    />
    
    <!-- 合并后的资金信息和候选人统计（上下布局） -->
    <el-card class="combined-info-card" v-if="currentFund">
      <!-- 资金基本信息 -->
      <div class="section-header">资金信息</div>
      <el-row :gutter="30" class="info-section">
        <el-col :span="4" class="info-item">
          <div class="info-label">资金名称</div>
          <div class="info-value">{{ currentFund.name }}</div>
        </el-col>
        <el-col :span="4" class="info-item">
          <div class="info-label">平台</div>
          <div class="info-value">{{ currentFund.platform }}</div>
        </el-col>
        <el-col :span="4" class="info-item">
          <div class="info-label">招聘岗位</div>
          <div class="info-value">{{ currentFund.position }}</div>
        </el-col>
        <el-col :span="4" class="info-item">
          <div class="info-label">充值人</div>
          <div class="info-value">{{ currentFund.rechargeByName }}</div>
        </el-col>
        <el-col :span="4" class="info-item">
          <div class="info-label">金额</div>
          <div class="info-value amount-highlight">¥{{ currentFund.amount }}</div>
        </el-col>
        <el-col :span="4" class="info-item">
          <div class="info-label">日期</div>
          <div class="info-value">{{ currentFund.date }}</div>
        </el-col>
        <el-col :span="4" class="info-item">
          <div class="info-label">状态</div>
          <div class="info-value">
            <el-tag :type="getStatusTagType(currentFund.status)" size="small">
              {{ getStatusText(currentFund.status) }}
            </el-tag>
          </div>
        </el-col>
      </el-row>
      
      <!-- 候选人统计信息 -->
      <div class="section-header" style="margin-top: 20px;">候选人统计</div>
      <el-row :gutter="30" class="stats-section">
        <el-col :span="4" class="stat-item">
          <div class="stat-label">总人数</div>
          <div class="stat-value">{{ getTotalCandidateCount() }}</div>
        </el-col>
        <el-col :span="4" class="stat-item">
          <div class="stat-label">邀约</div>
          <div class="stat-value">{{ getCandidateCountByStage('invite') }}</div>
        </el-col>
        <el-col :span="4" class="stat-item">
          <div class="stat-label">一面</div>
          <div class="stat-value">{{ getCandidateCountByStage('first-interview') }}</div>
        </el-col>
        <el-col :span="4" class="stat-item">
          <div class="stat-label">二面</div>
          <div class="stat-value">{{ getCandidateCountByStage('second-interview') }}</div>
        </el-col>
        <el-col :span="4" class="stat-item">
          <div class="stat-label">Offer</div>
          <div class="stat-value">{{ getCandidateCountByStage('offer') }}</div>
        </el-col>
        <el-col :span="4" class="stat-item">
          <div class="stat-label">入职</div>
          <div class="stat-value">{{ getCandidateCountByStage('entry') }}</div>
        </el-col>
      </el-row>
    </el-card>
    
    <el-container class="flex-grow">
      <!-- 左侧第一列：主菜单 -->
      <el-aside width="220px" class="sidebar">
        <el-menu
          :default-active="activeMenu"
          class="sidebar-menu enlarged-menu"
          @select="handleMenuSelect"
        >
          <el-menu-item index="process" class="menu-item-large">
            <el-icon><Collection /></el-icon>
            <span>面试流程</span>
          </el-menu-item>
          <el-menu-item index="statistics" class="menu-item-large">
            <el-icon><PieChart /></el-icon>
            <span>人才流转统计</span>
          </el-menu-item>
        </el-menu>
      </el-aside>
      
      <!-- 左侧第二列：子菜单 -->
      <el-aside width="220px" class="sub-sidebar" v-if="activeMenu === 'process'">
        <el-menu
          :default-active="activeSubProcess"
          class="sub-sidebar-menu enlarged-menu"
          @select="handleSubProcessSelect"
        >
          <el-menu-item index="invite" class="menu-item-large">
            <span>邀约</span>
            <span class="menu-count">{{ getCandidateCountByStage('invite') }}</span>
          </el-menu-item>
          <el-menu-item index="first-interview" class="menu-item-large">
            <span>一面</span>
            <span class="menu-count">{{ getCandidateCountByStage('first-interview') }}</span>
          </el-menu-item>
          <el-menu-item index="second-interview" class="menu-item-large">
            <span>二面</span>
            <span class="menu-count">{{ getCandidateCountByStage('second-interview') }}</span>
          </el-menu-item>
          <el-menu-item index="offer" class="menu-item-large">
            <span>Offer</span>
            <span class="menu-count">{{ getCandidateCountByStage('offer') }}</span>
          </el-menu-item>
          <el-menu-item index="entry" class="menu-item-large">
            <span>入职</span>
            <span class="menu-count">{{ getCandidateCountByStage('entry') }}</span>
          </el-menu-item>
        </el-menu>
      </el-aside>
      
      <!-- 统计子菜单 -->
      <el-aside width="220px" class="sub-sidebar" v-else-if="activeMenu === 'statistics'">
        <el-menu
          :default-active="activeSubStatistics"
          class="sub-sidebar-menu enlarged-menu"
          @select="handleSubStatisticsSelect"
        >
          <el-menu-item index="abandon-reasons" class="menu-item-large">
            <span>放弃原因分析</span>
          </el-menu-item>
          <el-menu-item index="rejection-reasons" class="menu-item-large">
            <span>不通过原因分析</span>
          </el-menu-item>
          <el-menu-item index="success-rate" class="menu-item-large">
            <span>成功率统计</span>
          </el-menu-item>
        </el-menu>
      </el-aside>
      
      <!-- 主内容区域 -->
      <el-main class="main-content expanded-content" v-loading="loading">
        <!-- 面试流程内容 -->
        <div v-if="activeMenu === 'process'">
          <h2 class="section-title">{{ currentProcessName }}候选人 ({{ getProcessCount(activeSubProcess) }}人)</h2>
          <div class="candidates-grid enlarged-grid">
            <div 
              v-for="candidate in filteredCandidates" 
              :key="candidate.id"
              class="candidate-card enlarged-card"
              @click="viewCandidateDetail(candidate)"
            >
              <div class="candidate-avatar">
                <el-avatar :size="60">{{ candidate.name.charAt(0) }}</el-avatar>
              </div>
              <div class="candidate-info">
                <div class="candidate-name large-text">{{ candidate.name }}</div>
                <div class="candidate-position">{{ candidate.position }}</div>
                <div class="candidate-date">{{ candidate.date }}</div>
                <div class="candidate-status" :class="candidate.status">
                  {{ candidate.statusText }}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 人才流转统计内容 -->
        <div v-else-if="activeMenu === 'statistics'">
          <div v-if="activeSubStatistics === 'abandon-reasons'">
            <h2 class="section-title">候选人放弃原因分析</h2>
            <div class="chart-container enlarged-chart">
              <div class="placeholder-chart enlarged-placeholder">
                [放弃原因词云图占位]
                <p>薪资待遇不满意 - 15人</p>
                <p>公司规模较小 - 8人</p>
                <p>工作地点偏远 - 5人</p>
                <p>行业前景不明 - 3人</p>
              </div>
            </div>
          </div>
          
          <div v-else-if="activeSubStatistics === 'rejection-reasons'">
            <h2 class="section-title">面试不通过原因分析</h2>
            <div class="chart-container enlarged-chart">
              <div class="placeholder-chart enlarged-placeholder">
                [不通过原因词云图占位]
                <p>技术能力不足 - 12人</p>
                <p>沟通表达能力差 - 7人</p>
                <p>项目经验不足 - 6人</p>
                <p>专业知识欠缺 - 4人</p>
              </div>
            </div>
          </div>
          
          <div v-else-if="activeSubStatistics === 'success-rate'">
            <h2 class="section-title">面试成功率统计</h2>
            <div class="chart-container enlarged-chart">
              <div class="placeholder-chart enlarged-placeholder">
                [面试成功率趋势图占位]
                <p>邀约成功率: 75%</p>
                <p>一面通过率: 60%</p>
                <p>二面通过率: 70%</p>
                <p>总体成功率: 35%</p>
              </div>
            </div>
          </div>
        </div>
      </el-main>
    </el-container>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Collection, PieChart } from '@element-plus/icons-vue'
import { useFundStore } from '@/stores/fund'
import { useCandidateStore } from '@/stores/candidate'

const route = useRoute()
const router = useRouter()
const fundStore = useFundStore()
const candidateStore = useCandidateStore()

// 加载状态
const loading = ref(false)

// 抽屉可见性
const drawerVisible = ref(false)

// 模拟资金详情数据
const fundId = route.params.id

// 当前激活的主菜单
const activeMenu = ref('process')

// 当前激活的子流程
const activeSubProcess = ref('invite')

// 当前激活的统计子菜单
const activeSubStatistics = ref('abandon-reasons')

// 获取当前资金信息
const currentFund = computed(() => {
  const id = Number(route.params.id)
  return fundStore.funds.find(fund => fund.id === id) || null
})

// 日期格式化函数
const formatDate = (date) => {
  if (!date) return '无'
  // 如果是日期字符串，直接返回
  if (typeof date === 'string') {
    // 如果是 YYYY-MM-DD 格式，直接返回
    if (date.match(/^\d{4}-\d{2}-\d{2}/)) {
      return date
    }
    // 如果是 ISO 格式，转换为 YYYY-MM-DD
    if (date.includes('T')) {
      return date.split('T')[0]
    }
    return date
  }
  // 如果是日期对象，格式化为 YYYY-MM-DD
  if (date instanceof Date) {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }
  return '无'
}

// 根据阶段获取候选人数量
const getCandidateCountByStage = (stage) => {
  if (!currentFund.value) return 0;
  
  const fundIdNum = Number(fundId);
  return candidateStore.candidates.filter(candidate => {
    return Number(candidate.fundId) === fundIdNum && candidate.process === stage
  }).length;
}

// 获取总候选人数量
const getTotalCandidateCount = () => {
  const fundIdNum = Number(fundId);
  return candidateStore.candidates.filter(candidate => 
    Number(candidate.fundId) === fundIdNum
  ).length;
};

// 当前流程名称映射
const processNameMap = {
  invite: '邀约',
  'first-interview': '一面',
  'second-interview': '二面',
  offer: 'Offer',
  entry: '入职'
}

// 获取当前流程名称
const currentProcessName = computed(() => {
  return processNameMap[activeSubProcess.value] || '邀约'
})

// 当前流程
const currentProcess = computed(() => {
  return activeSubProcess.value
})

// 获取候选人列表
const candidates = computed(() => candidateStore.candidates)

// 获取指定流程的候选人数量
const getProcessCount = (process) => {
  if (!currentFund.value) return 0;
  
  const fundIdNum = Number(fundId);
  return candidateStore.candidates.filter(candidate => {
    return Number(candidate.fundId) === fundIdNum && candidate.process === process
  }).length;
}

// 根据当前流程过滤候选人
const filteredCandidates = computed(() => {
  if (!currentFund.value) return [];
  
  const fundIdNum = Number(fundId);
  return candidates.value.filter(candidate => {
    return Number(candidate.fundId) === fundIdNum && candidate.process === activeSubProcess.value
  })
})

// 获取状态标签类型
const getStatusTagType = (status) => {
  switch (status) {
    case 'unused': return 'info'
    case 'using': return 'primary'
    case 'used': return 'success'
    case 'expired': return 'danger'
    default: return 'info'
  }
}

// 获取状态文本
const getStatusText = (status) => {
  switch (status) {
    case 'unused': return '未使用'
    case 'using': return '使用中'
    case 'used': return '已用完'
    case 'expired': return '已过期'
    default: return '未知'
  }
}

// 菜单选择处理
const handleMenuSelect = (index) => {
  activeMenu.value = index
}

// 子流程选择处理
const handleSubProcessSelect = (index) => {
  activeSubProcess.value = index
}

// 统计子菜单选择处理
const handleSubStatisticsSelect = (index) => {
  activeSubStatistics.value = index
}

// 返回上一页
const goBack = () => {
  router.push({ name: 'FundList' })
}

// 查看候选人详情
const viewCandidateDetail = (candidate) => {
  candidateStore.setCurrentCandidate(candidate)
  router.push(`/candidate/detail/${candidate.id}`)
}

// 页面加载时获取数据
onMounted(async () => {
  const fundId = Number(route.params.id)
  if (fundId) {
    try {
      loading.value = true
      await Promise.all([
        fundStore.loadFunds(),
        candidateStore.fetchCandidates()
      ])
    } catch (error) {
      console.error('获取数据失败:', error)
    } finally {
      loading.value = false
    }
  }
})

// 加载候选人数据
const loadCandidates = async () => {
  try {
    loading.value = true
    await candidateStore.fetchCandidates()
  } catch (error) {
    console.error('获取候选人列表失败:', error)
  } finally {
    loading.value = false
  }
}

// 页面加载时获取数据
onMounted(async () => {
  const fundId = Number(route.params.id)
  if (fundId) {
    try {
      loading.value = true
      await Promise.all([
        fundStore.loadFunds(),
        candidateStore.fetchCandidates()
      ])
    } catch (error) {
      console.error('获取数据失败:', error)
    } finally {
      loading.value = false
    }
  }
})
</script>

<style scoped>
.fund-detail-container.full-height {
  height: 100%;
}

.flex-grow {
  flex: 1;
  overflow: hidden;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 0;
  font-size: 24px;
  font-weight: bold;
}

.header-title {
  font-size: 24px;
  font-weight: bold;
}

.back-button {
  margin-right: 20px;
}

.combined-info-card {
  margin-bottom: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  padding: 20px;
}

.section-header {
  font-size: 18px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid #ebeef5;
}

.info-section,
.stats-section {
  width: 100%;
}

.info-item,
.stat-item {
  margin-bottom: 15px;
}

.info-label,
.stat-label {
  font-size: 14px;
  color: #909399;
  margin-bottom: 5px;
}

.info-value,
.stat-value {
  font-size: 16px;
  color: #303133;
  font-weight: 500;
}

.amount-highlight {
  font-size: 18px;
  font-weight: bold;
  color: #409eff;
}

.stats-container {
  background-color: #f5f7fa;
  border-radius: 6px;
  padding: 15px;
  height: 100%;
}

.stats-header {
  font-size: 16px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 15px;
  text-align: center;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-label {
  font-size: 14px;
  color: #606266;
  margin-bottom: 5px;
}

.stat-value {
  font-size: 18px;
  font-weight: bold;
  color: #303133;
}

.sidebar, .sub-sidebar {
  height: 100%;
}

.enlarged-menu {
  height: 100%;
  font-size: 16px;
}

.harmonious-badge {
  position: absolute;
  right: 20px;
  top: 50%;
  transform: translateY(-50%);
  background-color: #ecf5ff;
  color: #409eff;
  border: 1px solid #d9ecff;
  font-size: 12px;
  min-width: 18px;
  height: 18px;
  line-height: 18px;
  border-radius: 9px;
  padding: 0 5px;
}

.menu-count {
  position: absolute;
  right: 20px;
  top: 50%;
  transform: translateY(-50%);
  background-color: #f0f2f5;
  color: #606266;
  font-size: 12px;
  min-width: 18px;
  height: 18px;
  line-height: 18px;
  border-radius: 9px;
  padding: 0 6px;
  text-align: center;
}

.menu-item-large {
  font-size: 16px;
  height: 60px;
  line-height: 60px;
  position: relative;
}

.stat-badge {
  position: absolute;
  top: 50%;
  right: 20px;
  transform: translateY(-50%);
}

.main-content {
  background-color: white;
  padding: 20px;
}

.expanded-content {
  flex: 1;
  overflow-y: auto;
}

.section-title {
  font-size: 22px;
  margin-bottom: 20px;
  color: #333;
}

.candidates-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.enlarged-grid {
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 25px;
}

.candidate-card {
  border: 1px solid #ebeef5;
  border-radius: 8px;
  padding: 20px;
  display: flex;
  cursor: pointer;
  transition: all 0.3s ease;
}

.enlarged-card {
  padding: 25px;
}

.candidate-card:hover {
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.candidate-avatar {
  margin-right: 15px;
}

.candidate-info {
  flex: 1;
}

.candidate-name {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 5px;
}

.candidate-position {
  color: #666;
  margin-bottom: 5px;
}

.candidate-date {
  color: #999;
  font-size: 14px;
  margin-bottom: 10px;
}

.candidate-status {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: bold;
}

.chart-container {
  margin-top: 20px;
}

.enlarged-chart {
  margin-top: 30px;
}

.placeholder-chart {
  min-height: 300px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: #fafafa;
  border: 1px dashed #ddd;
  border-radius: 8px;
  color: #999;
  padding: 30px;
}

.enlarged-placeholder {
  min-height: 400px;
  padding: 40px;
}

.placeholder-chart p {
  margin: 10px 0;
  color: #666;
  font-size: 16px;
}

.confirmed {
  background-color: #f6ffed;
  color: #52c41a;
}

.completed {
  background-color: #fffbe6;
  color: #faad14;
}

.passed {
  background-color: #f9f0ff;
  color: #722ed1;
}

.summary-content {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  padding: 10px 0;
  font-size: 16px;
}

.summary-item span {
  color: #666;
}

.summary-item strong {
  color: #333;
  font-weight: bold;
}
</style>