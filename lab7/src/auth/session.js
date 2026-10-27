// Лише access token. Пароль, профіль і локальні зміни сюди не записуються.
export const SESSION_KEY = 'lab7.accessToken'
export function readToken() {
  try { return globalThis.sessionStorage?.getItem(SESSION_KEY) || '' }
  catch { return '' }
}
export function writeToken(token) {
  try {
    if (token) globalThis.sessionStorage?.setItem(SESSION_KEY, token)
    else globalThis.sessionStorage?.removeItem(SESSION_KEY)
  } catch { /* Поточний сеанс працює в пам’яті, якщо сховище недоступне. */ }
}
