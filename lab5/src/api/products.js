export const API_DELAY = 1500
export const PAGE_SIZE = 12

export function createProductsUrl(query = '', skip = 0) {
  const search = query.trim()

  const params = new URLSearchParams({
    limit: String(PAGE_SIZE),
    skip: String(skip),
    delay: String(API_DELAY),
  })

  const path = search ? '/products/search' : '/products'

  if (search) {
    params.set('q', search)
  }

  return `https://dummyjson.com${path}?${params.toString()}`
}

// Тимчасово залишаємо для поточного підключення в App.vue.
export function createInitialProductsUrl() {
  return createProductsUrl()
}