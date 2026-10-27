export const EDIT_FIELDS = ['title', 'price', 'stock', 'description']
export function validProductId(id) {
  return typeof id === 'string' && /^[1-9]\d*$/.test(id) && Number.isSafeInteger(Number(id))
}
export function makeDraft(product) {
  return Object.fromEntries(EDIT_FIELDS.map(key => [key, String(product?.[key] ?? '')]))
}
export function validateDraft(draft) {
  const title = String(draft.title ?? '').trim()
  const description = String(draft.description ?? '').trim()
  const rawPrice = String(draft.price ?? '').trim()
  const rawStock = String(draft.stock ?? '').trim()
  const price = Number(rawPrice)
  const stock = Number(rawStock)
  const errors = {}
  if (!title || title.length > 120) errors.title = 'Введіть назву від 1 до 120 символів.'
  if (!rawPrice || !Number.isFinite(price) || price <= 0) errors.price = 'Ціна має бути числом більшим за 0.'
  if (!rawStock || !Number.isInteger(stock) || stock < 0) errors.stock = 'Залишок має бути цілим числом від 0.'
  if (!description || description.length > 2000) errors.description = 'Введіть опис від 1 до 2000 символів.'
  return { values: { title, price, stock, description }, errors, valid: !Object.keys(errors).length }
}
