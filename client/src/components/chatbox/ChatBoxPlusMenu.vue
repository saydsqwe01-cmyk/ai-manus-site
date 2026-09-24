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
  { id: 'mistralai/mistral-nemotron', label: 'Mistral Nemotron · Agent' },
  { id: 'openai/gpt-oss-20b', label: 'GPT OSS 20B · Code' },
  { id: 'nvidia/nemotron-3-ultra-550b-a55b', label: 'Nemotron 3 Ultra · Reasoning' },
  { id: 'nvidia/nemotron-3-super-120b-a12b', label: 'Nemotron 3 Super · General' },
  { id: 'nvidia/nemotron-3.5-lightning-30b-a3b', label: 'Nemotron 3.5 Lightning · Fast' },
  { id: 'nvidia/nemotron-3-nano-omni-30b-a3b-reasoning', label: 'Nemotron Nano Omni · Reasoning' },
  { id: 'nvidia/llama-3.1-nemotron-ultra-253b-v1', label: 'Llama Nemotron Ultra' },
  { id: 'nvidia/llama-3.1-nemotron-70b-instruct', label: 'Llama Nemotron 70B' },
  { id: 'nvidia/llama-3.1-nemotron-51b-instruct', label: 'Llama Nemotron 51B' },
  { id: 'moonshotai/kimi-k3', label: 'Kimi K3 · Reasoning' },
  { id: 'moonshotai/kimi-k2.6', label: 'Kimi K2.6 · General' },
  { id: 'z-ai/glm-5.3', label: 'GLM 5.3 · General' },
  { id: 'z-ai/glm-5.3-flash', label: 'GLM 5.3 Flash · Fast' },
  { id: 'mistralai/mistral-large-2-instruct', label: 'Mistral Large 2' },
  { id: 'mistralai/mistral-large', label: 'Mistral Large' },
  { id: 'mistralai/codestral-22b-instruct-v0.1', label: 'Codestral 22B · Code' },
  { id: 'mistralai/mixtral-8x22b-v0.1', label: 'Mixtral 8x22B' },
  { id: 'mistralai/mistral-7b-instruct-v0.3', label: 'Mistral 7B · Fast' },
  { id: 'deepseek-ai/deepseek-v4.1-flash', label: 'DeepSeek V4.1 Flash · Fast' },
  { id: 'deepseek-ai/deepseek-coder-6.7b-instruct', label: 'DeepSeek Coder · Code' },
  { id: 'meta/codellama-70b', label: 'Code Llama 70B · Code' },
  { id: 'meta/llama-3.2-90b-vision-instruct', label: 'Llama 3.2 90B · Vision' },
  { id: 'meta/llama-3.2-11b-vision-instruct', label: 'Llama 3.2 11B · Vision' },
  { id: 'google/gemma-4-31b-it', label: 'Gemma 4 31B · General' },
  { id: 'google/gemma-3-12b-it', label: 'Gemma 3 12B' },
  { id: 'google/gemma-3-4b-it', label: 'Gemma 3 4B · Fast' },
  { id: 'ibm/granite-34b-code-instruct', label: 'Granite 34B · Code' },
  { id: 'ibm/granite-8b-code-instruct', label: 'Granite 8B · Code' },
  { id: 'ibm/granite-3.0-8b-instruct', label: 'Granite 8B' },
  { id: 'writer/palmyra-creative-122b', label: 'Palmyra Creative' },
  { id: 'writer/palmyra-fin-70b-32k', label: 'Palmyra Finance' },
  { id: 'writer/palmyra-med-70b', label: 'Palmyra Medical' },
  { id: 'poolside/laguna-xs-2.1', label: 'Laguna XS · Code' },
  { id: 'ai21labs/jamba-1.5-large-instruct', label: 'Jamba 1.5 Large' },
  { id: '01-ai/yi-large', label: 'Yi Large' },
  { id: 'databricks/dbrx-instruct', label: 'DBRX Instruct' },
  { id: 'bigcode/starcoder2-15b', label: 'StarCoder2 · Code' },
  { id: 'aisingapore/sea-lion-7b-instruct', label: 'SEA-LION' },
  { id: 'zyphra/zamba2-7b-instruct', label: 'Zamba2' },
  { id: 'adept/fuyu-8b', label: 'Fuyu 8B · Vision' },
  { id: 'google/codegemma-1.1-7b', label: 'CodeGemma 1.1 · Code' },
  { id: 'google/codegemma-7b', label: 'CodeGemma 7B · Code' },
  { id: 'google/deplot', label: 'DePlot · Charts' },
  { id: 'google/diffusiongemma-26b-a4b-it', label: 'DiffusionGemma · Vision' },
  { id: 'google/gemma-2b', label: 'Gemma 2B · Fast' },
  { id: 'google/recurrentgemma-2b', label: 'RecurrentGemma 2B' },
  { id: 'ibm/granite-3.0-3b-a800m-instruct', label: 'Granite 3B · Fast' },
  { id: 'microsoft/phi-3-vision-128k-instruct', label: 'Phi 3 Vision' },
  { id: 'microsoft/phi-3.5-moe-instruct', label: 'Phi 3.5 MoE' },
  { id: 'nvidia/cosmos-reason2-8b', label: 'Cosmos Reason · Vision' },
  { id: 'nvidia/llama3-chatqa-1.5-70b', label: 'Llama ChatQA' },
  { id: 'nvidia/mistral-nemo-minitron-8b-8k-instruct', label: 'Mistral Nemo Minitron' },
  { id: 'nvidia/neva-22b', label: 'NeVA · Vision' },
  { id: 'nvidia/vila', label: 'VILA · Vision' },
  { id: 'nv-mistralai/mistral-nemo-12b-instruct', label: 'Mistral Nemo 12B' },
  { id: 'nvidia/riva-translate-4b-instruct', label: 'Riva Translate' },
  { id: 'nvidia/riva-translate-4b-instruct-v1.1', label: 'Riva Translate v1.1' },
  { id: 'nvidia/riva-translate-4b-instruct-v2', label: 'Riva Translate v2' },
  { id: 'nvidia/nemotron-4-340b-instruct', label: 'Nemotron 4 340B' },
  { id: 'nvidia/nemotron-nano-3-30b-a3b', label: 'Nemotron Nano 30B' },
  { id: 'nvidia/nemotron-parse', label: 'Nemotron Parse' },
  { id: 'nvidia/nemotron-parse-2.0', label: 'Nemotron Parse 2' },
  { id: 'microsoft/kosmos-2', label: 'Kosmos 2 · Vision' },
  { id: 'nvidia/ising-calibration-1.5-31b', label: 'Ising Calibration' },
  { id: 'writer/palmyra-med-70b-32k', label: 'Palmyra Medical 32K' },
  { id: 'nvidia/nemotron-3-embed-1b', label: 'Nemotron Embed' },
  { id: 'nvidia/nv-embedqa-mistral-7b-v2', label: 'NV EmbedQA' },
  { id: 'nvidia/llama-3.2-nemoretriever-1b-vlm-embed-v1', label: 'NemoRetriever Embed' },
  { id: 'nvidia/llama-nemotron-embed-vl-1b-v2', label: 'NemoRetriever Vision Embed' },
  { id: 'snowflake/arctic-embed-l', label: 'Arctic Embed' },
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
