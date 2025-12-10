<template>
  <div class="candidate-list-container">
    <el-card class="candidate-list-card">
      <template #header>
        <div class="card-header">
          <span>候选人列表</span>
          <div class="header-actions">
            <el-input
              v-model="searchKeyword"
              placeholder="搜索候选人..."
              style="width: 300px; margin-right: 20px"
              clearable
              @clear="handleSearch"
              @keyup.enter="handleSearch"
            >
              <template #append>
                <el-button @click="handleSearch">搜索</el-button>
              </template>
            </el-input>
            <el-button type="primary" size="large" @click="handleAddCandidate">添加候选人</el-button>
          </div>
        </div>
      </template>
      
      <el-tabs v-model="activeTab" @tab-change="handleTabChange">
        <el-tab-pane label="全部" name="all"></el-tab-pane>
        <el-tab-pane label="待约" name="pending"></el-tab-pane>
        <el-tab-pane label="未确认" name="unconfirmed"></el-tab-pane>
        <el-tab-pane label="已确认" name="confirmed"></el-tab-pane>
        <el-tab-pane label="已完成" name="completed"></el-tab-pane>
        <el-tab-pane label="已拒" name="rejected"></el-tab-pane>
      </el-tabs>
      
      <el-table 
        :data="paginatedCandidates" 
        style="width: 100%" 
        v-loading="loading"
        :cell-style="{ padding: '15px 0' }" 
        :header-cell-style="{ padding: '15px 0', fontWeight: 'bold' }"
        :row-style="{ height: '60px' }"
        :header-row-style="{ height: '60px' }"
      >
        <el-table-column prop="name" label="姓名" min-width="120">
          <template #default="scope">
            <span style="font-size: 16px; font-weight: bold;">{{ scope.row.name }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="position" label="应聘职位" min-width="150">
          <template #default="scope">
            <span style="font-size: 16px;">{{ scope.row.position }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="fundName" label="资金来源" min-width="150">
          <template #default="scope">
            <el-tag>{{ scope.row.fundName || getFundNameById(scope.row.fundId) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="phone" label="联系电话" min-width="120">
          <template #default="scope">
            <span style="font-size: 16px;">{{ scope.row.phone }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="date" label="投递日期" min-width="120" align="center">
          <template #default="scope">
            <span style="font-size: 16px;">{{ scope.row.date }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" min-width="320" align="center">
          <template #default="{ row }">
            <el-button size="large" @click="handleViewDetail(row)">查看详情</el-button>
            <el-button size="large" type="primary" @click="handleEdit(row)">编辑</el-button>
            <el-button size="large" type="danger" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <el-pagination
        v-model:current-page="pagination.currentPage"
        v-model:page-size="pagination.pageSize"
        :page-sizes="[10, 20, 50, 100]"
        :total="pagination.total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        style="margin-top: 20px; justify-content: center;"
      />
    </el-card>
    
    <!-- 添加/编辑候选人对话框 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="600px">
      <el-form :model="form" :rules="rules" ref="formRef" label-width="120px">
        <el-form-item label="资金来源" prop="fundId">
          <el-select v-model="form.fundId" placeholder="请选择资金来源" style="width: 100%">
            <el-option
              v-for="fund in sortedFunds"
              :key="fund.id"
              :label="`${fund.name} - ${fund.position}`"
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
  expectedSalary: ''
})

// 表单验证规则
const rules = {
  fundId: [{ required: true, message: '请选择资金来源', trigger: 'change' }],
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  position: [{ required: true, message: '请输入应聘职位', trigger: 'blur' }],
  phone: [{ required: true, message: '请输入联系电话', trigger: 'blur' }]
}


// 分页配置
const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

// 获取资金列表并按时间排序（最早的在最下面）
const sortedFunds = computed(() => {
  // 按资金名称中的时间部分排序，最早的在最下面
  return [...funds.value].sort((a, b) => {
    // 提取资金名称中的时间部分进行比较
    const timeA = extractTimeFromFundName(a.name);
    const timeB = extractTimeFromFundName(b.name);
    
    // 降序排列，最新的在前面，最早的在后面
    return timeB.localeCompare(timeA);
  });
});

// 从资金名称中提取时间部分
const extractTimeFromFundName = (fundName) => {
  // 假设资金名称格式为 "YYYYMM平台名称"，如 "202512前程无忧"
  // 提取前6位作为时间标识
  const timePart = fundName.substring(0, 6);
  return timePart;
};

// 获取资金列表
const funds = computed(() => fundStore.funds)

// 获取候选人列表
const candidates = computed(() => candidateStore.candidates)

// 获取当前用户
const currentUser = computed(() => userStore.currentUser)


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

// 根据资金ID获取资金名称
const getFundNameById = (fundId) => {
  const fund = funds.value.find(f => f.id === fundId)
  return fund ? fund.name : '未知资金'
}

// 筛选后的候选人列表
const filteredCandidates = computed(() => {
  console.log('开始筛选候选人数据，当前状态:', activeTab.value, '搜索关键词:', searchKeyword.value)
  
  let filtered = [...candidates.value]
  
  // 根据标签页筛选
  if (activeTab.value !== 'all') {
    filtered = filtered.filter(candidate => candidate.interviewStatus === activeTab.value)
  }
  
  // 根据搜索关键词筛选
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    filtered = filtered.filter(candidate => 
      candidate.name.toLowerCase().includes(keyword) ||
      candidate.position.toLowerCase().includes(keyword) ||
      candidate.phone.includes(keyword) ||
      candidate.email.toLowerCase().includes(keyword)
    )
  }
  
  console.log('最终筛选结果数量:', filtered.length)
  return filtered
})

// 分页后的候选人列表
const paginatedCandidates = computed(() => {
  const candidates = filteredCandidates.value
  
  // 更新总数
  pagination.total = candidates.length
  
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
  formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        if (form.id) {
          // 编辑候选人
          const updatedData = {
            fundId: form.fundId,
            name: form.name,
            position: form.position,
            phone: form.phone,
            email: form.email,
            source: form.source,
            education: form.education,
            experience: form.experience,
            expectedSalary: form.expectedSalary,
            process: form.interviewStage,
            interviewStatus: form.interviewStatus,
            status: form.status
          };
          
          await candidateStore.updateCandidate(form.id, updatedData);
          ElMessage.success('编辑成功');
        } else {
          // 添加候选人
          const newCandidate = {
            fundId: form.fundId,
            name: form.name,
            position: form.position,
            phone: form.phone,
            email: form.email,
            source: form.source,
            education: form.education,
            experience: form.experience,
            expectedSalary: form.expectedSalary,
            process: form.interviewStage,
            interviewStatus: form.interviewStatus
          };
          
          await candidateStore.addCandidate(newCandidate);
          ElMessage.success('添加成功');
        }
        dialogVisible.value = false;
      } catch (error) {
        console.error('操作失败:', error);
        ElMessage.error('操作失败: ' + (error.message || '未知错误'));
      }
    }
  });
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

// 标签页切换
const handleTabChange = () => {
  pagination.currentPage = 1
}

// 搜索
const handleSearch = () => {
  pagination.currentPage = 1
}

// 查看详情
const handleViewDetail = (row) => {
  router.push({ name: 'CandidateDetail', params: { id: row.id } })
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
      await candidateStore.deleteCandidate(row.id);
      ElMessage.success('删除成功');
    } catch (error) {
      console.error('删除失败:', error);
      ElMessage.error('删除失败: ' + (error.message || '未知错误'));
    }
  }).catch(() => {
    // 取消删除
  })
}

// 页面加载时获取数据
onMounted(async () => {
  console.log('开始获取候选人数据...')
  loading.value = true
  
  try {
    // 获取资金列表
    console.log('开始获取资金数据...')
    fundStore.fetchFunds()
    
    // 获取候选人列表
    await candidateStore.fetchCandidates()
  } catch (error) {
    console.error('获取数据失败:', error)
    ElMessage.error('获取数据失败')
  } finally {
    loading.value = false
    console.log('候选人数据获取完成')
  }
})
</script>

<style scoped>
.candidate-list-container {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-actions {
  display: flex;
  align-items: center;
}

.dialog-footer {
  text-align: right;
}
</style>