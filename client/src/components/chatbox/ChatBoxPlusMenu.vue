<template>
  <div
    v-if="open"
    data-testid="chatbox-plus-menu"
    class="bg-[var(--background-menu-white)] shadow-menu rounded-[12px] min-w-[180px] p-1 w-max flex flex-col z-[9]"
    :style="positionStyle"
  >
    <div class="relative group/skills" @mouseenter="skillsOpen = true" @mouseleave="skillsOpen = false">
      <div class="flex items-center gap-2 w-full p-2 rounded-[8px] hover:bg-[var(--fill-tsp-white-main)] cursor-pointer text-[var(--text-primary)] text-sm" @click.stop.prevent>
        <Puzzle :size="16" class="text-[var(--icon-tertiary)]" />
        <span class="flex-1 truncate text-start">{{ t('Use skills') }}</span>
        <ChevronRight :size="16" class="ms-2 text-[var(--icon-tertiary)]" />
      </div>
      <div v-if="skillsOpen" class="absolute start-full bottom-0 ms-1 z-10">
        <ChatBoxPlusSkillsPanel :open="skillsOpen" @select-skill="onSelectSkill" @add-skill="onAddSkill" @manage-skills="onManageSkills" @close="onSkillsClose" />
      </div>
    </div>
    <button type="button" class="flex items-center gap-2 w-full p-2 rounded-[8px] hover:bg-[var(--fill-tsp-white-main)] text-[var(--text-primary)] text-sm" @mousedown.prevent @click="onAddLocalFiles">
      <Paperclip :size="16" class="text-[var(--icon-tertiary)]" />
      <span class="truncate text-start">{{ t('Add local files') }}</span>
    </button>
    <button type="button" class="flex items-center gap-2 w-full p-2 rounded-[8px] hover:bg-[var(--fill-tsp-white-main)] text-[var(--text-primary)] text-sm" @click="onCamera">
      <Camera :size="16" class="text-[var(--icon-tertiary)]" />
      <span class="truncate text-start">Take a photo</span>
    </button>
    <div class="relative">
      <button type="button" class="flex items-center gap-2 w-full p-2 rounded-[8px] hover:bg-[var(--fill-tsp-white-main)] text-[var(--text-primary)] text-sm" @click.stop="modelOpen = !modelOpen">
        <Cpu :size="16" class="text-[var(--icon-tertiary)]" />
        <span class="truncate text-start">Model: {{ selectedModelLabel }}</span>
      </button>
      <div v-if="modelOpen" class="absolute start-full bottom-0 ms-1 bg-[var(--background-menu-white)] shadow-menu rounded-[12px] p-1 min-w-[190px] z-10">
        <button v-for="model in models" :key="model.id" type="button" class="block w-full text-start p-2 rounded-[8px] hover:bg-[var(--fill-tsp-white-main)] text-sm" @click="selectModel(model.id)">{{ model.label }}</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { Camera, ChevronRight, Cpu, Paperclip, Puzzle } from 'lucide-vue-next'
import ChatBoxPlusSkillsPanel from './ChatBoxPlusSkillsPanel.vue'
import type { Skill } from '@/types/skill'
import type { SkillsPlaceholderVariant } from '@/components/skills/SkillsPlaceholderDialog.vue'

defineProps<{ open: boolean; positionStyle?: Record<string, string> | string }>()
const emit = defineEmits<{
  (e: 'add-local-files'): void
  (e: 'camera'): void
  (e: 'select-model', model: string): void
  (e: 'select-skill', skill: Skill): void
  (e: 'add-skill', variant: SkillsPlaceholderVariant): void
  (e: 'manage-skills'): void
  (e: 'close'): void
}>()
const { t } = useI18n()
const skillsOpen = ref(false)
const modelOpen = ref(false)
const models = [
  { id: 'auto', label: 'Auto (recommended)' },
  { id: 'mistralai/mistral-nemotron', label: 'Nemotron · Agent' },
  { id: 'openai/gpt-oss-20b', label: 'GPT OSS · Code' },
]
const selectedModel = ref(localStorage.getItem('marole-selected-model') || 'auto')
const selectedModelLabel = computed(() => models.find(model => model.id === selectedModel.value)?.label || 'Auto')
const onAddLocalFiles = () => { emit('add-local-files'); emit('close') }
const onCamera = () => { emit('camera'); emit('close') }
const selectModel = (model: string) => { selectedModel.value = model; localStorage.setItem('marole-selected-model', model); emit('select-model', model); modelOpen.value = false; emit('close') }
const onSelectSkill = (skill: Skill) => { emit('select-skill', skill); emit('close') }
const onAddSkill = (variant: SkillsPlaceholderVariant) => { emit('add-skill', variant); emit('close') }
const onManageSkills = () => { emit('manage-skills'); emit('close') }
const onSkillsClose = () => { skillsOpen.value = false; emit('close') }
</script>
<style scoped>
button { cursor: pointer; }
</style>
