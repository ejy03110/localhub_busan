<script setup>
import { nextTick, ref, watch } from 'vue';
import { useRouter } from 'vue-router';

const props = defineProps({
  open: { type: Boolean, default: false },
});

const emit = defineEmits(['open', 'close']);
const router = useRouter();
const input = ref('');
const chatBody = ref(null);
const messages = ref([
  {
    id: 1,
    type: 'bot',
    text: '안녕하세요. 부산 관광지, 숙박, 쇼핑 또는 커뮤니티 게시글을 질문해 주세요.',
  },
]);

async function scrollToBottom() {
  await nextTick();
  if (chatBody.value) {
    chatBody.value.scrollTop = chatBody.value.scrollHeight;
  }
}

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) scrollToBottom();
  },
);

function addMessage(type, text) {
  messages.value.push({ id: Date.now() + Math.random(), type, text });
}

function answerQuestion(question) {
  const normalized = question.replace(/\s/g, '');

  if (/게시판|커뮤니티|게시글/.test(normalized)) {
    return {
      text: '커뮤니티에서 부산 관련 질문과 후기를 확인할 수 있어요. 커뮤니티 화면으로 이동할게요.',
      route: '/board',
    };
  }

  if (/관광|장소|숙박|호텔|쇼핑|지역|탐색/.test(normalized)) {
    return {
      text: '지역 탐색 화면에서 부산의 장소 정보를 확인할 수 있어요. 지역 탐색 화면으로 이동할게요.',
      route: '/explore',
    };
  }

  if (/글쓰기|작성/.test(normalized)) {
    return {
      text: '게시글 작성 화면으로 이동할게요.',
      route: '/posts/new',
    };
  }

  return {
    text: '현재는 지역 탐색, 커뮤니티, 게시글 작성 안내를 도와드릴 수 있어요.',
  };
}

async function submitMessage() {
  const question = input.value.trim();
  if (!question) return;

  addMessage('user', question);
  input.value = '';

  const answer = answerQuestion(question);
  addMessage('bot', answer.text);
  await scrollToBottom();

  if (answer.route) {
    setTimeout(() => {
      router.push(answer.route);
      emit('close');
    }, 450);
  }
}
</script>

<template>
  <button
    class="chat-fab"
    type="button"
    aria-label="LocalHub 챗봇 열기"
    @click="$emit('open')"
  >
    💬
  </button>

  <section
    class="chat-panel"
    :class="{ open }"
    aria-label="LocalHub 챗봇"
    :aria-hidden="!open"
  >
    <header class="chat-head">
      <div>
        <h3>LocalHub 챗</h3>
        <small>부산 지역 정보 도우미</small>
      </div>
      <button class="chat-close" type="button" aria-label="닫기" @click="$emit('close')">
        ×
      </button>
    </header>

    <div ref="chatBody" class="chat-body">
      <div
        v-for="message in messages"
        :key="message.id"
        class="message"
        :class="message.type"
      >
        {{ message.text }}
      </div>
    </div>

    <form class="chat-input" @submit.prevent="submitMessage">
      <input
        v-model="input"
        class="input"
        aria-label="챗봇 질문"
        placeholder="예: 부산 관광지 알려줘"
      >
      <button class="btn btn-primary" type="submit">전송</button>
    </form>
  </section>
</template>
