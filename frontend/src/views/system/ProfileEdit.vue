<template>
  <div class="profile-edit-container">
    <el-page-header @back="goBack" content="编辑个人资料" class="page-header" />
    
    <el-card class="profile-card">
      <el-form 
        :model="profileForm" 
        :rules="rules" 
        ref="formRef" 
        label-width="100px"
        class="profile-form"
      >
        <el-form-item label="用户名" prop="username">
          <el-input v-model="profileForm.username" disabled />
        </el-form-item>
        
        <el-form-item label="姓名" prop="name">
          <el-input v-model="profileForm.name" />
        </el-form-item>
        
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="profileForm.email" />
        </el-form-item>
        
        <el-form-item label="联系电话" prop="phone">
          <el-input v-model="profileForm.phone" />
        </el-form-item>
        
        <el-form-item label="角色">
          <el-tag v-for="role in profileForm.roles" :key="role" style="margin-right: 10px;">
            {{ role }}
          </el-tag>
        </el-form-item>
        
        <el-form-item>
          <el-button type="primary" @click="submitForm" :loading="loading">保存</el-button>
          <el-button @click="resetForm">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()

const formRef = ref()
const loading = ref(false)

const profileForm = reactive({
  username: '',
  name: '',
  email: '',
  phone: '',
  roles: []
})

const rules = {
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱地址', trigger: ['blur', 'change'] }
  ],
  phone: [
    { required: true, message: '请输入联系电话', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: ['blur', 'change'] }
  ]
}

// 返回上一页
const goBack = () => {
  router.go(-1)
}

// 提交表单
const submitForm = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        // 更新用户信息
        await userStore.updateUserInfo({
          name: profileForm.name,
          email: profileForm.email,
          phone: profileForm.phone
        })
        ElMessage.success('个人信息更新成功')
        router.go(-1)
      } catch (error) {
        console.error('更新失败:', error)
        ElMessage.error('更新失败: ' + (error.message || '未知错误'))
      } finally {
        loading.value = false
      }
    }
  })
}

// 重置表单
const resetForm = () => {
  profileForm.name = userStore.userName
  profileForm.email = userStore.userEmail
  profileForm.phone = userStore.userPhone
}

// 页面加载时初始化表单数据
onMounted(() => {
  profileForm.username = userStore.userName
  profileForm.name = userStore.userName
  profileForm.email = userStore.userEmail
  profileForm.phone = userStore.userPhone
  profileForm.roles = userStore.userRoles
})
</script>

<style scoped>
.profile-edit-container {
  padding: 20px;
}

.page-header {
  margin-bottom: 20px;
}

.profile-card {
  max-width: 600px;
}

.profile-form {
  margin-top: 20px;
}
</style>