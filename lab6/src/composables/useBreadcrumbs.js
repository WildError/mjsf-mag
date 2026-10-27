import { computed, toValue } from 'vue'
import { useRoute } from 'vue-router'

export function useBreadcrumbs(productTitle = undefined) {
  const route = useRoute()

  return computed(() => {
    const title = toValue(productTitle)

    const query = typeof route.query.q === 'string'
      ? { q: route.query.q }
      : {}

    return route.matched
      .filter((record) => record.meta.breadcrumb)
      .map((record) => {
        const breadcrumb = record.meta.breadcrumb

        const label = breadcrumb.dynamic === 'product'
          ? title || `Товар №${route.params.id}`
          : breadcrumb.label

        const to = {
          name: breadcrumb.name,
          query,
        }

        if (
          breadcrumb.name === 'product-overview' ||
          breadcrumb.name === 'product-reviews'
        ) {
          to.params = { id: route.params.id }
        }

        return { label, to }
      })
  })
}