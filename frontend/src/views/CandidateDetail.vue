<template>
  <div class="candidate-detail-container" v-loading="loading">
    <el-page-header @back="goBack" content="候选人详情" class="page-header" />
    
    <el-card v-if="candidate" class="candidate-info">
      <template #header>
        <div class="candidate-header">
          <div class="candidate-basic">
            <h2>{{ candidate.name }}</h2>
            <el-tag :type="getInterviewStageType(candidate.process)" class="stage-tag">
              {{ getInterviewStageText(candidate.process) }}
            </el-tag>
            <el-tag :type="getStatusTagType(candidate.status)" class="status-tag">
              {{ candidate.statusText }}
            </el-tag>
          </div>
          <div class="candidate-actions">
            <el-button @click="handleEdit">编辑</el-button>
            <el-button type="primary" @click="handleScheduleInterview">安排面试</el-button>
          </div>
        </div>
      </template>
      
      <el-row :gutter="20">
        <el-col :span="12">
          <el-descriptions title="基本信息" :column="1" border>
            <el-descriptions-item label="姓名">{{ candidate.name }}</el-descriptions-item>
            <el-descriptions-item label="应聘职位">{{ candidate.position }}</el-descriptions-item>
            <el-descriptions-item label="联系电话">{{ candidate.phone }}</el-descriptions-item>
            <el-descriptions-item label="邮箱">{{ candidate.email }}</el-descriptions-item>
            <el-descriptions-item label="来源">{{ candidate.source }}</el-descriptions-item>
          </el-descriptions>
        </el-col>
        
        <el-col :span="12">
          <el-descriptions title="求职信息" :column="1" border>
            <el-descriptions-item label="所属资金">
              <el-tag>{{ candidate.fundPlatform }}</el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="资金ID">{{ candidate.fundId }}</el-descriptions-item>
            <el-descriptions-item label="学历">{{ candidate.education }}</el-descriptions-item>
            <el-descriptions-item label="工作经验">{{ candidate.experience }}</el-descriptions-item>
            <el-descriptions-item label="期望薪资">{{ candidate.expectedSalary }}</el-descriptions-item>
            <el-descriptions-item label="投递日期">{{ candidate.date }}</el-descriptions-item>
          </el-descriptions>
        </el-col>
      </el-row>
      
      <el-row :gutter="20" style="margin-top: 20px;">
        <el-col :span="24">
          <el-descriptions title="综合评价" :column="1" border>
            <el-descriptions-item label="评分">
              <el-rate
                v-model="candidate.rating"
                disabled
                show-score
                text-color="#ff9900"
                score-template="{value}分"
              />
            </el-descriptions-item>
            <el-descriptions-item label="面试官笔记">
              <div class="notes">
                <p>候选人技术基础扎实，对前端框架有深入理解，项目经验丰富。</p>
                <p>沟通能力良好，团队合作意识强。</p>
                <p>期望薪资略高于市场平均水平，但能力匹配。</p>
              </div>
            </el-descriptions-item>
          </el-descriptions>
        </el-col>
      </el-row>
    </el-card>
    
    <!-- 面试记录 -->
    <el-card class="interview-records">
      <template #header>
        <div class="card-header">
          <span>面试记录</span>
        </div>
      </template>
      
      <el-timeline>
        <el-timeline-item
          v-for="(activity, index) in interviewActivities"
          :key="index"
          :timestamp="activity.timestamp"
          placement="top"
          :color="activity.color"
        >
          <el-card :body-style="{ padding: '10px 15px' }">
            <h4>{{ activity.content }}</h4>
            <p>{{ activity.timestamp }}</p>
          </el-card>
        </el-timeline-item>
      </el-timeline>
      
      <!-- 面试状态操作 -->
      <div class="interview-status-actions">
        <h3>面试状态操作</h3>
        <div class="status-buttons">
          <el-button 
            v-for="status in interviewStatusOptions" 
            :key="status.value"
            :type="candidate && candidate.interviewStatus === status.value ? 'primary' : 'info'"
            @click="updateInterviewStatus(status.value)"
            plain
          >
            {{ status.label }}
          </el-button>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useCandidateStore } from '@/stores/candidate'
import { useFundStore } from '@/stores/fund'

const route = useRoute()
const router = useRouter()
const candidateStore = useCandidateStore()
const fundStore = useFundStore()

const loading = ref(false)
const dialogVisible = ref(false)
const formRef = ref()

const interviewStages = ref([
  { value: 'invite', label: '邀约' },
  { value: 'first-interview', label: '一面' },
  { value: 'second-interview', label: '二面' },
  { value: 'offer', label: 'Offer' },
  { value: 'entry', label: '入职' }
])

// 面试状态选项
const interviewStatusOptions = ref([
  { value: 'pending', label: '待约' },
  { value: 'unconfirmed', label: '未确认' },
  { value: 'confirmed', label: '已确认' },
  { value: 'completed', label: '已完成' },
  { value: 'rejected', label: '已拒' }
])

// 获取面试阶段文本
const getInterviewStageText = (stage) => {
  const stageMap = {
    'invite': '邀约',
    'first-interview': '一面',
    'second-interview': '二面',
    'offer': 'Offer',
    'entry': '入职'
  }
  return stageMap[stage] || '邀约'
}

// 获取面试阶段标签类型
const getInterviewStageType = (stage) => {
  const typeMap = {
    'invite': 'info',
    'first-interview': 'warning',
    'second-interview': 'primary',
    'offer': 'success',
    'entry': 'success'
  }
  return typeMap[stage] || 'info'
}

