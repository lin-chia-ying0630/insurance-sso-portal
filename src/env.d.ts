/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SSO_LOGIN_URL?: string
  readonly VITE_SSO_LOGOUT_URL?: string
  readonly VITE_NEW_CONTRACT_URL?: string
  readonly VITE_POLICY_SERVICE_URL?: string
  readonly VITE_DEV_SSO_USER?: string
  readonly VITE_DEV_SSO_NAME?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
