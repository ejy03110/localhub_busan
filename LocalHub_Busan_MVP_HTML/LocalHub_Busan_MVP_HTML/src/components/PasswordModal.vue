<script setup>
import { nextTick, ref, watch } from 'vue';

const props = defineProps({
  open: { type: Boolean, default: false },
  title: { type: String, default: '비밀번호 확인' },
  error: { type: String, default: '' },
});
const emit = defineEmits(['confirm', 'cancel']);
const password = ref('');
const inputRef = ref(null);

watch(() => props.open, async (open) => {
  if (!open) return;
  password.value = '';
  await nextTick();
  inputRef.value?.focus();
});

function confirm() {
  emit('confirm', password.value);
}
</script>

<template>
  <div
    class="modal-backdrop"
    :class="{ open }"
    role="presentation"
    @click.self="emit('cancel')"
  >
    <div class="modal" role="dialog" aria-modal="true" :aria-label="title">
      <h3>{{ title }}</h3>
      <p class="post-meta">게시글 작성 시 입력한 비밀번호를 입력하세요.</p>
      <input
        ref="inputRef"
        v-model="password"
        class="input"
        type="password"
        placeholder="비밀번호"
        @keyup.enter="confirm"
      >
      <p v-if="error" class="form-error" role="alert">{{ error }}</p>
      <div class="modal-actions">
        <button class="btn btn-ghost" type="button" @click="emit('cancel')">취소</button>
        <button class="btn btn-primary" type="button" @click="confirm">확인</button>
      </div>
    </div>
  </div>
</template>
