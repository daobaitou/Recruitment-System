<template>
  <div class="interview-result-container" v-loading="loading">
    <el-page-header @back="goBack" content="面试结果" class="page-header" />
    
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
          <span>面试结果</span>
        </div>
      </template>
      
      <el-form 
        :model="form" 
        :rules="rules" 
        ref="formRef" 
        label-width="120px" 
        class="interview-form"
      >
        <el-form-item label="面试轮次">
          <el-select v-model="form.round" placeholder="请选择面试轮次" style="width: 100%" disabled>
            <el-option
              v-for="item in interviewRounds"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            ></el-option>
          </el-select>
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
        
        <el-form-item label="面试反馈" prop="feedback">
          <el-input 
            v-model="form.feedback" 
            type="textarea" 
            placeholder="请输入面试反馈"
            :rows="4"
          />
        </el-form-item>
        
        <el-form-item label="面试评分" prop="rating">
          <el-rate v-model="form.rating" />
        </el-form-item>
        
        <el-form-item label="面试状态" prop="status">
          <el-select v-model="form.status" placeholder="请选择面试状态" style="width: 100%">
            <el-option
              v-for="item in interviewStatusOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            ></el-option>
          </el-select>
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
  id: undefined,
  candidateId: undefined,
  round: '', // 面试轮次
  title: '',
  description: '',
  interviewer: '',
  date: '',
  time: '',
  location: '',
  status: 'completed',
  feedback: '',
  rating: 0
})

const interviewRounds = ref([
  { value: 'first-interview', label: '一面' },
  { value: 'second-interview', label: '二面' },
  { value: 'third-interview', label: '三面' },
  { value: 'hr-interview', label: 'HR面' },
  { value: 'final-interview', label: '终面' }
])

const interviewStatusOptions = ref([
  { value: 'scheduled', label: '已安排' },
  { value: 'completed', label: '已完成' },
  { value: 'cancelled', label: '已取消' }
])

const rules = {
  interviewer: [{ required: true, message: '请输入面试官姓名', trigger: 'blur' }],
  date: [{ required: true, message: '请选择面试日期', trigger: 'change' }],
  time: [{ required: true, message: '请选择面试时间', trigger: 'change' }],
  location: [{ required: true, message: '请输入面试地点', trigger: 'blur' }],
  status: [{ required: true, message: '请选择面试状态', trigger: 'change' }]
}

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

// 返回上一页
const goBack = () => {
  router.go(-1)
}

// 提交表单
const submitForm = async () => {
  formRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        // 创建面试记录
        const interviewData = {
          candidateId: form.candidateId,
          round: form.round,
          title: `${form.round === 'first-interview' ? '一面' : '二面'}-${form.candidateName}`,
          description: form.notes,
          interviewer: form.interviewer,
          date: form.date,
          time: form.time,
          location: form.location,
          status: 'completed',
          feedback: form.feedback,
          rating: form.rating
        }
        
        await interviewStore.createInterview(interviewData)
        
        // 更新候选人状态为已完成
        const updateData = {
          interview_status: 'completed'
        }
        
        await candidateStore.updateCandidate(form.candidateId, updateData)
        
        ElMessage.success('面试结果处理成功')
        router.push({ name: 'CandidateDetail', params: { id: form.candidateId } })
      } catch (error) {
        console.error('处理面试结果失败:', error)
        ElMessage.error('处理面试结果失败: ' + (error.response?.data?.message || error.message))
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
      // 获取候选人信息
      await candidateStore.fetchCandidateById(candidateId)
      
      // 根据候选人的面试阶段预填充表单
      if (candidate.value) {
        form.candidateId = candidateId
        form.candidateName = candidate.value.name
        form.position = candidate.value.position
        
        // 根据面试阶段预填充面试信息
        if (candidate.value.process === 'first-interview') {
          form.round = 'first-interview'
          form.interviewer = '' // 面试官需要手动填写
          form.date = candidate.value.firstInterviewDate || ''
          form.time = candidate.value.firstInterviewTime || ''
          form.location = candidate.value.firstInterviewLocation || ''
        } else if (candidate.value.process === 'second-interview') {
          form.round = 'second-interview'
          form.interviewer = '' // 面试官需要手动填写
          form.date = candidate.value.secondInterviewDate || ''
          form.time = candidate.value.secondInterviewTime || ''
          form.location = candidate.value.secondInterviewLocation || ''
        }
        
        // 设置默认标题
        form.title = `面试-${candidate.value.name}`
      }
    } catch (error) {
      console.error('加载候选人信息失败:', error)
      ElMessage.error('候选人信息加载失败')
      router.push({ name: 'CandidateList' })
    }
  }
})
</script>

<style scoped>
.interview-result-container {
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