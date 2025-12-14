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
            <el-tag :type="getStatusTagType(candidate.interviewStatus)" class="status-tag">
              {{ getInterviewStatusText(candidate.interviewStatus) }}
            </el-tag>
          </div>
          <div class="candidate-actions">
            <el-button @click="handleEdit">编辑</el-button>
            <el-button 
              type="primary" 
              @click="handleScheduleInterview"
              v-if="candidate.interviewStatus === 'pending' || candidate.interviewStatus === 'completed'"
            >
              安排面试
            </el-button>
            <el-button 
              type="primary" 
              @click="handleProcessInterview"
              v-if="candidate.interviewStatus === 'unconfirmed' || candidate.interviewStatus === 'confirmed'"
            >
              处理面试结果
            </el-button>
            <el-button 
              type="success" 
              @click="handleSendOffer"
              v-if="candidate.process === 'second-interview' && candidate.interviewStatus === 'completed'"
            >
              发放Offer
            </el-button>
          </div>
        </div>
      </template>
      
      <el-row :gutter="20">
        <el-col :span="12">
          <el-descriptions title="基本信息" :column="1" border>
            <el-descriptions-item label="姓名">{{ candidate.name }}</el-descriptions-item>
            <el-descriptions-item label="应聘职位">{{ candidate.position }}</el-descriptions-item>
            <el-descriptions-item label="联系电话">{{ candidate.phone }}</el-descriptions-item>
            <el-descriptions-item label="邮箱地址">{{ candidate.email }}</el-descriptions-item>
            <el-descriptions-item label="简历来源">{{ candidate.source }}</el-descriptions-item>
            <el-descriptions-item label="学历">{{ candidate.education }}</el-descriptions-item>
            <el-descriptions-item label="工作经验">{{ candidate.experience }}</el-descriptions-item>
            <el-descriptions-item label="期望薪资">{{ candidate.expectedSalary }}</el-descriptions-item>
          </el-descriptions>
          
          <el-descriptions title="个人详细信息" :column="1" border class="personal-info">
            <el-descriptions-item label="出生日期">{{ candidate.birthDate || '-' }}</el-descriptions-item>
            <el-descriptions-item label="民族">{{ candidate.ethnicity || '-' }}</el-descriptions-item>
            <el-descriptions-item label="籍贯">{{ candidate.nativePlace || '-' }}</el-descriptions-item>
            <el-descriptions-item label="婚姻状态">{{ candidate.maritalStatus || '-' }}</el-descriptions-item>
            <el-descriptions-item label="现住址">{{ candidate.currentAddress || '-' }}</el-descriptions-item>
            <el-descriptions-item label="身份证号码">{{ candidate.idNumber || '-' }}</el-descriptions-item>
            <el-descriptions-item label="户口所在地">{{ candidate.householdRegistrationAddress || '-' }}</el-descriptions-item>
          </el-descriptions>
        </el-col>
        
        <el-col :span="12">
          <el-descriptions title="资金信息" :column="1" border>
            <el-descriptions-item label="资金来源">{{ candidate.fundPlatform }}</el-descriptions-item>
          </el-descriptions>
          
          <el-descriptions title="面试进度" :column="1" border class="interview-progress">
            <el-descriptions-item label="当前阶段">{{ getInterviewStageText(candidate.process) }}</el-descriptions-item>
            <el-descriptions-item label="面试状态">{{ getInterviewStatusText(candidate.interviewStatus) }}</el-descriptions-item>
          </el-descriptions>
        </el-col>
      </el-row>
      
      <div class="interview-records">
        <h4>面试记录</h4>
        <el-table :data="interviewRecords" style="width: 100%" v-if="interviewRecords.length > 0">
          <el-table-column prop="round" label="面试轮次" width="100">
            <template #default="scope">
              {{
                scope.row.round === 'first-interview' ? '一面' :
                scope.row.round === 'second-interview' ? '二面' :
                scope.row.round === 'third-interview' ? '三面' :
                scope.row.round === 'hr-interview' ? 'HR面' :
                scope.row.round === 'final-interview' ? '终面' : scope.row.round
              }}
            </template>
          </el-table-column>
          <el-table-column prop="interviewer" label="面试官" width="120">
            <template #default="scope">
              <span v-if="scope.row.interviewer">{{ scope.row.interviewer }}</span>
              <span v-else>-</span>
            </template>
          </el-table-column>
          <el-table-column prop="date" label="面试日期" width="120">
            <template #default="scope">
              <span v-if="scope.row.date">{{ scope.row.date }}</span>
              <span v-else>-</span>
            </template>
          </el-table-column>
          <el-table-column prop="time" label="面试时间" width="100">
            <template #default="scope">
              <span v-if="scope.row.time">{{ scope.row.time }}</span>
              <span v-else>-</span>
            </template>
          </el-table-column>
          <el-table-column prop="location" label="面试地点" width="150">
            <template #default="scope">
              <span v-if="scope.row.location">{{ scope.row.location }}</span>
              <span v-else>-</span>
            </template>
          </el-table-column>
          <el-table-column prop="status" label="状态" width="100">
            <template #default="scope">
              <el-tag :type="getInterviewStatusType(scope.row.status)">
                {{ getInterviewRecordStatusText(scope.row.status) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="feedback" label="面试反馈">
            <template #default="scope">
              <span v-if="scope.row.feedback">{{ scope.row.feedback }}</span>
              <span v-else>-</span>
            </template>
          </el-table-column>
          <el-table-column prop="rating" label="评分" width="80">
            <template #default="scope">
              <span v-if="scope.row.rating > 0">{{ scope.row.rating }}/5</span>
              <span v-else>-</span>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="120" fixed="right">
            <template #default="scope">
              <el-button 
                size="small" 
                type="primary" 
                @click="handleViewInterview(scope.row)"
              >
                查看详情
              </el-button>
            </template>
          </el-table-column>
        </el-table>
        <el-empty description="暂无面试记录" v-else />
      </div>
      
      <div class="candidate-notes" v-if="candidate.remarks">
        <h4>备注信息</h4>
        <div class="notes" v-html="candidate.remarks"></div>
      </div>
    </el-card>
    
    <!-- 编辑候选人对话框 -->
    <el-dialog v-model="dialogVisible" title="编辑候选人" width="800px" class="candidate-edit-dialog">
      <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
        <el-tabs v-model="activeTab" class="candidate-edit-tabs">
          <el-tab-pane label="基本信息" name="basic">
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="资金来源" prop="fundId">
                  <el-select v-model="form.fundId" placeholder="请选择资金来源" style="width: 100%">
                    <el-option
                      v-for="fund in funds"
                      :key="fund.id"
                      :label="fund.platform"
                      :value="fund.id"
                    ></el-option>
                  </el-select>
                </el-form-item>
                <el-form-item label="姓名" prop="name">
                  <el-input v-model="form.name" />
                </el-form-item>
                <el-form-item label="应聘职位" prop="position">
                  <el-input v-model="form.position" />
                </el-form-item>
                <el-form-item label="联系电话" prop="phone">
                  <el-input v-model="form.phone" />
                </el-form-item>
                <el-form-item label="邮箱地址">
                  <el-input v-model="form.email" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="简历来源">
                  <el-input v-model="form.source" />
                </el-form-item>
                <el-form-item label="学历">
                  <el-input v-model="form.education" />
                </el-form-item>
                <el-form-item label="工作经验">
                  <el-input v-model="form.experience" />
                </el-form-item>
                <el-form-item label="期望薪资">
                  <el-input v-model="form.expectedSalary" />
                </el-form-item>
              </el-col>
            </el-row>
          </el-tab-pane>
          
          <el-tab-pane label="个人详细信息" name="personal">
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="出生日期">
                  <el-date-picker
                    v-model="form.birthDate"
                    type="date"
                    placeholder="选择出生日期"
                    style="width: 100%"
                    value-format="YYYY-MM-DD"
                  />
                </el-form-item>
                <el-form-item label="民族">
                  <el-input v-model="form.ethnicity" />
                </el-form-item>
                <el-form-item label="籍贯">
                  <el-input v-model="form.nativePlace" />
                </el-form-item>
                <el-form-item label="婚姻状态">
                  <el-select v-model="form.maritalStatus" placeholder="请选择婚姻状态" style="width: 100%">
                    <el-option label="未婚" value="未婚"></el-option>
                    <el-option label="已婚" value="已婚"></el-option>
                    <el-option label="离异" value="离异"></el-option>
                    <el-option label="丧偶" value="丧偶"></el-option>
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="现住址">
                  <el-input 
                    v-model="form.currentAddress" 
                    type="textarea"
                    :rows="3"
                  />
                </el-form-item>
                <el-form-item label="身份证号码">
                  <el-input v-model="form.idNumber" />
                </el-form-item>
                <el-form-item label="户口所在地">
                  <el-input 
                    v-model="form.householdRegistrationAddress" 
                    type="textarea"
                    :rows="3"
                  />
                </el-form-item>
              </el-col>
            </el-row>
          </el-tab-pane>
          
          <el-tab-pane label="资金信息" name="fund">
            <el-alert
              title="资金信息由系统自动关联，此处仅显示相关信息"
              type="info"
              show-icon
              :closable="false"
            />
            <el-descriptions :column="1" border style="margin-top: 20px;">
              <el-descriptions-item label="资金来源">{{ selectedFund?.platform || '-' }}</el-descriptions-item>
              <el-descriptions-item label="招聘岗位">{{ selectedFund?.position || '-' }}</el-descriptions-item>
              <el-descriptions-item label="薪资范围">{{ selectedFund?.salaryRange || '-' }}</el-descriptions-item>
              <el-descriptions-item label="充值人">{{ selectedFund?.rechargeByName || '-' }}</el-descriptions-item>
            </el-descriptions>
          </el-tab-pane>
        </el-tabs>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitForm">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useCandidateStore } from '@/stores/candidate'
import { useFundStore } from '@/stores/fund'

const route = useRoute()
const router = useRouter()
const candidateStore = useCandidateStore()
const fundStore = useFundStore()

const dialogVisible = ref(false)
const loading = ref(false)
const interviewRecords = ref([])
const activeTab = ref('basic') // 添加标签页控制

const formRef = ref()

const interviewRounds = ref([
  { value: 'first', label: '一面' },
  { value: 'second', label: '二面' }
])

const interviewStatusOptions = ref([
  { value: 'scheduled', label: '已安排' },
  { value: 'completed', label: '已完成' },
  { value: 'cancelled', label: '已取消' }
])

const rules = {
  fund_id: [{ required: true, message: '请选择资金来源', trigger: 'change' }],
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  position: [{ required: true, message: '请输入应聘职位', trigger: 'blur' }],
  phone: [{ required: true, message: '请输入联系电话', trigger: 'blur' }]
}

// 计算属性：根据选中的资金ID获取资金信息
const selectedFund = computed(() => {
  if (!form.fundId || !funds.value) return null
  return funds.value.find(fund => fund.id === form.fundId) || null
})

// 返回上一页
const goBack = () => {
  router.go(-1)
}

// 处理编辑
const handleEdit = () => {
  if (candidate.value) {
    // 初始化表单数据
    Object.assign(form, {
      id: candidate.value.id,
      fundId: candidate.value.fundId,
      name: candidate.value.name,
      position: candidate.value.position,
      phone: candidate.value.phone,
      email: candidate.value.email,
      source: candidate.value.source,
      education: candidate.value.education,
      experience: candidate.value.experience,
      expectedSalary: candidate.value.expectedSalary,
      // 个人详细信息
      birthDate: candidate.value.birthDate,
      ethnicity: candidate.value.ethnicity,
      nativePlace: candidate.value.nativePlace, // 籍贯
      maritalStatus: candidate.value.maritalStatus,
      currentAddress: candidate.value.currentAddress,
      idNumber: candidate.value.idNumber,
      householdRegistrationAddress: candidate.value.householdRegistrationAddress // 户口所在地
    })
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
    router.push({ name: 'InterviewScheduler', params: { id: candidate.value.id } })
  }
}

// 处理面试结果
const handleProcessInterview = () => {
  // 跳转到面试结果处理页面
  // 根据项目规范，应传递候选人ID而不是面试ID
  router.push({ 
    name: 'InterviewResult', 
    params: { id: candidate.value.id } 
  })
}

// 发放Offer
const handleSendOffer = () => {
  ElMessage.info('发放Offer功能待实现')
}

// 更新面试状态
const updateInterviewStatus = async (status) => {
  if (!candidate.value) return;
  
  try {
    const updatedCandidate = {
      ...candidate.value,
      interviewStatus: status
    }
    
    await candidateStore.updateCandidate(candidate.value.id, updatedCandidate)
    ElMessage.success('面试状态更新成功')
  } catch (error) {
    ElMessage.error('更新失败')
  }
}

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

// 获取候选人面试状态文本
const getInterviewStatusText = (status) => {
  const statusMap = {
    'pending': '待约',
    'unconfirmed': '未确认',
    'confirmed': '已确认',
    'completed': '已完成',
    'rejected': '已拒'
  }
  return statusMap[status] || '待约'
}

// 获取面试记录状态文本
const getInterviewRecordStatusText = (status) => {
  const statusMap = {
    'scheduled': '已安排',
    'completed': '已完成',
    'cancelled': '已取消'
  }
  return statusMap[status] || '未知'
}

// 获取面试记录状态类型
const getInterviewStatusType = (status) => {
  const typeMap = {
    'scheduled': 'warning',
    'completed': 'success',
    'cancelled': 'danger'
  }
  return typeMap[status] || 'info'
}

// 获取面试记录状态颜色
const getInterviewStatusColor = (status) => {
  const colorMap = {
    'scheduled': '#E6A23C',
    'completed': '#67C23A',
    'cancelled': '#F56C6C'
  }
  return colorMap[status] || '#909399'
}

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN')
}

// 格式化日期时间
const formatDateTime = (date, time) => {
  if (!date || !time) return ''
  return `${date} ${time}`
}

// 获取状态标签类型
const getStatusTagType = (status) => {
  const typeMap = {
    'pending': 'info',
    'unconfirmed': 'warning',
    'confirmed': 'success',
    'completed': 'primary',
    'rejected': 'danger'
  }
  return typeMap[status] || 'info'
}

const candidate = computed(() => candidateStore.currentCandidate)

// 面试记录
//const interviewRecords = ref([])

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
  process: 'invite',
  status: 'pending',
  interviewStatus: 'pending',
  // 个人详细信息
  birthDate: '',
  ethnicity: '',
  nativePlace: '', // 籍贯
  maritalStatus: '',
  currentAddress: '',
  idNumber: '',
  householdRegistrationAddress: '' // 户口所在地
})

