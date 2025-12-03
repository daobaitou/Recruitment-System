<template>
  <div class="role-management full-screen">
    <el-card class="box-card full-height-card">
      <template #header>
        <div class="card-header">
          <span class="header-title">角色管理</span>
          <el-button type="primary" size="large" @click="handleAddRole">添加角色</el-button>
        </div>
      </template>
      
      <el-table 
        :data="roles" 
        style="width: 100%" 
        v-loading="loading"
        class="enlarged-table"
        :cell-style="{ padding: '15px 0' }"
        :header-cell-style="{ padding: '15px 0', fontWeight: 'bold' }"
      >
        <el-table-column prop="id" label="ID" width="100" />
        <el-table-column prop="name" label="角色名称" width="200">
          <template #default="scope">
            <span style="font-size: 16px">{{ scope.row.name }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="description" label="描述" width="300">
          <template #default="scope">
            <span style="font-size: 16px">{{ scope.row.description }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="permissions" label="权限" width="300">
          <template #default="scope">
            <el-tag 
              v-for="permission in scope.row.permissions" 
              :key="permission.id"
              size="large"
              style="margin-right: 8px; font-size: 14px;"
            >
              {{ permission.name }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template #default="scope">
            <el-button size="large" @click="handleEdit(scope.row)">编辑</el-button>
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
    
    <!-- 角色编辑对话框 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="500px">
      <el-form :model="form" :rules="rules" ref="formRef" label-width="80px">
        <el-form-item label="角色名称" prop="name">
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input v-model="form.description" type="textarea" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitForm">确定</el-button>
        </span>
      </template>
    </el-dialog>
    
    <!-- 权限配置对话框 -->
    <el-dialog v-model="permissionDialogVisible" title="权限配置" width="600px">
      <el-tree
        ref="treeRef"
        :data="permissions"
        show-checkbox
        node-key="id"
        :props="defaultProps"
        :default-checked-keys="checkedPermissions"
      />
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="permissionDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitPermission">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// 模拟数据
const roles = ref([
  {
    id: 1,
    name: '管理员',
    description: '系统管理员，拥有所有权限',
    userCount: 1,
    permissions: [
      { id: 1, name: '用户管理' },
      { id: 2, name: '角色管理' },
      { id: 3, name: '权限管理' }
    ]
  },
  {
    id: 2,
    name: '人事专员',
    description: '负责候选人管理和面试安排',
    userCount: 3,
    permissions: [
      { id: 4, name: '候选人管理' },
      { id: 5, name: '面试管理' }
    ]
  },
  {
    id: 3,
    name: '财务专员',
    description: '负责资金管理和报销审核',
    userCount: 2,
    permissions: [
      { id: 6, name: '资金管理' },
      { id: 7, name: '报销审核' }
    ]
  }
])

const permissions = ref([
  {
    id: 1,
    label: '系统管理',
    children: [
      {
        id: 11,
        label: '用户管理'
      },
      {
        id: 12,
        label: '角色管理'
      },
      {
        id: 13,
        label: '权限管理'
      }
    ]
  },
  {
    id: 2,
    label: '资金管理',
    children: [
      {
        id: 21,
        label: '资金明细'
      }
    ]
  },
  {
    id: 3,
    label: '候选人管理',
    children: [
      {
        id: 31,
        label: '候选人列表'
      },
      {
        id: 32,
        label: '候选人详情'
      }
    ]
  }
])

// 分页数据
const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 3
})

const defaultProps = {
  children: 'children',
  label: 'label'
}

const loading = ref(false)
const dialogVisible = ref(false)
const permissionDialogVisible = ref(false)
const dialogTitle = ref('')
const checkedPermissions = ref([])
const currentRoleId = ref(null)

const treeRef = ref()

const form = reactive({
  id: undefined,
  name: '',
  description: ''
})

const rules = {
  name: [{ required: true, message: '请输入角色名称', trigger: 'blur' }]
}

const formRef = ref()

// 处理分页大小改变
const handleSizeChange = (val) => {
  pagination.pageSize = val
  console.log('页面大小改变:', val)
}

// 处理当前页改变
const handleCurrentChange = (val) => {
  pagination.currentPage = val
  console.log('当前页改变:', val)
}

// 添加角色
const handleAddRole = () => {
  dialogTitle.value = '添加角色'
  resetForm()
  dialogVisible.value = true
}

// 编辑角色
const handleEdit = (row) => {
  dialogTitle.value = '编辑角色'
  Object.assign(form, row)
  dialogVisible.value = true
}

// 权限配置
const handlePermission = (row) => {
  currentRoleId.value = row.id
  // 模拟已选中的权限
  checkedPermissions.value = [1, 11, 12]
  permissionDialogVisible.value = true
}

// 提交表单
const submitForm = () => {
  formRef.value.validate((valid) => {
    if (valid) {
      if (form.id) {
        // 编辑角色
        const index = roles.value.findIndex(role => role.id === form.id)
        if (index !== -1) {
          roles.value[index] = { ...form }
        }
        ElMessage.success('编辑成功')
      } else {
        // 添加角色
        form.id = roles.value.length + 1
        form.userCount = 0
        roles.value.push({ ...form })
        ElMessage.success('添加成功')
      }
      dialogVisible.value = false
    }
  })
}

// 提交权限配置
const submitPermission = () => {
  const checkedNodes = treeRef.value.getCheckedNodes(false, true)
  console.log('为角色ID', currentRoleId.value, '设置权限:', checkedNodes)
  ElMessage.success('权限配置成功')
  permissionDialogVisible.value = false
}

// 删除角色
const handleDelete = (row) => {
  if (row.userCount > 0) {
    ElMessage.warning('该角色下有关联用户，不能删除')
    return
  }
  
  ElMessageBox.confirm(`确定要删除角色"${row.name}"吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    const index = roles.value.findIndex(role => role.id === row.id)
    if (index !== -1) {
      roles.value.splice(index, 1)
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
    name: '',
    description: ''
  })
}

onMounted(() => {
  // 页面加载时可以获取真实数据
})
</script>

<style scoped>
.role-management.full-screen {
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