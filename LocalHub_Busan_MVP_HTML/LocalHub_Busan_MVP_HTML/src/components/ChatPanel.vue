<script setup>
import { nextTick, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { loadPlaces, categoryLabels } from '../services/placeService.js';

const router = useRouter();
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

// 약자 → 전체 이름 매핑
const districtAliases = {
  '해운대': '해운대구',
  '강서': '강서구',
  '동래': '동래구',
  '진구': '진구',
  '중구': '중구',
  '서구': '서구',
  '영도': '영도구',
  '금정': '금정구',
  '북구': '북구',
  '사상': '사상구',
  '연제': '연제구',
  '기장': '기장군',
  '사하': '사하구'
};

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

// 장소 클릭 처리
function goToPlace(place) {
  console.log('🖱️ 클릭된 장소:', place);
  console.log('🏷️ 장소명:', place.title);
  console.log('📍 주소:', place.address);
  console.log('🏷️ 카테고리:', place.category);
  
  const districtMatch = place.address.match(/부산광역시\s+([^\s]+)/);
  const district = districtMatch ? districtMatch[1] : '';
  
  console.log('🎯 추출된 지역:', district);
  console.log('📤 전달할 쿼리:', {
    category: place.category,
    placeName: place.title,
    district: district
  });
  
  router.push({
    name: 'explore',
    query: {
      category: place.category,
      placeName: place.title,
      district: district
    }
  });
  
  console.log('✅ router.push 실행됨');
  emit('close');
}

async function answerQuestion(question) {
  try {
    const places = await loadPlaces();

    // 1. 질문에서 지역 키워드 감지
    let detectedDistrict = districts.find(dist => question.includes(dist));
    
    // 약자로도 검색
    if (!detectedDistrict) {
      for (const [alias, fullName] of Object.entries(districtAliases)) {
        if (question.includes(alias)) {
          detectedDistrict = fullName;
          break;
        }
      }
    }

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
      foundPlaces = getRandomItems(places.filter(p => p.category === detectedCategory), 5);
    } else if (detectedDistrict) {
      // 지역만 감지
      foundPlaces = getRandomItems(places.filter(p => p.address.includes(detectedDistrict)), 5);
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

      // 메시지에 places 배열 포함
      messages.value.push({
        id: Date.now() + Math.random(),
        type: 'bot',
        text: title,
        places: foundPlaces.map((p, idx) => ({ ...p, idx: idx + 1 }))
      });
      await scrollToBottom();
      return;
    }

    addMessage('bot', '관련 결과를 찾지 못했어요. 장소명, 지역명 또는 관광지·문화시설·숙박·쇼핑·여행코스 같은 분류를 포함해 질문해 보세요.');
  } catch (error) {
    console.error('챗봇 에러:', error);
    addMessage('bot', '오류가 발생했습니다: ' + error.message);
  }
}

async function submitMessage() {
  const question = input.value.trim();
  if (!question) return;

  addMessage('user', question);
  input.value = '';

  await answerQuestion(question);
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
      <template v-for="message in messages" :key="message.id">
        <!-- 메시지 본문 텍스트 표시 -->
        <div class="message" :class="message.type" v-if="!message.places" style="white-space: pre-wrap;">
          {{ message.text }}
        </div>
        
        <!-- 추천 장소가 있으면 클릭 가능한 리스트로 표시 -->
        <div v-else class="message bot">
          <strong style="display: block; margin-bottom: 12px; font-size: 15px;">{{ message.text }}</strong>
          <div class="places-list">
            <div
              v-for="place in message.places"
              :key="place.id"
              class="place-item"
              @click="goToPlace(place)"
            >
              <div class="place-number">{{ place.idx }}</div>
              <div class="place-content">
                <div class="place-title">{{ place.title }}</div>
                <div class="place-address">{{ place.address }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- 사용자 메시지 표시 -->
        <div v-if="message.type === 'user'" class="message user">
          {{ message.text }}
        </div>
      </template>
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

.places-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.place-item {
  display: flex;
  gap: 10px;
  padding: 10px;
  background: #f0f5ff;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid #dde5f3;
}

.place-item:hover {
  background: #e0ecff;
  border-color: #2f6fed;
  transform: translateX(4px);
}

.place-number {
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #2f6fed;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: bold;
}

.place-content {
  flex: 1;
  min-width: 0;
}

.place-title {
  font-weight: 600;
  color: #172033;
  font-size: 13px;
  margin-bottom: 2px;
}

.place-address {
  color: #999;
  font-size: 11px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>