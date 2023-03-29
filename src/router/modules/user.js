const Layout = () => import('@/layout/index.vue')
const User = () => import('@/views/user/index.vue')

export default [
  {
    path: '/user',
    component: Layout,
    name: 'User',
    meta: {
      title: 'menu.user',
    },
    redirect: 'list',
    icon: 'Avatar',
    children: [
      {
        path: 'list',
        name: 'UserList',
        component: User,
        meta: {
          title: 'menu.userList',
          //  affix: true,  // 固定到tab页
        },
      },
    ],
  },
]