// 获取面试活动记录
const interviewActivities = ref([
  {
    content: 'HR初试',
    timestamp: '2023-05-01',
    color: '#0bbd87'
  },
  {
    content: '技术面试',
    timestamp: '2023-05-03',
    color: '#0bbd87'
  },
  {
    content: '部门复试',
    timestamp: '2023-05-05',
    color: '#409eff'
  }
])

// 获取状态标签类型
const getStatusTagType = (status) => {
  const typeMap = {
    pending: 'info',
    unconfirmed: 'warning',
    confirmed: 'warning',
    completed: 'primary',
    rejected: 'danger',
    passed: 'success'
  }
  return typeMap[status] || 'info'
}

const candidate = computed(() => candidateStore.currentCandidate)

const funds = computed(() => fundStore.funds)

const form = reactive({
  id: undefined,
  fundId: '',
  name: '',
  position: '',
  phone: '',
  email: '',
  source: '',
  education: '',
  experience: '',
  expectedSalary: '',
  interviewStage: 'invite',
  interviewStatus: 'pending'
})

const rules = {
  fundId: [{ required: true, message: '请选择资金来源', trigger: 'change' }],
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  position: [{ required: true, message: '请输入应聘职位', trigger: 'blur' }],
  phone: [{ required: true, message: '请输入联系电话', trigger: 'blur' }]
}

const interviewRecords = ref([
  {
    date: '2025-12-01',
    title: '初试',
    description: '候选人表现良好，技术基础扎实',
    interviewer: '面试官A'
  },
  {
    date: '2025-12-03',
    title: '复试',
    description: '深入技术讨论，解决问题能力强',
    interviewer: '面试官B'
  }
])

// 返回上一页
const goBack = () => {
  router.go(-1)
}

// 处理编辑
const handleEdit = () => {
  if (candidate.value) {
    Object.assign(form, candidate.value)
    dialogVisible.value = true
  }
}

// 处理删除
const handleDelete = () => {
  ElMessageBox.confirm(
    `确定要删除候选人"${candidate.value?.name}"吗？`,
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    const index = candidateStore.candidates.findIndex(c => c.id === candidate.value.id)
    if (index !== -1) {
      candidateStore.candidates.splice(index, 1)
      ElMessage.success('删除成功')
      router.go(-1)
    }
  }).catch(() => {
    // 取消删除
  })
}

// 安排面试
const handleScheduleInterview = () => {
  if (candidate.value) {
    router.push(`/candidate/schedule/${candidate.value.id}`)
  }
}

// 更新面试状态
const updateInterviewStatus = async (status) => {
  if (!candidate.value) return;
  
  try {
    const updatedData = {
      ...candidate.value,
      interviewStatus: status
    };
    
    await candidateStore.updateCandidate(candidate.value.id, updatedData);
    ElMessage.success('面试状态更新成功');
  } catch (error) {
    ElMessage.error('更新面试状态失败');
  }
}

// 添加面试记录
const handleAddInterview = () => {
  ElMessage.info('添加面试记录功能待实现')
}

// 提交表单
const submitForm = () => {
  formRef.value.validate((valid) => {
    if (valid) {
      if (form.id) {
        // 编辑候选人
        const index = candidateStore.candidates.findIndex(c => c.id === form.id)
        if (index !== -1) {
          candidateStore.candidates[index] = { ...form }
          candidateStore.setCurrentCandidate({ ...form })
        }
        ElMessage.success('编辑成功')
      }
      dialogVisible.value = false
    }
  })
}

// 页面加载时获取候选人详情
onMounted(() => {
  const candidateId = route.params.id
  console.log('加载候选人详情，ID:', candidateId)
  
  if (candidateId) {
    // 在实际项目中，这里会调用API获取候选人详情
    const foundCandidate = candidateStore.candidates.find(c => c.id == candidateId)
    console.log('查找候选人结果:', foundCandidate)
    
    if (foundCandidate) {
      candidateStore.setCurrentCandidate(foundCandidate)
      console.log('设置当前候选人成功')
    } else {
      console.error('候选人不存在，ID:', candidateId)
      ElMessage.error('候选人不存在')
      router.push({ name: 'CandidateList' })
    }
  }
  
  // 获取资金列表
  console.log('开始获取资金列表')
  fundStore.fetchFunds()
})
</script>

<style scoped>
.candidate-detail-container {
  padding: 20px;
}

.page-header {
  margin-bottom: 20px;
}

.candidate-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.candidate-basic {
  display: flex;
  align-items: center;
  gap: 10px;
}

.candidate-basic h2 {
  margin: 0;
  font-size: 20px;
}

.stage-tag {
  height: 24px;
  line-height: 22px;
  padding: 0 10px;
}

.status-tag {
  height: 24px;
  line-height: 22px;
  padding: 0 10px;
}

.candidate-actions {
  display: flex;
  gap: 10px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.notes p {
  margin: 5px 0;
  line-height: 1.5;
}

.interview-records {
  margin-top: 20px;
}

.interview-records h4 {
  margin: 0 0 5px 0;
  font-size: 14px;
  font-weight: normal;
}

.interview-records p {
  margin: 0;
  font-size: 12px;
  color: #999;
}

.interview-status-actions {
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #eee;
}

.interview-status-actions h3 {
  margin-bottom: 15px;
}

.status-buttons {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}
</style>