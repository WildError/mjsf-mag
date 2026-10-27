import { createRouter, createWebHistory } from 'vue-router'

import ProductsLayout from '../layouts/ProductsLayout.vue'
import ProductLayout from '../layouts/ProductLayout.vue'

import ProductCatalogView from '../views/ProductCatalogView.vue'
import ProductOverviewView from '../views/ProductOverviewView.vue'
import ProductReviewsView from '../views/ProductReviewsView.vue'
import AboutView from '../views/AboutView.vue'
import NotFoundView from '../views/NotFoundView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),

  routes: [
    {
      path: '/',
      redirect: { name: 'products' },
    },
    {
      path: '/products',
      component: ProductsLayout,
      meta: {
        breadcrumb: {
          label: 'Каталог',
          name: 'products',
        },
      },
      children: [
        {
          path: '',
          name: 'products',
          component: ProductCatalogView,
        },
        {
          path: ':id',
          component: ProductLayout,
          meta: {
            breadcrumb: {
              dynamic: 'product',
              name: 'product-overview',
            },
          },
          children: [
            {
              path: '',
              name: 'product-overview',
              component: ProductOverviewView,
            },
            {
              path: 'reviews',
              name: 'product-reviews',
              component: ProductReviewsView,
              meta: {
                breadcrumb: {
                  label: 'Відгуки',
                  name: 'product-reviews',
                },
              },
            },
          ],
        },
      ],
    },
    {
      path: '/about',
      name: 'about',
      component: AboutView,
      meta: {
        breadcrumb: {
          label: 'Про застосунок',
          name: 'about',
        },
      },
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: NotFoundView,
      meta: {
        breadcrumb: {
          label: 'Сторінку не знайдено',
          name: 'not-found',
        },
      },
    },
  ],
})

export default router