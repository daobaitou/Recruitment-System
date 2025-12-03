<template>
  <div class="fund-list-container">
    <el-card class="fund-list-card">
      <template #header>
        <div class="card-header">
          <span>资金明细</span>
          <div class="header-actions">
            <el-button type="primary" size="large" @click="handleAddFund" style="margin-left: auto">添加资金</el-button>
          </div>
        </div>
      </template>
      
      <el-table 
        :data="funds" 
        style="width: 100%" 
        v-loading="loading" 
        :cell-style="{ padding: '15px 0' }" 
        :header-cell-style="{ padding: '15px 0', fontWeight: 'bold' }"
        :row-style="{ height: '60px' }"
        :header-row-style="{ height: '60px' }"
      >
        <el-table-column prop="name" label="资金名称" min-width="150">
          <template #default="scope">
            <span style="font-size: 16px;">{{ scope.row.name }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="platform" label="平台" min-width="150">
          <template #default="scope">
            <span style="font-size: 16px;">{{ scope.row.platform }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="position" label="招聘岗位" min-width="180">
          <template #default="scope">
            <span style="font-size: 16px;">{{ scope.row.position }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="rechargeByName" label="充值人" min-width="120">
          <template #default="scope">
            <span style="font-size: 16px;">{{ scope.row.rechargeByName }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="amount" label="金额" min-width="120" align="center">
          <template #default="scope">
            <span style="font-size: 18px; font-weight: bold; color: #409eff">¥{{ scope.row.amount }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="date" label="日期" min-width="140" align="center">
          <template #default="scope">
            <span style="font-size: 16px;">{{ scope.row.date }}</span>
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
          <el-button size="large" type="primary" @click="handleSubmit">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useFundStore } from '@/stores/fund'

const fundStore = useFundStore()
const router = useRouter()

// 表单引用
const formRef = ref(null)

// 对话框状态
const dialogVisible = ref(false)
const dialogTitle = ref('')
const isEditing = ref(false)

// 表单数据 - 使用 reactive 替代 ref 包装对象
const form = reactive({
  id: null,
  name: '',
  platform: '',
  position: '',
  rechargeByName: '',
  amount: null,
  date: '',
  status: 'unused'
})

// 表单验证规则
const rules = {
  name: [{ required: true, message: '请输入资金名称', trigger: 'blur' }],
  platform: [{ required: true, message: '请输入平台名称', trigger: 'blur' }],
  position: [{ required: true, message: '请输入招聘岗位', trigger: 'blur' }],
  rechargeByName: [{ required: true, message: '请输入充值人', trigger: 'blur' }],
  amount: [{ required: true, message: '请输入金额', trigger: 'blur' }],
  date: [{ required: true, message: '请选择日期', trigger: 'change' }],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }]
}

// 资金列表
const funds = computed(() => fundStore.funds)
const loading = computed(() => fundStore.loading)

// 状态标签类型映射 - 已整合到模板中，移除此函数
// 获取状态文本（用于在列表中显示）
const getStatusText = (status) => {
  switch (status) {
    case 'unused': return '未使用'
    case 'using': return '使用中'
    case 'used': return '已用完'
    case 'expired': return '已过期'
    default: return '未知'
  }
}

// 删除资金
const handleDeleteFund = async (fund) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除 ${fund.name} 这笔资金吗？`,
      '警告',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    await fundStore.deleteFund(fund.id)
    ElMessage.success('删除成功')
    await fundStore.fetchFunds()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除失败:', error)
      ElMessage.error('删除失败')
    }
  }
}

// 查看资金详情
const viewFundDetail = (fund) => {
  router.push(`/fund/detail/${fund.id}`)
}

// 添加资金
const handleAddFund = () => {
  dialogTitle.value = '添加资金'
  isEditing.value = false
  resetForm()
  dialogVisible.value = true
}

// 编辑资金
const handleEditFund = (fund) => {
  dialogTitle.value = '编辑资金'
  isEditing.value = true
  Object.assign(form, fund)
  dialogVisible.value = true
}

// 重置表单
const resetForm = () => {
  Object.assign(form, {
    id: null,
    name: '',
    platform: '',
    position: '',
    rechargeByName: '',
    amount: null,
    date: '',
    status: 'unused'
  })
}

// 提交表单
const handleSubmit = async () => {
  await formRef.value.validate(async (valid) => {
    if (!valid) return
  
    try {
      // 确保日期格式正确
      let formattedDate = form.date;
      if (form.date && typeof form.date === 'object') {
        // 如果是Date对象，格式化为YYYY-MM-DD
        formattedDate = form.date.toISOString().split('T')[0];
      } else if (form.date && typeof form.date === 'string' && form.date.includes('T')) {
        // 如果是ISO字符串，提取日期部分
        formattedDate = form.date.split('T')[0];
      }
      
      const fundData = {
        name: form.name,
        platform: form.platform,
        position: form.position,
        rechargeBy: form.rechargeBy || null,
        rechargeByName: form.rechargeByName,
        amount: form.amount,
        date: formattedDate,
        status: form.status
      }

      if (isEditing.value) {
        // 编辑资金
        await fundStore.updateFund({
          ...fundData,
          id: form.id
        })
        ElMessage.success('更新资金成功')
      } else {
        // 添加资金
        await fundStore.createFund(fundData)
        ElMessage.success('添加资金成功')
      }
      
      dialogVisible.value = false
      await fundStore.fetchFunds()
    } catch (error) {
      console.error('操作失败:', error)
      ElMessage.error(isEditing.value ? '更新资金失败' : '添加资金失败')
    }
  })
}

// 加载资金列表
const loadFunds = async () => {
  try {
    await fundStore.fetchFunds()
  } catch (error) {
    console.error('加载资金列表失败:', error)
    ElMessage.error('加载资金列表失败')
  }
}

// 初始化
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