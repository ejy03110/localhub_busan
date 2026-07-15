<script setup>
import { ref, nextTick } from 'vue'
import { loadPlaces } from '../../services/placeService.js'
import { getPosts } from '../../services/postService.js'
import { askOpenAI } from '../../services/openaiService.js'

const open = ref(false)
const input = ref('')
const loading = ref(false)
const bodyRef = ref(null)
const messages = ref([
  {
    role: 'bot',
    text: '안녕하세요! 부산 관광지, 문화시설, 숙박, 쇼핑, 여행코스 또는 커뮤니티 글을 질문해 주세요.',
  },
])

async function send() {
  const question = input.value.trim()
  if (!question || loading.value) return

  messages.value.push({ role: 'user', text: question })
  input.value = ''
  loading.value = true
  await nextTick()
  scrollToBottom()

  try {
    const places = await loadPlaces()
    const words = question
      .replace(/[?.,!]/g, ' ')
      .split(/\s+/)
      .filter((word) => word.length > 1)

    const foundPlaces = places
      .filter((place) => words.some((word) => `${place.title}${place.address}${place.category}`.includes(word)))
      .slice(0, 5)

    const foundPosts = getPosts()
      .filter((post) => words.some((word) => `${post.title}${post.content}${post.category}`.includes(word)))
      .slice(0, 3)

    const context = [
      ...foundPlaces.map((place) => `${place.category}: ${place.title} (${place.address || '주소 없음'})`),
      ...foundPosts.map((post) => `게시글: ${post.title} - ${post.content}`),
    ].join('\n')

    let answer = await askOpenAI(question, context)

    // API 키가 없을 때도 JSON 검색 결과를 이용해 기본 답변을 제공합니다.
    if (!answer) {
      if (foundPlaces.length) {
        answer = `관련 장소를 찾았어요.\n${foundPlaces
          .map((place) => `• ${place.title} — ${place.address || '주소 없음'}`)
          .join('\n')}`
      } else if (foundPosts.length) {
        answer = `관련 커뮤니티 글을 찾았어요.\n${foundPosts
          .map((post) => `• ${post.title}`)
          .join('\n')}`
      } else {
        answer = '관련 결과를 찾지 못했어요. 장소명, 지역명 또는 관광지·문화시설·숙박·쇼핑·여행코스 같은 분류를 포함해 질문해 보세요.'
      }
    }

    messages.value.push({ role: 'bot', text: answer })
  } catch (error) {
    messages.value.push({ role: 'bot', text: error.message || '답변 중 오류가 발생했습니다.' })
  } finally {
    loading.value = false
    await nextTick()
    scrollToBottom()
  }
}

function scrollToBottom() {
  if (bodyRef.value) bodyRef.value.scrollTop = bodyRef.value.scrollHeight
}
</script>

<template>
  <!-- 데스크톱: 오른쪽 하단 고정 / 모바일: 화면 대부분을 사용하는 대화창 -->
  <button
    class="chat-fab"
    type="button"
    :aria-expanded="open"
    aria-label="LocalHub 챗봇 열기"
    @click="open = !open"
  >
    💬 <span>AI 부산 도우미</span>
  </button>

  <section v-if="open" class="chat-panel" aria-label="LocalHub 챗봇">
    <header>
      <div><strong>LocalHub 챗</strong><small>부산 지역 정보 도우미</small></div>
      <button type="button" aria-label="닫기" @click="open = false">×</button>
    </header>

    <div ref="bodyRef" class="chat-body">
      <div v-for="(message, index) in messages" :key="index" class="message" :class="message.role">
        {{ message.text }}
      </div>
      <div v-if="loading" class="message bot">답변을 찾고 있어요…</div>
    </div>

    <form class="chat-input" @submit.prevent="send">
      <input v-model="input" aria-label="질문 입력" placeholder="예: 해운대 근처 숙박 알려줘" />
      <button type="submit">전송</button>
    </form>
  </section>
</template>
