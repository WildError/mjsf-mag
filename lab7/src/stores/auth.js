import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { HttpError, requestJson, errorMessage } from '../api/http.js'
import { readToken, writeToken } from '../auth/session.js'

export const useAuthStore = defineStore('auth', () => {
  const accessToken = ref('')
  const user = ref(null)
  const status = ref('idle')
  const error = ref('')
  const sessionVersion = ref(0)
  const endReason = ref('')
  const isAuthenticated = computed(() =>
    status.value === 'authenticated' && Boolean(accessToken.value && user.value))
  const isBusy = computed(() => ['restoring', 'signing-in'].includes(status.value))
  let operation = 0
  let authController = null
  let restorePromise = null
  const privateControllers = new Set()

  function cancelOperations() {
    operation++
    authController?.abort()
    authController = null
    restorePromise = null
    for (const controller of privateControllers) controller.abort()
    privateControllers.clear()
  }

  function logout(reason = 'logout') {
    cancelOperations()
    endReason.value = reason
    accessToken.value = ''
    user.value = null
    error.value = reason === 'expired' ? 'Сеанс завершився. Увійдіть повторно.' : ''
    writeToken('')
    sessionVersion.value++
    status.value = 'guest'
  }

  async function login(username, password) {
    if (isBusy.value) return false
    cancelOperations()
    const current = operation
    const controller = new AbortController()
    authController = controller
    // Новий вхід не успадковує підтверджені зміни попереднього сеансу.
    accessToken.value = ''
    user.value = null
    writeToken('')
    sessionVersion.value++
    status.value = 'signing-in'
    error.value = ''
    endReason.value = ''
    try {
      const result = await requestJson('/auth/login', {
        method: 'POST', body: { username, password, expiresInMins: 30 },
        signal: controller.signal,
      })
      if (controller.signal.aborted || current !== operation) return false
      if (!result.accessToken || !result.id) throw new Error('Invalid profile')
      // Не зберігаємо refreshToken та інші поля відповіді входу.
      user.value = profileOf(result)
      accessToken.value = result.accessToken
      writeToken(result.accessToken)
      status.value = 'authenticated'
      return true
    } catch (cause) {
      if (controller.signal.aborted || current !== operation) return false
      error.value = cause.status === 400
        ? 'Неправильне ім’я користувача або пароль (HTTP 400).'
        : errorMessage(cause)
      status.value = 'guest'
      return false
    } finally {
      if (current === operation) authController = null
    }
  }

  function restore(force = false) {
    if (restorePromise) return restorePromise
    if (status.value === 'signing-in') return Promise.resolve(false)
    if (!force && status.value !== 'idle') return Promise.resolve(isAuthenticated.value)
    const token = accessToken.value || readToken()
    if (!token) {
      status.value = 'guest'
      return Promise.resolve(false)
    }
    cancelOperations()
    const current = operation
    const controller = new AbortController()
    authController = controller
    accessToken.value = token
    user.value = null
    error.value = ''
    status.value = 'restoring'
    restorePromise = (async () => {
      try {
        const profile = await requestJson('/auth/me', { token, signal: controller.signal })
        if (controller.signal.aborted || current !== operation) return false
        if (!profile.id) throw new Error('Invalid profile')
        user.value = profileOf(profile)
        status.value = 'authenticated'
        return true
      } catch (cause) {
        if (controller.signal.aborted || current !== operation) return false
        if (cause.status === 401) logout('expired')
        else {
          user.value = null
          status.value = 'unavailable'
          error.value = 'Перевірка сеансу недоступна. Відновіть з’єднання та повторіть.'
        }
        return false
      } finally {
        if (current === operation) {
          authController = null
          restorePromise = null
        }
      }
    })()
    return restorePromise
  }

  async function request(path, options = {}) {
    if (!isAuthenticated.value) throw new HttpError('Потрібно увійти.', 401)
    const token = accessToken.value
    const version = sessionVersion.value
    const controller = new AbortController()
    const signal = options.signal
      ? AbortSignal.any([controller.signal, options.signal])
      : controller.signal
    privateControllers.add(controller)
    try {
      const result = await requestJson(path, { ...options, token, signal })
      if (signal.aborted || version !== sessionVersion.value || token !== accessToken.value)
        throw new DOMException('Скасовано', 'AbortError')
      return result
    } catch (cause) {
      if (cause.status === 401 && version === sessionVersion.value && token === accessToken.value)
        logout('expired')
      throw cause
    } finally {
      privateControllers.delete(controller)
    }
  }

  return {
    accessToken, user, status, error, sessionVersion, endReason,
    isAuthenticated, isBusy, login, logout, restore, request,
  }
})

function profileOf(value) {
  return {
    id: value.id, username: value.username,
    firstName: value.firstName, lastName: value.lastName, image: value.image,
  }
}
