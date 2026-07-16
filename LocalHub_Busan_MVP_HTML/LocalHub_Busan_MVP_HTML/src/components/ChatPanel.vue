<script setup>
import { nextTick, ref, watch } from 'vue';
import { loadPlaces, categoryLabels } from '../services/placeService.js';

const props = defineProps({
  open: { type: Boolean, default: false },
});

const emit = defineEmits(['open', 'close']);
const input = ref('');
const chatBody = ref(null);
const messages = ref([
  {
    id: 1,
    type: 'bot',
    text: '안녕하세요! 부산 관광지, 문화시설, 숙박, 쇼핑, 여행코스 또는 커뮤니티 글을 질문해 주세요.',
  },
]);

// 부산의 주요 구
const districts = ['해운대구', '강서구', '동래구', '진구', '중구', '서구', '영도구', '금정구', '북구', '사상구', '연제구', '기장군', '사하구'];

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

// 랜덤으로 N개 항목 선택
function getRandomItems(arr, count) {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, arr.length));
}

async function answerQuestion(question) {
  try {
    const places = await loadPlaces();

    // 1. 질문에서 지역 키워드 감지 (부산 제외한 구 이름)
    const detectedDistrict = districts.find(dist => question.includes(dist));

    // 2. 질문에서 카테고리 키워드 감지
    const detectedCategory = categoryLabels.find(cat => question.includes(cat));

    let foundPlaces = [];

    if (detectedCategory && detectedDistrict) {
      // 지역 + 카테고리 모두 감지
      foundPlaces = getRandomItems(
        places.filter(p => p.category === detectedCategory && p.address.includes(detectedDistrict)),
        5
      );
    } else if (detectedCategory) {
      // 카테고리만 감지
      const filtered = places.filter(p => p.category === detectedCategory);
      console.log(`${detectedCategory} 카테고리 장소 수:`, filtered.length);
      foundPlaces = getRandomItems(filtered, 5);
    } else if (detectedDistrict) {
      // 지역만 감지
      foundPlaces = getRandomItems(
        places.filter(p => p.address.includes(detectedDistrict)),
        5
      );
    }

    if (foundPlaces.length) {
      let title = '추천 장소';
      if (detectedCategory && detectedDistrict) {
        title = `${detectedDistrict} ${detectedCategory} 추천`;
      } else if (detectedCategory) {
        title = `${detectedCategory} 추천`;
      } else if (detectedDistrict) {
        title = `${detectedDistrict} 추천`;
      }

      return `${title}\n${foundPlaces
        .map((place, idx) => `${idx + 1}. ${place.title}\n   주소: ${place.address || '주소 없음'}`)
        .join('\n\n')}`;
    }

    return '관련 결과를 찾지 못했어요. 장소명, 지역명 또는 관광지·문화시설·숙박·쇼핑·여행코스 같은 분류를 포함해 질문해 보세요.';
  } catch (error) {
    console.error('챗봇 에러:', error);
    return '오류가 발생했습니다: ' + error.message;
  }
}

async function submitMessage() {
  const question = input.value.trim();
  if (!question) return;

  addMessage('user', question);
  input.value = '';

  const answer = await answerQuestion(question);
  addMessage('bot', answer);
  await scrollToBottom();
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
        style="white-space: pre-wrap;"
      >
        {{ message.text }}
      </div>
    </div>

    <form class="chat-input" @submit.prevent="submitMessage">
      <input
        v-model="input"
        class="input"
        aria-label="챗봇 질문"
        placeholder="예: 중구 관광지"
      >
      <button class="btn btn-primary" type="submit">전송</button>
    </form>
  </section>
</template>

<style scoped>
.chat-panel {
  width: min(480px, calc(100vw - 32px)) !important;
  height: 650px !important;
}

.message.user {
  width: fit-content !important;
  margin-left: auto !important;
  max-width: 80% !important;
  display: block !important;
}
</style>