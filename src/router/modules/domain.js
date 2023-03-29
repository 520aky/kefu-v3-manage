const Layout = () => import('@/layout/index.vue')
const Domain = () => import('@/views/domain/index.vue')

export default [
  {
    path: '/domain',
    component: Layout,
    name: 'Domain',
    meta: {
      title: 'menu.domain',
    },
    redirect: 'list',
    icon: 'Management',
    children: [
      {
        path: 'list',
        name: 'DomainList',
        component: Domain,
        meta: {
          title: 'menu.domainList',
          //  affix: true,  // 固定到tab页
        },
      },
    ],
  },
]
