const Layout = () => import('@/layout/index.vue')
const Card = () => import('@/views/card/index.vue')

export default [
  {
    path: '/card',
    component: Layout,
    name: 'Card',
    meta: {
      title: 'menu.card',
    },
    redirect: 'list',
    icon: 'OfficeBuilding',
    children: [
      {
        path: 'list',
        name: 'CardList',
        component: Card,
        meta: {
          title: 'menu.cardList',
          //  affix: true,  // 固定到tab页
        },
      },
    ],
  },
]
