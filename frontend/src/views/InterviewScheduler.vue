<template>
  <div class="interview-scheduler-container" v-loading="loading">
    <el-page-header @back="goBack" content="安排面试" class="page-header" />
    
    <el-card>
      <template #header>
        <div class="card-header">
          <span>候选人信息</span>
        </div>
      </template>
      
      <el-descriptions :column="3" border>
        <el-descriptions-item label="姓名">{{ candidate?.name }}</el-descriptions-item>
        <el-descriptions-item label="应聘职位">{{ candidate?.position }}</el-descriptions-item>
        <el-descriptions-item label="当前阶段">{{ getInterviewStageText(candidate?.process) }}</el-descriptions-item>
      </el-descriptions>
    </el-card>
    
    <el-card class="form-card">
      <template #header>
        <div class="card-header">
          <span>面试安排</span>
        </div>
      </template>
      
      <el-form 
        :model="form" 
        :rules="rules" 
        ref="formRef" 
        label-width="120px" 
        class="interview-form"
      >
        <el-form-item label="面试轮次" prop="round">
          <el-select v-model="form.round" placeholder="请选择面试轮次" style="width: 100%">
            <el-option
              v-for="item in interviewRounds"
              :key="item.value"
              :label="item.label"
              :value="item.value"
              :disabled="item.disabled"
            ></el-option>
          </el-select>
        </el-form-item>
        
        <el-form-item label="面试主题" prop="title">
          <el-input v-model="form.title" placeholder="请输入面试主题" />
        </el-form-item>
        
        <el-form-item label="面试描述">
          <el-input 
            v-model="form.description" 
            type="textarea" 
            placeholder="请输入面试描述"
            :rows="3"
          />
        </el-form-item>
        
        <el-form-item label="面试官" prop="interviewer">
          <el-input v-model="form.interviewer" placeholder="请输入面试官姓名" />
        </el-form-item>
        
        <el-form-item label="面试日期" prop="date">
          <el-date-picker
            v-model="form.date"
            type="date"
            placeholder="请选择面试日期"
            value-format="YYYY-MM-DD"
            style="width: 100%"
          />
        </el-form-item>
        
        <el-form-item label="面试时间" prop="time">
          <el-time-picker
            v-model="form.time"
            placeholder="请选择面试时间"
            value-format="HH:mm"
            style="width: 100%"
          />
        </el-form-item>
        
        <el-form-item label="面试地点" prop="location">
          <el-input v-model="form.location" placeholder="请输入面试地点" />
        </el-form-item>
        
        <el-form-item label="备注">
          <el-input 
            v-model="form.remarks" 
            type="textarea" 
            placeholder="请输入备注信息"
            :rows="2"
          />
        </el-form-item>
      </el-form>
      
      <div class="form-footer">
        <el-button @click="goBack">取消</el-button>
        <el-button type="primary" @click="submitForm">确定</el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useCandidateStore } from '@/stores/candidate'
import { useInterviewStore } from '@/stores/interview'

const route = useRoute()
const router = useRouter()
const candidateStore = useCandidateStore()
const interviewStore = useInterviewStore()

const formRef = ref()
const loading = ref(false)

const form = reactive({
  candidateId: undefined,
  round: '', // 面试轮次
  title: '',
  description: '',
  interviewer: '',
  date: '',
  time: '',
  location: '',
  remarks: '' // 安排面试时的备注
})

// 根据候选人当前阶段动态设置面试轮次选项
const interviewRounds = computed(() => {
  if (!candidate.value) return []
  
  // 只保留一面和二面两个选项
  const rounds = [
    { value: 'first-interview', label: '一面' },
    { value: 'second-interview', label: '二面' }
  ]

  // 根据候选人的当前阶段设置默认选项和禁用状态
  if (candidate.value.process === 'invite') {
    // 如果是邀约阶段，默认安排一面
    form.round = 'first-interview'
    // 禁用二面选项
    rounds.forEach(item => {
      if (item.value === 'second-interview') {
        item.disabled = true
      }
    })
  } else if (candidate.value.process === 'first-interview') {
    // 如果是一面阶段，默认安排二面
    form.round = 'second-interview'
    // 禁用一面选项
    rounds.forEach(item => {
      if (item.value === 'first-interview') {
        item.disabled = true
      }
    })
  } else {
    // 其他情况，默认安排一面
    form.round = 'first-interview'
  }
  
  return rounds
})

const rules = {
  round: [{ required: true, message: '请选择面试轮次', trigger: 'change' }],
  title: [{ required: true, message: '请输入面试主题', trigger: 'blur' }],
  interviewer: [{ required: true, message: '请输入面试官姓名', trigger: 'blur' }],
  date: [{ required: true, message: '请选择面试日期', trigger: 'change' }],
  time: [{ required: true, message: '请选择面试时间', trigger: 'change' }],
  location: [{ required: true, message: '请输入面试地点', trigger: 'blur' }]
}

const candidate = computed(() => candidateStore.currentCandidate)

// 获取面试阶段文本
const getInterviewStageText = (stage) => {
  const stageMap = {
    'invite': '邀约',
    'first-interview': '一面',
    'second-interview': '二面',
    'third-interview': '三面',
    'hr-interview': 'HR面',
    'final-interview': '终面',
    'offer': 'Offer',
    'entry': '入职'
  }
  return stageMap[stage] || '邀约'
}

// 返回上一页
const goBack = () => {
  router.go(-1)
}

// 提交表单
const submitForm = () => {
  formRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        // 更新候选人信息，将面试安排信息存储到候选人记录中
        const updateData = {
          fundId: candidate.value.fund_id, // 保留原有的资金来源
          name: candidate.value.name,
          position: candidate.value.position,
          process: form.round,
          status: 'pending', // 添加默认状态
          interviewStatus: 'unconfirmed', // 安排面试后状态改为"未确认"
          // 根据面试轮次更新对应的面试信息字段
          ...(form.round === 'first-interview' && {
            firstInterviewDate: form.date,
            firstInterviewTime: form.time,
            firstInterviewLocation: form.location,
            firstInterviewer: form.interviewer // 添加面试官字段
          }),
          ...(form.round === 'second-interview' && {
            secondInterviewDate: form.date,
            secondInterviewTime: form.time,
            secondInterviewLocation: form.location,
            secondInterviewer: form.interviewer // 添加面试官字段
          }),
          scheduleRemarks: form.description // 安排面试时的备注
        }
        
        await candidateStore.updateCandidate(form.candidateId, updateData)
        
        ElMessage.success('面试安排成功')
        router.push({ 
          name: 'CandidateDetail', 
          params: { id: form.candidateId } 
        })
      } catch (error) {
        console.error('安排面试失败:', error)
        ElMessage.error('安排面试失败: ' + (error.response?.data?.message || error.message))
      } finally {
        loading.value = false
      }
    }
  })
}

// 页面加载时获取候选人详情
onMounted(async () => {
  const candidateId = route.params.id
  
  if (candidateId) {
    try {
      await candidateStore.fetchCandidateById(candidateId)
      form.candidateId = candidateId
      
      // 设置默认标题
      if (candidate.value) {
        form.title = `面试-${candidate.value.name}`
      }
    } catch (error) {
      console.error('加载候选人详情失败:', error)
      ElMessage.error('候选人不存在')
      router.push({ name: 'CandidateList' })
    }
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

.form-card {
  margin-top: 20px;
}

.interview-form {
  max-width: 600px;
  margin: 0 auto;
}

.form-footer {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 30px;
}
</style>