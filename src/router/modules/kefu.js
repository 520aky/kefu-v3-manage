const Layout = () => import('@/layout/index.vue')
const KeFu = () => import('@/views/kefu/index.vue')

export default [
  {
    path: '/kefu',
    component: Layout,
    name: 'KeFu',
    meta: {
      title: 'menu.kefu',
    },
    redirect: 'list',
    icon: 'UserFilled',
    children: [
      {
        path: 'list',
        name: 'KeFuList',
        component: KeFu,
        meta: {
          title: 'menu.kefuList',
          //  affix: true,  // 固定到tab页
        },
      },
    ],
  },
]
