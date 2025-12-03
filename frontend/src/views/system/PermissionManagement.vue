<template>
  <div class="permission-management full-screen">
    <el-card class="box-card full-height-card">
      <template #header>
        <div class="card-header">
          <span class="header-title">权限管理</span>
          <el-button type="primary" size="large" @click="handleAddPermission">添加权限</el-button>
        </div>
      </template>
      
      <el-table 
        :data="permissions" 
        style="width: 100%" 
        v-loading="loading"
        class="enlarged-table"
        :cell-style="{ padding: '15px 0' }"
        :header-cell-style="{ padding: '15px 0', fontWeight: 'bold' }"
      >
        <el-table-column prop="id" label="ID" width="100" />
        <el-table-column prop="name" label="权限名称" width="200">
          <template #default="scope">
            <span style="font-size: 16px">{{ scope.row.name }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="description" label="描述" width="300">
          <template #default="scope">
            <span style="font-size: 16px">{{ scope.row.description }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="resource" label="资源" width="200">
          <template #default="scope">
            <span style="font-size: 16px">{{ scope.row.resource }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="action" label="操作" width="150">
          <template #default="scope">
            <span style="font-size: 16px">{{ scope.row.action }}</span>
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
    
    <!-- 权限编辑对话框 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="500px">
      <el-form :model="form" :rules="rules" ref="formRef" label-width="80px">
        <el-form-item label="权限名称" prop="name">
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item label="权限编码" prop="code">
          <el-input v-model="form.code" />
        </el-form-item>
        <el-form-item label="父级权限">
          <el-select v-model="form.parentId" placeholder="请选择父级权限" clearable>
            <el-option
              v-for="perm in parentPermissions"
              :key="perm.id"
              :label="perm.name"
              :value="perm.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="描述">
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
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// 模拟数据
const permissions = ref([
  {
    id: 1,
    name: '系统管理',
    code: 'system',
    description: '系统管理模块',
    parentId: null,
    children: [
      {
        id: 11,
        name: '用户管理',
        code: 'system:user',
        description: '用户管理',
        parentId: 1
      },
      {
        id: 12,
        name: '角色管理',
        code: 'system:role',
        description: '角色管理',
        parentId: 1
      },
      {
        id: 13,
        name: '权限管理',
        code: 'system:permission',
        description: '权限管理',
        parentId: 1
      }
    ]
  },
  {
    id: 2,
    name: '资金管理',
    code: 'fund',
    description: '资金管理模块',
    parentId: null,
    children: [
      {
        id: 21,
        name: '资金明细',
        code: 'fund:list',
        description: '资金明细',
        parentId: 2
      }
    ]
  },
  {
    id: 3,
    name: '候选人管理',
    code: 'candidate',
    description: '候选人管理模块',
    parentId: null,
    children: [
      {
        id: 31,
        name: '候选人列表',
        code: 'candidate:list',
        description: '候选人列表',
        parentId: 3
      },
      {
        id: 32,
        name: '候选人详情',
        code: 'candidate:detail',
        description: '候选人详情',
        parentId: 3
      }
    ]
  }
])

const loading = ref(false)
const dialogVisible = ref(false)
const dialogTitle = ref('')

// 分页数据
const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 3
})

const form = reactive({
  id: undefined,
  name: '',
  code: '',
  parentId: null,
  description: ''
})

const rules = {
  name: [{ required: true, message: '请输入权限名称', trigger: 'blur' }],
  code: [{ required: true, message: '请输入权限编码', trigger: 'blur' }]
}

const formRef = ref()

// 计算属性：可用于父级权限选项的数据
const parentPermissions = computed(() => {
  // 只有一级权限可以作为父级权限
  return permissions.value.filter(perm => !perm.parentId)
})

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

// 添加权限
const handleAddPermission = () => {
  dialogTitle.value = '添加权限'
  resetForm()
  dialogVisible.value = true
}

// 编辑权限
const handleEdit = (row) => {
  dialogTitle.value = '编辑权限'
  Object.assign(form, row)
  dialogVisible.value = true
}

// 提交表单
const submitForm = () => {
  formRef.value.validate((valid) => {
    if (valid) {
      if (form.id) {
        // 编辑权限
        updatePermission(form)
        ElMessage.success('编辑成功')
      } else {
        // 添加权限
        addPermission(form)
        ElMessage.success('添加成功')
      }
      dialogVisible.value = false
    }
  })
}

// 添加权限的辅助函数
const addPermission = (perm) => {
  if (perm.parentId) {
    // 添加子权限
    const parent = findPermission(permissions.value, perm.parentId)
    if (parent) {
      if (!parent.children) {
        parent.children = []
      }
      perm.id = getNextId()
      parent.children.push(perm)
    }
  } else {
    // 添加一级权限
    perm.id = getNextId()
    permissions.value.push(perm)
  }
}

// 更新权限的辅助函数
const updatePermission = (perm) => {
  if (perm.parentId) {
    // 更新子权限
    const parent = findPermission(permissions.value, perm.parentId)
    if (parent && parent.children) {
      const index = parent.children.findIndex(p => p.id === perm.id)
      if (index !== -1) {
        parent.children[index] = { ...perm }
      }
    }
  } else {
    // 更新一级权限
    const index = permissions.value.findIndex(p => p.id === perm.id)
    if (index !== -1) {
      const oldPerm = permissions.value[index]
      perm.children = oldPerm.children // 保留子权限
      permissions.value[index] = { ...perm }
    }
  }
}

// 查找权限的辅助函数
const findPermission = (perms, id) => {
  for (let perm of perms) {
    if (perm.id === id) {
      return perm
    }
    if (perm.children) {
      const found = findPermission(perm.children, id)
      if (found) {
        return found
      }
    }
  }
  return null
}

// 获取下一个可用ID的辅助函数
const getNextId = () => {
  let maxId = 0
  const traverse = (perms) => {
    perms.forEach(perm => {
      if (perm.id > maxId) {
        maxId = perm.id
      }
      if (perm.children) {
        traverse(perm.children)
      }
    })
  }
  traverse(permissions.value)
  return maxId + 1
}

// 删除权限
const handleDelete = (row) => {
  ElMessageBox.confirm(`确定要删除权限"${row.name}"吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    deletePermission(permissions.value, row.id)
    ElMessage.success('删除成功')
  }).catch(() => {
    // 取消操作
  })
}

// 删除权限的辅助函数
const deletePermission = (perms, id) => {
  const index = perms.findIndex(p => p.id === id)
  if (index !== -1) {
    perms.splice(index, 1)
    return
  }
  
  for (let perm of perms) {
    if (perm.children) {
      deletePermission(perm.children, id)
    }
  }
}

// 重置表单
const resetForm = () => {
  Object.assign(form, {
    id: undefined,
    name: '',
    code: '',
    parentId: null,
    description: ''
  })
}

onMounted(() => {
  // 页面加载时可以获取真实数据
})
</script>

<style scoped>
.permission-management.full-screen {
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