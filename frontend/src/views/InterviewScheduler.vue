<template>
  <div class="interview-scheduler-container">
    <el-page-header @back="goBack" content="安排面试" class="page-header" />
    
    <el-card v-if="candidate" class="scheduler-card">
      <template #header>
        <div class="card-header">
          <span>面试安排 - {{ candidate.name }}</span>
        </div>
      </template>
      
      <el-row :gutter="20">
        <el-col :span="16">
          <el-form
            ref="scheduleFormRef"
            :model="scheduleForm"
            :rules="scheduleRules"
            label-width="120px"
            class="schedule-form"
          >
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="面试轮次" prop="round">
                  <el-select v-model="scheduleForm.round" placeholder="请选择面试轮次" style="width: 100%;">
                    <el-option
                      v-for="round in interviewRounds"
                      :key="round.value"
                      :label="round.label"
                      :value="round.value"
                    />
                  </el-select>
                </el-form-item>
              </el-col>
              
              <el-col :span="12">
                <el-form-item label="面试官" prop="interviewer">
                  <el-select v-model="scheduleForm.interviewer" placeholder="请选择面试官" style="width: 100%;">
                    <el-option
                      v-for="interviewer in interviewers"
                      :key="interviewer.id"
                      :label="interviewer.name"
                      :value="interviewer.id"
                    />
                  </el-select>
                </el-form-item>
              </el-col>
              
              <el-col :span="12">
                <el-form-item label="面试日期" prop="date">
                  <el-date-picker
                    v-model="scheduleForm.date"
                    type="date"
                    placeholder="请选择面试日期"
                    style="width: 100%;"
                    value-format="YYYY-MM-DD"
                  />
                </el-form-item>
              </el-col>
              
              <el-col :span="12">
                <el-form-item label="面试时间" prop="time">
                  <el-time-select
                    v-model="scheduleForm.time"
                    start="09:00"
                    step="00:30"
                    end="18:00"
                    placeholder="请选择面试时间"
                    style="width: 100%;"
                  />
                </el-form-item>
              </el-col>
              
              <el-col :span="12">
                <el-form-item label="面试地点" prop="location">
                  <el-input v-model="scheduleForm.location" placeholder="请输入面试地点" />
                </el-form-item>
              </el-col>
              
              <el-col :span="12">
                <el-form-item label="联系方式" prop="contact">
                  <el-input v-model="scheduleForm.contact" placeholder="请输入联系方式" />
                </el-form-item>
              </el-col>
              
              <el-col :span="24">
                <el-form-item label="备注" prop="remark">
                  <el-input
                    v-model="scheduleForm.remark"
                    type="textarea"
                    :rows="3"
                    placeholder="请输入备注信息"
                  />
                </el-form-item>
              </el-col>
            </el-row>
            
            <el-form-item>
              <el-button type="primary" @click="submitSchedule">安排面试</el-button>
              <el-button @click="resetForm">重置</el-button>
            </el-form-item>
          </el-form>
        </el-col>
        
        <el-col :span="8">
          <el-card class="candidate-info-card">
            <template #header>
              <span>候选人信息</span>
            </template>
            
            <el-descriptions :column="1" size="small">
              <el-descriptions-item label="姓名">{{ candidate.name }}</el-descriptions-item>
              <el-descriptions-item label="应聘职位">{{ candidate.position }}</el-descriptions-item>
              <el-descriptions-item label="联系电话">{{ candidate.phone }}</el-descriptions-item>
              <el-descriptions-item label="邮箱">{{ candidate.email }}</el-descriptions-item>
              <el-descriptions-item label="当前阶段">
                <el-tag :type="getInterviewStageType(candidate.process)">
                  {{ getInterviewStageText(candidate.process) }}
                </el-tag>
              </el-descriptions-item>
              <el-descriptions-item label="当前状态">
                <el-tag :type="getStatusTagType(candidate.status)">
                  {{ candidate.statusText }}
                </el-tag>
              </el-descriptions-item>
            </el-descriptions>
            
            <div class="candidate-actions" style="margin-top: 20px;">
              <el-button type="primary" @click="viewCandidateDetail">查看详细信息</el-button>
            </div>
          </el-card>
          
          <el-card class="history-card" style="margin-top: 20px;">
            <template #header>
              <span>面试历史</span>
            </template>
            
            <el-timeline v-if="interviewHistory.length > 0">
              <el-timeline-item
                v-for="(history, index) in interviewHistory"
                :key="index"
                :timestamp="history.time"
                placement="top"
              >
                <el-card>
                  <h4>{{ history.round }}</h4>
                  <p>{{ history.interviewer }}</p>
                </el-card>
              </el-timeline-item>
            </el-timeline>
            
            <el-empty v-else description="暂无面试记录" />
          </el-card>
        </el-col>
      </el-row>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useCandidateStore } from '@/stores/candidate'

