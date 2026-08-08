import { flushPromises, mount } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'
import App from './App.vue'

afterEach(() => vi.restoreAllMocks())

describe('統一入口', () => {
  it('依 SSO 授權顯示可進入的系統', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ authenticated: true, user: { userId: 'maker01', displayName: '王小明', applicationKeys: ['NEW_CONTRACT'] } }),
    }))
    const wrapper = mount(App)
    await flushPromises()
    expect(wrapper.text()).toContain('新契約')
    expect(wrapper.text()).not.toContain('進入保全')
  })

  it('未登入時顯示 SSO 入口', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 401 }))
    const wrapper = mount(App)
    await flushPromises()
    expect(wrapper.text()).toContain('使用 SSO 登入')
  })
})
