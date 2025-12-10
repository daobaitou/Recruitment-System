<template>
  <div class="fund-list-container">
    <el-card class="fund-list-card">
      <template #header>
        <div class="card-header">
          <span>资金列表</span>
          <el-button type="primary" size="large" @click="handleAddFund">
            添加资金
          </el-button>
        </div>
      </template>
      
      <el-table 
        :data="funds" 
        v-loading="loading"
        element-loading-text="加载中..."
        border
        stripe
        style="width: 100%"
      >
        <el-table-column prop="name" label="资金名称" min-width="150" align="center" />
        <el-table-column prop="platform" label="平台" min-width="120" align="center" />
        <el-table-column prop="position" label="招聘岗位" min-width="150" align="center" />
        <el-table-column prop="recharge_by_name" label="充值人" min-width="120" align="center">
          <template #default="{ row }">
            <span>{{ row.recharge_by_name || '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="amount" label="金额" min-width="120" align="center">
          <template #default="{ row }">
            ¥{{ formatCurrency(row.amount) }}
          </template>
        </el-table-column>
        <el-table-column prop="date" label="日期" min-width="120" align="center">
          <template #default="{ row }">
            {{ formatDate(row.date) }}
          </template>
        </el-table-column>
        <el-table-column prop="statusText" label="状态" min-width="120" align="center">
          <template #default="{ row }">
            <el-tag 
              :type="row.status === 'unused' ? 'info' : 
                     row.status === 'using' ? 'primary' : 
                     row.status === 'used' ? 'success' : 'danger'"
              size="large"
            >
              {{ row.statusText }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" min-width="250" align="center">
          <template #default="{ row }">
            <el-button size="large" type="primary" @click="handleEditFund(row)">编辑</el-button>
            <el-button size="large" @click="viewFundDetail(row)">查看</el-button>
            <el-button size="large" type="danger" @click="handleDeleteFund(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    
    <!-- 添加/编辑资金对话框 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="500px">
      <el-form :model="form" :rules="rules" ref="formRef" label-width="80px">
        <el-form-item label="资金名称" prop="name">
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item label="平台" prop="platform">
          <el-input v-model="form.platform" />
        </el-form-item>
        <el-form-item label="招聘岗位" prop="position">
          <el-input v-model="form.position" />
        </el-form-item>
        <el-form-item label="充值人" prop="rechargeByName">
          <el-input v-model="form.rechargeByName" placeholder="请输入充值人姓名" />
        </el-form-item>
        <el-form-item label="金额" prop="amount">
          <el-input v-model.number="form.amount" type="number">
            <template #prepend>¥</template>
          </el-input>
        </el-form-item>
        <el-form-item label="日期" prop="date">
          <el-date-picker
            v-model="form.date"
            type="date"
            value-format="YYYY-MM-DD"
            placeholder="选择日期"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="form.status" placeholder="请选择状态" style="width: 100%">
            <el-option label="未使用" value="unused" />
            <el-option label="使用中" value="using" />
            <el-option label="已用完" value="used" />
            <el-option label="已过期" value="expired" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button size="large" @click="dialogVisible = false">取消</el-button>
          <el-button size="large" type="primary" @click="submitForm">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useFundStore } from '@/stores/fund'

// 资金store
const fundStore = useFundStore()

// 路由
const router = useRouter()

// 响应式数据
const funds = ref([])
const loading = ref(false)
const dialogVisible = ref(false)
const dialogTitle = ref('')
const isEdit = ref(false)

// 表单数据
const form = reactive({
  id: null,
  name: '',
  platform: '',
  position: '',
  rechargeByName: '',
  amount: '',
  date: '',
  status: 'unused'
})

// 表单验证规则
const rules = {
  name: [{ required: true, message: '请输入资金名称', trigger: 'blur' }],
  platform: [{ required: true, message: '请输入平台', trigger: 'blur' }],
  position: [{ required: true, message: '请输入招聘岗位', trigger: 'blur' }],
  rechargeByName: [{ required: true, message: '请输入充值人姓名', trigger: 'blur' }],
  amount: [{ required: true, message: '请输入金额', trigger: 'blur' }],
  date: [{ required: true, message: '请选择日期', trigger: 'change' }],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }]
}

// 表单引用
const formRef = ref(null)

// 删除资金
const handleDeleteFund = (fund) => {
  ElMessageBox.confirm(
    `确定要删除资金 "${fund.name}" 吗？`,
    '确认删除',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    try {
      await fundStore.deleteFund(fund.id)
      ElMessage.success('资金删除成功')
      await loadFunds() // 重新加载列表
    } catch (error) {
      console.error('删除失败:', error)
      ElMessage.error('资金删除失败')
    }
  }).catch(() => {
    // 用户取消删除
  })
}

// 查看资金详情
const viewFundDetail = (fund) => {
  router.push(`/fund/detail/${fund.id}`)
}

// 重置表单
const resetForm = () => {
  form.id = null
  form.name = ''
  form.platform = ''
  form.position = ''
  form.rechargeByName = ''
  form.amount = ''
  form.date = ''
  form.status = 'unused'
}

// 添加资金
const handleAddFund = () => {
  dialogTitle.value = '添加资金'
  isEdit.value = false
  resetForm()
  dialogVisible.value = true
}

// 编辑资金
const handleEditFund = (fund) => {
  dialogTitle.value = '编辑资金'
  isEdit.value = true
  // 填充表单数据
  Object.assign(form, {
    id: fund.id,
    name: fund.name,
    platform: fund.platform,
    position: fund.position,
    rechargeByName: fund.recharge_by_name,
    amount: fund.amount,
    date: fund.date ? fund.date.split('T')[0] : '', // 格式化日期
    status: fund.status || 'unused'
  })
  dialogVisible.value = true
}

// 提交表单
const submitForm = async () => {
  try {
    await formRef.value.validate()
    
    const fundData = {
      name: form.name,
      platform: form.platform,
      position: form.position,
      rechargeByName: form.rechargeByName,
      amount: form.amount,
      date: form.date,
      status: form.status
    }
    
    if (isEdit.value) {
      // 编辑资金，确保传递ID
      await fundStore.updateFund({...fundData, id: form.id})
      ElMessage.success('资金更新成功')
    } else {
      // 添加资金
      await fundStore.createFund(fundData)
      ElMessage.success('资金添加成功')
    }
    
    dialogVisible.value = false
    await loadFunds() // 重新加载列表
  } catch (error) {
    console.error('操作失败:', error)
    ElMessage.error(isEdit.value ? '资金更新失败' : '资金添加失败')
  }
}

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN')
}

// 格式化货币
const formatCurrency = (amount) => {
  if (!amount) return '0.00'
  return new Intl.NumberFormat('zh-CN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount)
}

// 加载资金列表
const loadFunds = async () => {
  loading.value = true
  try {
    await fundStore.fetchFunds()
    funds.value = fundStore.funds
  } catch (error) {
    console.error('加载资金列表失败:', error)
    ElMessage.error('加载资金列表失败')
  } finally {
    loading.value = false
  }
}

// 组件挂载时加载数据
onMounted(() => {
  loadFunds()
})
</script>

<style scoped>
.fund-list-container {
  background-color: #f5f5f5;
  min-height: calc(100vh - 84px);
  padding: 20px;
}

.fund-list-card {
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.header-actions {
  margin-left: auto;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>