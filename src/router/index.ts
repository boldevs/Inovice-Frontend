// src/router/index.ts
import { createRouter, createWebHistory, type NavigationGuardNext, type RouteLocationNormalized } from 'vue-router';
import Dashboard from '../pages/Dashboard.vue';
import Product from '../pages/product/Product.vue';
import Customer from '../pages/customer/Customer.vue';
import DefaultLayout from '../layouts/DefaultLayout.vue';
import Sale from '../pages/sale/Sale.vue';
import Login from '../pages/Login.vue';
import { getToken } from '../utils/api';

const routes = [
  {
    path: '/',
    component: DefaultLayout,
    meta: { requiresAuth: true },
    children: [
      { path: '', component: Dashboard, name: 'Dashboard' },
      { path: 'products', component: Product, name: 'Products' }, 
      { path: 'customers', component: Customer, name: 'customers' }, 
      { path: 'sales', component: Sale, name: 'sales' }, 
    ],
    
  },
  {
    path: '/login',
    component: Login,
    name: 'Login',
  },
  { path: '/:pathMatch(.*)*', redirect: '/login' },
];


const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to: RouteLocationNormalized, from: RouteLocationNormalized, next: NavigationGuardNext) => {
  const isAuthenticated = !!getToken();

  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/login');
  } else if (to.path === '/login' && isAuthenticated) {
    next('/');
  } else {
    next();
  }
});

export default router;