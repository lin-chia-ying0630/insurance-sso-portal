<template>
  <main class="app-shell">
    <header class="topbar">
      <a class="brand" href="/" aria-label="保險業務統一入口首頁">
        <span class="brand-mark"><ShieldCheck :size="25" /></span>
        <span><small>INSURANCE WORKSPACE</small><strong>保險業務統一入口</strong></span>
      </a>
      <div v-if="state === 'ready' && user" class="account">
        <span class="account-avatar">{{ user.displayName.slice(0, 1) }}</span>
        <span class="account-copy"><strong>{{ user.displayName }}</strong><small>{{ user.department || user.userId }}</small></span>
        <button class="text-button" type="button" @click="startSsoLogout"><LogOut :size="17" />登出</button>
      </div>
    </header>

    <section v-if="state === 'loading'" class="center-state" aria-live="polite">
      <span class="spinner" aria-hidden="true"></span>
      <h1>正在確認登入狀態</h1>
      <p>請稍候，正在連線至 SSO 身分驗證服務。</p>
    </section>

    <section v-else-if="state === 'signed-out'" class="login-panel">
      <div class="login-visual" aria-hidden="true">
        <div class="orbit orbit-one"></div><div class="orbit orbit-two"></div>
        <ShieldCheck :size="76" :stroke-width="1.35" />
      </div>
      <div class="login-copy">
        <p class="eyebrow">單一簽入服務</p>
        <h1>一次登入，開始您的業務作業</h1>
        <p>使用公司 SSO 帳號安全登入。系統將依您的授權顯示可使用的業務入口。</p>
        <button class="primary-button" type="button" @click="startSsoLogin"><LogIn :size="19" />使用 SSO 登入<ArrowRight :size="18" /></button>
        <span class="security-note"><LockKeyhole :size="15" />入口不會儲存您的密碼</span>
      </div>
    </section>

    <template v-else-if="state === 'ready' && user">
      <section class="hero">
        <div><p class="eyebrow">工作區</p><h1>{{ greeting }}，{{ user.displayName }}</h1><p>請選擇要進入的業務系統。</p></div>
        <div class="sso-badge"><CircleCheck :size="18" /><span><strong>SSO 已驗證</strong><small>{{ user.userId }}</small></span></div>
      </section>

      <section class="application-grid" aria-label="業務系統">
        <a v-for="application in availableApplications" :key="application.key" class="application-card" :class="`tone-${application.tone}`" :href="application.url">
          <span class="card-icon"><FilePlus2 v-if="application.key === 'NEW_CONTRACT'" :size="34" /><ShieldCheck v-else :size="34" /></span>
          <span class="card-body"><small>{{ application.eyebrow }}</small><strong>{{ application.name }}</strong><span>{{ application.description }}</span></span>
          <span class="card-action">{{ application.actionLabel }}<ArrowUpRight :size="20" /></span>
        </a>
      </section>
      <p v-if="availableApplications.length === 0" class="empty-state">您目前沒有可使用的業務系統，請聯絡系統管理員。</p>
    </template>

    <section v-else class="center-state error-state" role="alert">
      <CircleAlert :size="42" /><h1>暫時無法開啟統一入口</h1><p>{{ errorMessage }}</p>
      <button class="secondary-button" type="button" @click="loadSession">重新嘗試</button>
    </section>
    <footer><span>保險業務系統</span><span>安全連線 · 單一簽入</span></footer>
  </main>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { ArrowRight, ArrowUpRight, CircleAlert, CircleCheck, FilePlus2, LockKeyhole, LogIn, LogOut, ShieldCheck } from '@lucide/vue'
import { fetchAuthSnapshot, startSsoLogin, startSsoLogout, type PortalUser } from './api/auth'
import { portalApplications } from './domain/applications'

const state = ref<'loading' | 'signed-out' | 'ready' | 'error'>('loading')
const user = ref<PortalUser | null>(null)
const errorMessage = ref('')
const greeting = computed(() => new Date().getHours() < 12 ? '早安' : new Date().getHours() < 18 ? '您好' : '晚安')
const availableApplications = computed(() => portalApplications.filter((app) => user.value?.applicationKeys.includes(app.key)))

async function loadSession() {
  state.value = 'loading'
  errorMessage.value = ''
  try {
    const snapshot = await fetchAuthSnapshot()
    user.value = snapshot.user
    state.value = snapshot.authenticated ? 'ready' : 'signed-out'
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : '發生未預期錯誤'
    state.value = 'error'
  }
}

onMounted(loadSession)
</script>
