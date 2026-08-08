export type ApplicationKey = 'NEW_CONTRACT' | 'POLICY_SERVICE'

export interface PortalApplication {
  key: ApplicationKey
  name: string
  eyebrow: string
  description: string
  actionLabel: string
  url: string
  tone: 'navy' | 'teal'
}

function localApplicationUrl(port: number) {
  return `${window.location.protocol}//${window.location.hostname}:${port}`
}

export const portalApplications: PortalApplication[] = [
  {
    key: 'NEW_CONTRACT',
    name: '新契約',
    eyebrow: 'NEW BUSINESS',
    description: '進入新契約作業，處理要保資料、契約建立與進度查詢。',
    actionLabel: '進入新契約',
    url: import.meta.env.VITE_NEW_CONTRACT_URL || localApplicationUrl(5173),
    tone: 'navy',
  },
  {
    key: 'POLICY_SERVICE',
    name: '保全',
    eyebrow: 'POLICY SERVICE',
    description: '進入保單服務作業，處理保單查詢、保全變更與覆核。',
    actionLabel: '進入保全',
    url: import.meta.env.VITE_POLICY_SERVICE_URL || localApplicationUrl(5175),
    tone: 'teal',
  },
]
