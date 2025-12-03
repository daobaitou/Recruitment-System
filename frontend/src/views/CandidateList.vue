<template>
  <div class="candidate-list full-screen">
    <el-card class="box-card full-height-card">
      <template #header>
        <div class="card-header">
          <span class="header-title">候选人列表</span>
          <el-button type="primary" size="large" @click="handleAddCandidate">添加候选人</el-button>
        </div>
      </template>
      
      <!-- 状态筛选 -->
      <div class="status-filter">
        <el-tag 
          v-for="status in statusOptions" 
          :key="status.value"
          :type="currentStatus === status.value ? 'primary' : 'info'"
          @click="filterByStatus(status.value)"
          class="status-tag"
          size="large"
          style="font-size: 16px; padding: 15px 20px; margin-right: 15px; cursor: pointer;"
        >
          {{ status.label }}
        </el-tag>
      </div>
      
      <!-- 候选人列表 -->
      <el-table 
        :data="filteredCandidates" 
        style="width: 100%" 
        v-loading="loading"
        class="enlarged-table"
        :cell-style="{ padding: '15px 0' }"
        :header-cell-style="{ padding: '15px 0', fontWeight: 'bold' }"
      >
        <el-table-column prop="id" label="ID" />
        <el-table-column prop="name" label="姓名">
          <template #default="scope">
            <span style="font-size: 16px; font-weight: bold">{{ scope.row.name }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="position" label="应聘职位" />
        <el-table-column prop="fundPlatform" label="资金来源" />
        <el-table-column prop="date" label="录入日期" />
        <el-table-column prop="interviewStage" label="面试阶段">
          <template #default="scope">
            <el-tag :type="getInterviewStageType(scope.row.process)" size="large">
              {{ getInterviewStageText(scope.row.process) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="statusText" label="状态">
          <template #default="scope">
            <el-tag :type="getStatusTypeByInterviewStatus(scope.row.interviewStatus)" size="large">
              {{ scope.row.statusText }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="320">
          <template #default="scope">
            <el-button size="large" @click="handleViewDetail(scope.row)">查看详情</el-button>
            <el-button size="large" type="primary" @click="handleEdit(scope.row)">编辑</el-button>
            <el-button size="large" type="danger" @click="handleDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <el-pagination
        v-model:current-page="pagination.currentPage"
        v-model:page-size="pagination.pageSize"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        :total="pagination.total"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        class="pagination-bar"
      />
    </el-card>
    
    <!-- 添加/编辑候选人对话框 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="600px">
      <el-form :model="form" :rules="rules" ref="formRef" label-width="120px">
        <el-form-item label="资金来源" prop="fundId">
          <el-select v-model="form.fundId" placeholder="请选择资金来源" style="width: 100%">
            <el-option
              v-for="fund in funds"
              :key="fund.id"
              :label="`${fund.platform} - ${fund.position}`"
              :value="fund.id"
            />
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
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="form.email" />
        </el-form-item>
        <el-form-item label="简历来源" prop="source">
          <el-input v-model="form.source" />
        </el-form-item>
        <el-form-item label="学历" prop="education">
          <el-input v-model="form.education" />
        </el-form-item>
        <el-form-item label="工作经验" prop="experience">
          <el-input v-model="form.experience" />
        </el-form-item>
        <el-form-item label="期望薪资" prop="expectedSalary">
          <el-input v-model="form.expectedSalary" />
        </el-form-item>
        <el-form-item label="面试阶段" prop="interviewStage">
          <el-select v-model="form.interviewStage" placeholder="请选择面试阶段" style="width: 100%">
            <el-option
              v-for="stage in interviewStages"
              :key="stage.value"
              :label="stage.label"
              :value="stage.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="面试状态" prop="interviewStatus">
          <el-select v-model="form.interviewStatus" placeholder="请选择面试状态" style="width: 100%">
            <el-option
              v-for="status in interviewStatusOptions"
              :key="status.value"
              :label="status.label"
              :value="status.value"
            />
          </el-select>
        </el-form-item>
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
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useCandidateStore } from '@/stores/candidate'
import { useFundStore } from '@/stores/fund'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const candidateStore = useCandidateStore()
const fundStore = useFundStore()
const userStore = useUserStore()

// 引用模板元素
const formRef = ref()

// 状态管理
const dialogVisible = ref(false)
const dialogTitle = ref('')
const loading = ref(false)
const activeTab = ref('all')
const searchKeyword = ref('')

// 表单数据
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

// 表单验证规则
const rules = {
  fundId: [{ required: true, message: '请选择资金来源', trigger: 'change' }],
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  position: [{ required: true, message: '请输入应聘职位', trigger: 'blur' }],
  phone: [{ required: true, message: '请输入联系电话', trigger: 'blur' }],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱地址', trigger: ['blur', 'change'] }
  ]
}

// 分页配置
const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

// 当前状态筛选
const currentStatus = ref('all')

// 获取资金列表
const funds = computed(() => fundStore.funds)

// 状态选项 - 与候选人数据中的process字段值保持一致
const statusOptions = ref([
  { value: 'all', label: '全部' },
  { value: 'invite', label: '邀约' },
  { value: 'first-interview', label: '一面' },
  { value: 'second-interview', label: '二面' },
  { value: 'offer', label: 'Offer' },
  { value: 'entry', label: '入职' }
])

// 面试阶段选项
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

// 获取状态标签类型
const getStatusTypeByInterviewStatus = (interviewStatus) => {
  const typeMap = {
    pending: 'info',
    unconfirmed: 'warning',
    confirmed: 'primary',
    completed: 'success',
    rejected: 'danger'
  }
  return typeMap[interviewStatus] || 'info'
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

// 过滤候选人状态
const filterByStatus = (status) => {
  currentStatus.value = status
  // 在实际项目中，这里可能需要重新加载数据或过滤现有数据
}

// 查看候选人详情
const handleViewDetail = (row) => {
  candidateStore.setCurrentCandidate(row)
  router.push(`/candidate/detail/${row.id}`)
}

// 安排面试
const handleScheduleInterview = (row) => {
  router.push(`/candidate/schedule/${row.id}`)
}

// 删除候选人
const handleDelete = (row) => {
  ElMessageBox.confirm(
    `确定要删除候选人"${row.name}"吗？`,
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    try {
      console.log('正在删除候选人:', row)
      const index = candidateStore.candidates.findIndex(c => c.id === row.id)
      if (index !== -1) {
        await candidateStore.deleteCandidate(row.id)
        ElMessage.success('删除成功')
        console.log('候选人删除成功')
      } else {
        console.warn('未找到要删除的候选人:', row.id)
        ElMessage.warning('未找到要删除的候选人')
      }
    } catch (error) {
      console.error('删除候选人失败:', error)
      ElMessage.error('删除失败: ' + (error.message || '未知错误'))
    }
  }).catch(() => {
    // 取消删除
    console.log('用户取消删除操作')
  })
}

// 过滤后的候选人列表
const filteredCandidates = computed(() => {
  console.log('开始筛选候选人数据，当前状态:', currentStatus.value, '搜索关键词:', searchKeyword.value)
  let candidates = candidateStore.candidates
  
  // 根据状态筛选过滤
  if (currentStatus.value !== 'all') {
    console.log('按状态筛选:', currentStatus.value)
    const beforeFilter = candidates.length
    candidates = candidates.filter(c => {
      const match = c.process === currentStatus.value
      console.log('候选人筛选:', c.name, c.process, '匹配:', match)
      return match
    })
    console.log('状态筛选完成，筛选前:', beforeFilter, '筛选后:', candidates.length)
  }
  
  // 根据搜索关键字过滤
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    console.log('按关键字筛选:', keyword)
    const beforeFilter = candidates.length
    candidates = candidates.filter(c => 
      c.name.toLowerCase().includes(keyword) ||
      c.position.toLowerCase().includes(keyword)
    )
    console.log('关键字筛选完成，筛选前:', beforeFilter, '筛选后:', candidates.length)
  }
  
  // 更新总数
  pagination.total = candidates.length
  console.log('最终筛选结果数量:', candidates.length)
  
  // 分页处理
  const start = (pagination.currentPage - 1) * pagination.pageSize
  const end = start + pagination.pageSize
  const paginated = candidates.slice(start, end)
  console.log('分页结果，起始索引:', start, '结束索引:', end, '返回数量:', paginated.length)
  return paginated
})

// 添加候选人
const handleAddCandidate = () => {
  dialogTitle.value = '添加候选人'
  resetForm()
  dialogVisible.value = true
}

// 编辑候选人
const handleEdit = (row) => {
  dialogTitle.value = '编辑候选人'
  Object.assign(form, row)
  dialogVisible.value = true
}

// 提交表单
const submitForm = () => {
  formRef.value.validate((valid) => {
    if (valid) {
      if (form.id) {
        // 编辑候选人
        const index = candidateStore.candidates.findIndex(c => c.id === form.id)
        if (index !== -1) {
          // 更新状态文本
          form.statusText = getStatusTextByInterviewStatus(form.interviewStatus);
          candidateStore.candidates[index] = { ...form }
        }
        ElMessage.success('编辑成功')
      } else {
        // 添加候选人
        form.id = Date.now() // 简单生成ID
        form.date = new Date().toLocaleDateString()
        form.status = 'pending'
        form.statusText = getStatusTextByInterviewStatus(form.interviewStatus)
        form.process = form.interviewStage
        
        // 设置资金平台信息
        const fund = funds.value.find(f => f.id === form.fundId)
        if (fund) {
          form.fundPlatform = fund.platform
        }
        
        candidateStore.candidates.push({ ...form })
        ElMessage.success('添加成功')
      }
      dialogVisible.value = false
    }
  })
}

// 根据面试状态获取状态文本
const getStatusTextByInterviewStatus = (interviewStatus) => {
  const statusTextMap = {
    'pending': '待约',
    'unconfirmed': '未确认',
    'confirmed': '已确认',
    'completed': '已完成',
    'rejected': '已拒'
  };
  return statusTextMap[interviewStatus] || '待约';
}

// 重置表单
const resetForm = () => {
  Object.assign(form, {
    id: undefined,
    fundId: '',
    name: '',
    position: '',
    phone: '',
    email: '',
    source: '',
    interviewStage: 'invite',
    interviewStatus: 'pending',
    education: '',
    experience: '',
    expectedSalary: ''
  })
}

// 分页相关方法
const handleSizeChange = (val) => {
  pagination.pageSize = val
}

const handleCurrentChange = (val) => {
  pagination.currentPage = val
}

// 页面加载时获取数据
const loadData = async () => {
  try {
    loading.value = true
    await Promise.all([
      candidateStore.fetchCandidates(),
      fundStore.fetchFunds()
    ])
  } catch (error) {
    console.error('加载数据失败:', error)
    ElMessage.error('加载数据失败')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadData()
})

</script>

<style scoped>
.candidate-list.full-screen {
  height: calc(100vh - 84px);
  padding: 20px;
  box-sizing: border-box;
}

.full-height-card {
  height: 100%;
}

.box-card {
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 0;
}

.header-title {
  font-size: 24px;
  font-weight: bold;
}

.status-filter {
  margin: 20px 0;
  padding: 15px 0;
  border-bottom: 1px solid #ebeef5;
}

.enlarged-table {
  margin: 20px 0;
  font-size: 16px;
  width: 100%;
}

.pagination-bar {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}
</style>