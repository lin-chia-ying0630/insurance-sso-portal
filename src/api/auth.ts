export interface PortalUser {
  userId: string
  displayName: string
  department?: string
  applicationKeys: string[]
}

export type AuthSnapshot =
  | { authenticated: true; user: PortalUser }
  | { authenticated: false; user: null }

const devUserId = import.meta.env.VITE_DEV_SSO_USER?.trim()

export async function fetchAuthSnapshot(): Promise<AuthSnapshot> {
  // 模擬身分只由 .env.development.local 提供；測試與正式建置不會載入該環境檔。
  if (import.meta.env.DEV && devUserId) {
    return {
      authenticated: true,
      user: {
        userId: devUserId,
        displayName: import.meta.env.VITE_DEV_SSO_NAME?.trim() || devUserId,
        department: '本機開發',
        applicationKeys: ['NEW_CONTRACT', 'POLICY_SERVICE'],
      },
    }
  }

  const response = await fetch('/api/auth/me', {
    credentials: 'include',
    headers: { Accept: 'application/json' },
  })
  if (response.status === 401) return { authenticated: false, user: null }
  if (!response.ok) throw new Error('暫時無法確認登入狀態')
  return response.json() as Promise<AuthSnapshot>
}

export function startSsoLogin() {
  const loginUrl = import.meta.env.VITE_SSO_LOGIN_URL || '/api/auth/login'
  const returnUrl = `${window.location.origin}${window.location.pathname}`
  const target = new URL(loginUrl, window.location.origin)
  target.searchParams.set('returnUrl', returnUrl)
  window.location.assign(target.toString())
}

export function startSsoLogout() {
  const logoutUrl = import.meta.env.VITE_SSO_LOGOUT_URL || '/api/auth/logout'
  window.location.assign(new URL(logoutUrl, window.location.origin).toString())
}
