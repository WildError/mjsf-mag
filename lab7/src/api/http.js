export const API_BASE = 'https://dummyjson.com'

export class HttpError extends Error {
  constructor(message, status) {
    super(message)
    this.name = 'HttpError'
    this.status = status
  }
}

export async function requestJson(path, { method = 'GET', body, token, signal } = {}) {
  const headers = { Accept: 'application/json' }
  if (body !== undefined) headers['Content-Type'] = 'application/json'
  if (token) headers.Authorization = `Bearer ${token}`
  const response = await fetch(`${API_BASE}${path}`, {
    method, headers, signal, credentials: 'omit',
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  })
  if (!response.ok) {
    // Не показуємо довільне тіло відповіді, яке може містити чутливі дані.
    const messages = {
      400: 'Перевірте введені дані.',
      401: 'Сеанс завершився. Увійдіть повторно.',
      404: 'Товар не знайдено.',
    }
    throw new HttpError(messages[response.status] || 'Сервер не виконав запит.', response.status)
  }
  return response.json()
}

export function errorMessage(cause) {
  return cause instanceof HttpError
    ? `${cause.message} (HTTP ${cause.status})`
    : 'Не вдалося виконати запит. Перевірте з’єднання та спробуйте знову.'
}