const route = useRoute()
const router = useRouter()
const candidateStore = useCandidateStore()

const scheduleFormRef = ref()

// 表单数据
const scheduleForm = ref({
  round: '',
  interviewer: '',
  date: '',
  time: '',
  location: '',
  contact: '',
  remark: ''
})

// 表单验证规则
const scheduleRules = {
  round: [{ required: true, message: '请选择面试轮次', trigger: 'change' }],
  interviewer: [{ required: true, message: '请选择面试官', trigger: 'change' }],
  date: [{ required: true, message: '请选择面试日期', trigger: 'change' }],
  time: [{ required: true, message: '请选择面试时间', trigger: 'change' }],
  location: [{ required: true, message: '请输入面试地点', trigger: 'blur' }]
}

// 面试轮次选项
const interviewRounds = ref([
  { value: 'first-interview', label: '一面' },
  { value: 'second-interview', label: '二面' },
  { value: 'third-interview', label: '三面' },
  { value: 'hr-interview', label: 'HR面' },
  { value: 'final-interview', label: '终面' }
])

// 面试官列表（模拟数据）
const interviewers = ref([
  { id: 1, name: '张经理' },
  { id: 2, name: '李主管' },
  { id: 3, name: '王总监' },
  { id: 4, name: '陈技术专家' }
])

// 面试历史记录（模拟数据）
const interviewHistory = ref([
  {
    round: 'HR初筛',
    interviewer: 'HR张女士',
    time: '2025-12-01 10:00'
  },
  {
    round: '技术一面',
    interviewer: '技术经理李工',
    time: '2025-12-03 14:30'
  }
])

// 获取当前候选人
const candidate = computed(() => candidateStore.currentCandidate)

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
    'invite': '',
    'first-interview': 'warning',
    'second-interview': 'primary',
    'offer': 'success',
    'entry': 'success'
  }
  return typeMap[stage] || ''
}

// 获取状态标签类型
const getStatusTagType = (status) => {
  const typeMap = {
    pending: '',
    confirmed: 'success',
    completed: 'warning',
    passed: 'success'
  }
  return typeMap[status] || ''
}

// 返回上一页
const goBack = () => {
  router.go(-1)
}

// 查看候选人详情
const viewCandidateDetail = () => {
  router.push(`/candidate/detail/${candidate.value.id}`)
}

// 提交面试安排
const submitSchedule = () => {
  scheduleFormRef.value.validate((valid) => {
    if (valid) {
      // 模拟提交数据
      console.log('提交面试安排:', scheduleForm.value)
      
      // 实际项目中这里会调用API保存面试安排
      
      ElMessage.success('面试安排成功')
      router.go(-1)
    } else {
      ElMessage.error('请填写必填项')
    }
  })
}

// 重置表单
const resetForm = () => {
  scheduleFormRef.value.resetFields()
}

// 页面加载时获取候选人详情
onMounted(() => {
  const candidateId = route.params.id || route.query.candidateId
  if (candidateId) {
    // 在实际项目中，这里会调用API获取候选人详情
    const foundCandidate = candidateStore.candidates.find(c => c.id == candidateId)
    if (foundCandidate) {
      candidateStore.setCurrentCandidate(foundCandidate)
    } else {
      ElMessage.error('候选人不存在')
      router.push('/candidate/list')
    }
  } else if (!candidateStore.currentCandidate) {
    ElMessage.warning('未指定候选人')
    router.push('/candidate/list')
  }
})
</script>

<style scoped>
.interview-scheduler-container {
  padding: 20px;
}

.page-header {
  margin-bottom: 20px;
}

.card-header {
  font-size: 18px;
  font-weight: bold;
}

.schedule-form {
  margin-top: 20px;
}

.candidate-info-card,
.history-card {
  height: 100%;
}
</style>