// 加载面试记录
const loadInterviewRecords = async () => {
  if (!candidate.value) return
  
  try {
    // 不再从interviews表获取数据，而是直接从candidates表中构造面试记录
    const records = []
    
    // 构造一面记录（如果有）
    if (candidate.value.firstInterviewDate || candidate.value.firstInterviewTime) {
      records.push({
        id: `${candidate.value.id}-first`, // 构造一个虚拟ID
        candidateId: candidate.value.id,
        round: 'first-interview',
        title: `一面-${candidate.value.name}`,
        interviewer: candidate.value.firstInterviewer || '',
        date: candidate.value.firstInterviewDate || '',
        time: candidate.value.firstInterviewTime || '',
        location: candidate.value.firstInterviewLocation || '',
        status: candidate.value.firstInterviewDate ? 'completed' : 'scheduled',
        feedback: candidate.value.firstInterviewResult || '',
        rating: 0 // 评分信息在candidates表中没有存储
      })
    }
    
    // 构造二面记录（如果有）
    if (candidate.value.secondInterviewDate || candidate.value.secondInterviewTime) {
      records.push({
        id: `${candidate.value.id}-second`, // 构造一个虚拟ID
        candidateId: candidate.value.id,
        round: 'second-interview',
        title: `二面-${candidate.value.name}`,
        interviewer: candidate.value.secondInterviewer || '',
        date: candidate.value.secondInterviewDate || '',
        time: candidate.value.secondInterviewTime || '',
        location: candidate.value.secondInterviewLocation || '',
        status: candidate.value.secondInterviewDate ? 'completed' : 'scheduled',
        feedback: candidate.value.secondInterviewResult || '',
        rating: 0 // 评分信息在candidates表中没有存储
      })
    }
    
    // 构造最终面试记录（如果有）
    if (candidate.value.finalInterviewResult) {
      records.push({
        id: `${candidate.value.id}-final`, // 构造一个虚拟ID
        candidateId: candidate.value.id,
        round: 'final-interview',
        title: `最终面试-${candidate.value.name}`,
        interviewer: '', // 最终面试官信息在candidates表中没有存储
        date: '', // 最终面试日期信息在candidates表中没有存储
        time: '', // 最终面试时间信息在candidates表中没有存储
        location: '', // 最终面试地点信息在candidates表中没有存储
        status: 'completed',
        feedback: candidate.value.finalInterviewResult || '',
        rating: 0 // 评分信息在candidates表中没有存储
      })
    }
    
    interviewRecords.value = records
  } catch (error) {
    ElMessage.error('加载面试记录失败')
  }
}

