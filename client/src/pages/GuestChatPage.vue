<template>
  <div class="min-h-screen bg-[var(--background-gray-main)] text-[var(--text-primary)]">
    <header class="h-[64px] flex items-center justify-between px-6 border-b border-[var(--border-main)] bg-[var(--background-white-main)]">
      <button class="clickable flex items-center gap-2 text-sm" @click="goHome" aria-label="Back to home">
        <ChevronLeft :size="18" />
        <span>{{ t('New Chat') }}</span>
      </button>
      <span class="text-xs text-[var(--text-tertiary)]">Guest mode</span>
    </header>
    <main class="max-w-[900px] mx-auto px-5 py-10">
      <section class="rounded-2xl border border-[var(--border-main)] bg-[var(--background-white-main)] shadow-[0px_5px_16px_0px_var(--shadow-S)] overflow-hidden">
        <div class="px-6 py-5 border-b border-[var(--border-main)]">
          <h1 class="text-lg font-medium">{{ t('New Chat') }}</h1>
          <p class="text-sm text-[var(--text-secondary)] mt-1">AI is ready without registration.</p>
        </div>
        <div class="min-h-[280px] px-6 py-6">
          <div v-if="question" class="mb-5 rounded-xl bg-[var(--background-gray-main)] px-4 py-3 text-sm whitespace-pre-wrap">{{ question }}</div>
          <div v-if="loading" class="flex items-center gap-2 text-sm text-[var(--text-secondary)]"><LoaderCircle class="animate-spin" :size="17" /> Thinking…</div>
          <div v-else-if="answer" class="prose prose-sm max-w-none whitespace-pre-wrap leading-7">{{ answer }}</div>
          <div v-else class="text-sm text-[var(--text-tertiary)]">Ask anything to start.</div>
        </div>
        <div class="px-5 py-4 bg-[var(--background-gray-main)] border-t border-[var(--border-main)]">
          <ChatBox v-model="draft" :attachments="[]" :rows="1" dense :isRunning="loading" @submit="send" @stop="stop" placeholder="Ask AI anything..." />
          <p v-if="error" class="mt-2 text-xs text-red-600">{{ error }}</p>
        </div>
      </section>
    </main>
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { ChevronLeft, LoaderCircle } from 'lucide-vue-next'
import ChatBox from '../components/ChatBox.vue'
const route = useRoute(); const router = useRouter(); const { t } = useI18n()
const draft = ref(''); const question = ref(''); const answer = ref(''); const error = ref(''); const loading = ref(false)
let controller: AbortController | null = null
onMounted(() => { const initial = typeof history.state?.message === 'string' ? history.state.message : String(route.query.message || ''); if (initial) { draft.value = initial; void send() } })
function goHome() { router.push('/') }
function stop() { controller?.abort(); loading.value = false }
async function send() {
  const text = draft.value.trim(); if (!text || loading.value) return
  question.value = text; draft.value = ''; answer.value = ''; error.value = ''; loading.value = true; controller = new AbortController()
  try {
    const res = await fetch('/api/ai/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message: text }), signal: controller.signal })
    const data = await res.json(); if (!res.ok) throw new Error(data?.error || 'AI request failed'); answer.value = data.answer || ''
  } catch (e) { if ((e as Error).name !== 'AbortError') error.value = (e as Error).message }
  finally { loading.value = false; controller = null }
}
</script>
