import Layout from '@/layout/index.vue'

// 静态路由（无需权限）
export const constantRoutes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    hidden: true
  },
  {
    path: '/',
    component: Layout,
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/Dashboard.vue'),
        meta: { title: '首页', icon: 'dashboard' }
      }
    ]
  },
  {
    path: '/404',
    component: () => import('@/views/404.vue'),
    hidden: true
  }
]

// 异步路由（需要权限）
export const asyncRoutes = [
  {
    path: '/fund',
    component: Layout,
    meta: { title: '资金管理', icon: 'money' },
    children: [
      {
        path: 'list',
        name: 'FundList',
        component: () => import('@/views/FundList.vue'),
        meta: { title: '资金列表', roles: ['admin', 'finance'] }
      },
      {
        path: 'detail/:id',
        name: 'FundDetail',
        component: () => import('@/views/FundDetail.vue'),
        meta: { title: '资金详情', roles: ['admin', 'finance'] },
        hidden: true
      }
    ]
  },
  {
    path: '/candidate',
    component: Layout,
    meta: { title: '候选人管理', icon: 'user' },
    children: [
      {
        path: 'list',
        name: 'CandidateList',
        component: () => import('@/views/CandidateList.vue'),
        meta: { title: '候选人列表', roles: ['admin', 'hr', 'interviewer'] }
      },
      {
        path: 'detail/:id',
        name: 'CandidateDetail',
        component: () => import('@/views/CandidateDetail.vue'),
        meta: { title: '候选人详情', roles: ['admin', 'hr', 'interviewer'] },
        hidden: true
      },
      {
        path: 'schedule/:id',
        name: 'InterviewScheduler',
        component: () => import('@/views/InterviewScheduler.vue'),
        meta: { title: '安排面试', roles: ['admin', 'hr'] },
        hidden: true
      }
    ]
  },
  {
    path: '/system',
    component: Layout,
    meta: { title: '系统管理', icon: 'setting', roles: ['admin'] },
    children: [
      {
        path: 'user',
        name: 'UserManagement',
        component: () => import('@/views/system/UserManagement.vue'),
        meta: { title: '用户管理', roles: ['admin'] }
      },
      {
        path: 'role',
        name: 'RoleManagement',
        component: () => import('@/views/system/RoleManagement.vue'),
        meta: { title: '角色管理', roles: ['admin'] }
      },
      {
        path: 'profile',
        name: 'ProfileEdit',
        component: () => import('@/views/system/ProfileEdit.vue'),
        meta: { title: '个人资料', roles: ['admin', 'hr', 'finance', 'interviewer'] },
        hidden: true
      }
    ]
  }
]

// 404页面必须放在最后
export const notFoundRoute = { 
  path: '/:pathMatch(.*)*', 
  redirect: '/404', 
  hidden: true 
}