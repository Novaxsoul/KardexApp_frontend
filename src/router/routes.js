
const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '/category', name:"Category", component: () => import('pages/Category.vue') }, 
      { path: '/product', name:"Product", component: () => import('pages/Product.vue') },
      { path: '/kardex', name:"Kardex", component: () => import('pages/Kardex.vue') }
    ]
  }
]

// Always leave this as last one
if (process.env.MODE !== 'ssr') {
  routes.push({
    path: '*',
    component: () => import('pages/Error404.vue')
  })
}

export default routes
