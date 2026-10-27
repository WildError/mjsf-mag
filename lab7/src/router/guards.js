import { watch } from 'vue'
import { useAuthStore } from '../stores/auth.js'
import { useProductsStore } from '../stores/products.js'

export function safeRedirect(router, value) {
  if (typeof value !== 'string' || !value.startsWith('/') ||
      value.startsWith('//') || /[\\\u0000-\u0020]/.test(value)) return { name: 'manage-products' }
  const target = router.resolve(value)
  return ['manage-products', 'manage-edit'].includes(target.name)
    ? target.fullPath : { name: 'manage-products' }
}

export function installGuards(router, pinia) {
  const auth = useAuthStore(pinia)
  useProductsStore(pinia)
  router.beforeEach(async to => {
    await auth.restore()
    if (to.meta.requiresAuth && !auth.isAuthenticated)
      return { name: 'login', query: { redirect: to.fullPath } }
  })
  // beforeEach не реагує на втрату сеансу без навігації.
  watch(() => auth.status, status => {
    const route = router.currentRoute.value
    if (status !== 'guest' || !route.meta.requiresAuth) return
    const target = auth.endReason === 'expired'
      ? { name: 'login', query: { redirect: route.fullPath } }
      : { name: 'products' }
    void router.replace(target)
  }, { flush: 'sync' })
}
