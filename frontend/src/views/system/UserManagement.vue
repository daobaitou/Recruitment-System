<template>
  <div class="user-management full-screen">
    <el-card class="box-card full-height-card">
      <template #header>
        <div class="card-header">
          <span class="header-title">用户管理</span>
          <el-button type="primary" size="large" @click="handleAddUser">添加用户</el-button>
        </div>
      </template>
      
      <el-table 
        :data="users" 
        style="width: 100%" 
        v-loading="loading"
        class="enlarged-table"
        :cell-style="{ padding: '15px 0' }"
        :header-cell-style="{ padding: '15px 0', fontWeight: 'bold' }"
      >
        <el-table-column prop="id" label="ID" width="100" />
        <el-table-column prop="username" label="用户名" width="150">
          <template #default="scope">
            <span style="font-size: 16px">{{ scope.row.username }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="name" label="姓名" width="150">
          <template #default="scope">
            <span style="font-size: 16px">{{ scope.row.name }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="email" label="邮箱" width="200">
          <template #default="scope">
            <span style="font-size: 16px">{{ scope.row.email }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="phone" label="联系电话" width="150">
          <template #default="scope">
            <span style="font-size: 16px">{{ scope.row.phone }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="roleNames" label="角色" width="200">
          <template #default="scope">
            <span style="font-size: 16px">{{ scope.row.roleNames }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="120">
          <template #default="scope">
            <el-tag :type="scope.row.status === 1 ? 'success' : 'danger'" size="large">
              {{ scope.row.status === 1 ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template #default="scope">
            <el-button size="large" @click="handleEdit(scope.row)">编辑</el-button>
            <el-button 
              size="large" 
              :type="scope.row.status === 1 ? 'danger' : 'success'"
              @click="handleToggleStatus(scope.row)"
            >
              {{ scope.row.status === 1 ? '禁用' : '启用' }}
            </el-button>
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
    
    <!-- 用户编辑对话框 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="500px">
      <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="form.username" :disabled="!!form.id" />
        </el-form-item>
        <el-form-item label="姓名" prop="name">
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="form.email" />
        </el-form-item>
        <el-form-item label="联系电话" prop="phone">
          <el-input v-model="form.phone" />
        </el-form-item>
        <el-form-item label="角色" prop="roles">
          <el-select v-model="form.roles" multiple placeholder="请选择角色">
            <el-option
              v-for="item in roleOptions"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-switch
            v-model="form.status"
            :active-value="1"
            :inactive-value="0"
            active-text="启用"
            inactive-text="禁用"
          />
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
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// 模拟数据
const users = ref([
  {
    id: 1,
    username: 'admin',
    name: '管理员',
    email: 'admin@example.com',
    phone: '13800138000',
    roleNames: '管理员',
    roles: [1],
    status: 1
  },
  {
    id: 2,
    username: 'hr001',
    name: '人事专员',
    email: 'hr@example.com',
    phone: '13800138001',
    roleNames: '人事专员',
    roles: [2],
    status: 1
  },
  {
    id: 3,
    username: 'finance001',
    name: '财务专员',
    email: 'finance@example.com',
    phone: '13800138002',
    roleNames: '财务专员',
    roles: [3],
    status: 1
  }
])

const roleOptions = ref([
  { id: 1, name: '管理员' },
  { id: 2, name: '人事专员' },
  { id: 3, name: '财务专员' },
  { id: 4, name: '面试官' }
])

const loading = ref(false)
const dialogVisible = ref(false)
const dialogTitle = ref('')

const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 3
})

const form = reactive({
  id: undefined,
  username: '',
  name: '',
  email: '',
  phone: '',
  roles: [],
  status: 1
})

const rules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱地址', trigger: ['blur', 'change'] }
  ],
  phone: [
    { required: true, message: '请输入联系电话', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: ['blur', 'change'] }
  ],
  roles: [{ required: true, message: '请选择角色', trigger: 'change' }]
}

const formRef = ref()

// 添加用户
const handleAddUser = () => {
  dialogTitle.value = '添加用户'
  resetForm()
  dialogVisible.value = true
}

// 编辑用户
const handleEdit = (row) => {
  dialogTitle.value = '编辑用户'
  Object.assign(form, row)
  dialogVisible.value = true
}

// 提交表单
const submitForm = () => {
  formRef.value.validate((valid) => {
    if (valid) {
      if (form.id) {
        // 编辑用户
        const index = users.value.findIndex(user => user.id === form.id)
        if (index !== -1) {
          users.value[index] = { ...form }
        }
        ElMessage.success('编辑成功')
      } else {
        // 添加用户
        form.id = users.value.length + 1
        form.roleNames = form.roles.map(roleId => {
          const role = roleOptions.value.find(r => r.id === roleId)
          return role ? role.name : ''
        }).join(', ')
        users.value.push({ ...form })
        ElMessage.success('添加成功')
      }
      dialogVisible.value = false
    }
  })
}

// 切换用户状态
const handleToggleStatus = (row) => {
  const action = row.status === 1 ? '禁用' : '启用'
  ElMessageBox.confirm(`确定要${action}用户"${row.name}"吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    row.status = row.status === 1 ? 0 : 1
    ElMessage.success(`${action}成功`)
  }).catch(() => {
    // 取消操作
  })
}

// 删除用户
const handleDelete = (row) => {
  ElMessageBox.confirm(`确定要删除用户"${row.name}"吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    const index = users.value.findIndex(user => user.id === row.id)
    if (index !== -1) {
      users.value.splice(index, 1)
      ElMessage.success('删除成功')
    }
  }).catch(() => {
    // 取消操作
  })
}

// 重置表单
const resetForm = () => {
  Object.assign(form, {
    id: undefined,
    username: '',
    name: '',
    email: '',
    phone: '',
    roles: [],
    status: 1
  })
}

// 分页相关方法
const handleSizeChange = (val) => {
  pagination.pageSize = val
}

const handleCurrentChange = (val) => {
  pagination.currentPage = val
}

onMounted(() => {
  // 页面加载时可以获取真实数据
})
</script>

<style scoped>
.user-management.full-screen {
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