// 提交表单
const submitForm = () => {
  formRef.value.validate((valid) => {
    if (valid) {
      if (form.id) {
        // 编辑候选人
        const candidateData = {
          fund_id: form.fundId,
          name: form.name,
          position: form.position,
          phone: form.phone,
          email: form.email,
          source: form.source,
          education: form.education,
          experience: form.experience,
          expected_salary: form.expectedSalary,
          // 个人详细信息
          birth_date: form.birthDate,
          ethnicity: form.ethnicity,
          native_place: form.nativePlace, // 籍贯
          marital_status: form.maritalStatus,
          current_address: form.currentAddress,
          id_number: form.idNumber,
          household_registration_address: form.householdRegistrationAddress // 户口所在地
        }
        
        candidateStore.updateCandidate(form.id, candidateData)
          .then(() => {
            ElMessage.success('编辑成功')
            dialogVisible.value = false
            // 重新加载候选人详情
            candidateStore.fetchCandidateById(form.id)
            loadInterviewRecords()
          })
          .catch(error => {
            console.error('编辑候选人失败:', error)
            ElMessage.error('编辑失败')
          })
      }
    }
  })
}

// 查看面试详情
const handleViewInterview = (interview) => {
  // 不再跳转到面试结果页面，而是直接显示面试结果信息
  ElMessageBox.alert(`
    <strong>面试轮次:</strong> ${
      interview.round === 'first-interview' ? '一面' :
      interview.round === 'second-interview' ? '二面' :
      interview.round === 'third-interview' ? '三面' :
      interview.round === 'hr-interview' ? 'HR面' :
      interview.round === 'final-interview' ? '终面' : interview.round
    }<br><br>
    
    <strong>面试官:</strong> ${interview.interviewer || '-'}<br><br>
    
    <strong>面试日期:</strong> ${interview.date || '-'}<br><br>
    
    <strong>面试时间:</strong> ${interview.time || '-'}<br><br>
    
    <strong>面试地点:</strong> ${interview.location || '-'}<br><br>
    
    <strong>面试反馈:</strong><br> ${interview.feedback || '无'}<br><br>
    
    <strong>评分:</strong> ${interview.rating > 0 ? `${interview.rating}/5` : '-'}
  `, '面试详情', {
    dangerouslyUseHTMLString: true,
    confirmButtonText: '确定'
  })
}

// 页面加载时获取候选人详情
onMounted(async () => {
  const candidateId = route.params.id
  console.log('加载候选人详情，ID:', candidateId)
  
  if (candidateId) {
    try {
      await candidateStore.fetchCandidateById(candidateId)
      console.log('候选人详情加载成功')
      // 加载面试记录
      await loadInterviewRecords()
    } catch (error) {
      console.error('加载候选人详情失败:', error)
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
  margin-bottom: 10px;
}

.interview-progress {
  margin-top: 20px;
}

.personal-info {
  margin-top: 20px;
}

.candidate-notes {
  margin-top: 20px;
}

.candidate-notes h4 {
  margin-bottom: 10px;
}

.candidate-edit-dialog .el-dialog__body {
  padding: 10px 20px 0 20px;
}

.candidate-edit-tabs {
  min-height: 300px;
}

.candidate-edit-tabs .el-tab-pane {
  padding: 20px 0;
}

.candidate-edit-tabs .el-form-item {
  margin-bottom: 20px;
}
</style>