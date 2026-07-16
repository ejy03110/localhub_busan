<script setup>
import { computed, ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import PasswordModal from '../components/PasswordModal.vue';
import {
  deletePost,
  getPostById,
  increasePostLike,
  increasePostView,
} from '../composables/usePosts';

const route = useRoute();
const router = useRouter();
const post = ref(getPostById(route.params.id));
onMounted(() => {
  const updatedPost = increasePostView(route.params.id);

  if (updatedPost) {
    post.value = updatedPost;
  }
});
const modalMode = ref('');
const passwordError = ref('');

const locationKeyword = computed(() => {
  if (!post.value) return '';
  if (post.value.place?.trim()) return post.value.place.trim();

  // 기존 게시글에 장소 필드가 없어도 제목·내용에서 대표 지역명을 찾아 연결합니다.
  const source = `${post.value.title} ${post.value.content}`;
  const knownPlaces = [
    '남포동', '해운대', '광안리', '서면', '송도', '영도', '감천문화마을',
    '태종대', '기장', '오륙도', '동백섬', '자갈치', '부산역', '용두산공원',
  ];
  const known = knownPlaces.find((name) => source.includes(name));
  if (known) return known;

  const dongMatch = source.match(/[가-힣]{1,8}동/);
  return dongMatch?.[0] ?? '';
});

const exploreLocation = computed(() => ({
  name: 'explore',
  query: { q: locationKeyword.value },
}));

const externalMapUrl = computed(() => {
  const keyword = locationKeyword.value || post.value?.title || '';
  return `https://map.kakao.com/?q=${encodeURIComponent(keyword)}`;
});

const meta = computed(() => {
  if (!post.value) return '';
  return `${post.value.topic} · ${post.value.postType} · ${post.value.createdAt}`;
});

function openModal(mode) {
  modalMode.value = mode;
  passwordError.value = '';
}

function closeModal() {
  modalMode.value = '';
  passwordError.value = '';
}

function confirmPassword(password) {
  if (!post.value || password !== post.value.password) {
    passwordError.value = '비밀번호가 일치하지 않습니다.';
    return;
  }

  if (modalMode.value === 'edit') {
    router.push({ name: 'post-edit', params: { id: post.value.id } });
    return;
  }

  if (modalMode.value === 'delete') {
    const confirmed = window.confirm('정말 이 게시글을 삭제하시겠습니까?');
    if (!confirmed) return;
    deletePost(post.value.id);
    router.push({ name: 'board' });
  }
}
function handleLike() {
  const updatedPost = increasePostLike(route.params.id);

  if (updatedPost) {
    post.value = updatedPost;
  }
}
</script>

<template>
  <main class="page">
    <div class="breadcrumb">홈 &gt; 부산 커뮤니티 &gt; 게시글 상세</div>

    <article v-if="post" class="detail-card">
      <header class="detail-head">
        <h1>{{ post.title }}</h1>
        <div class="post-meta">{{ meta }}</div>
      </header>
      <div class="detail-body">{{ post.content }}</div>
      <div class="detail-reactions">
        <button
          class="post-like-button"
          type="button"
          @click="handleLike"
        >
          ♡ 좋아요 {{ post.likes || 0 }}
        </button>

        <span class="post-view-count">
          👁 조회수 {{ post.views || 0 }}
        </span>
      </div>

      <section v-if="locationKeyword" class="post-location-card" aria-labelledby="post-location-title">
        <div class="post-location-icon" aria-hidden="true">📍</div>
        <div class="post-location-content">
          <h2 id="post-location-title">장소</h2>
          <strong>{{ post.place || locationKeyword }}</strong>
          <p v-if="!post.place" class="post-location-note">게시글 내용에서 추정한 지역입니다.</p>
          <div class="post-location-actions">
            <RouterLink class="btn btn-primary" :to="exploreLocation">지역 탐색 지도에서 보기</RouterLink>
            <a class="btn btn-ghost" :href="externalMapUrl" target="_blank" rel="noopener noreferrer">카카오맵에서 검색</a>
          </div>
        </div>
      </section>

      <div class="detail-actions">
        <RouterLink class="btn btn-ghost" :to="{ name: 'board' }">목록으로</RouterLink>
        <div class="action-group">
          <button class="btn btn-soft" type="button" @click="openModal('edit')">수정</button>
          <button class="btn btn-danger" type="button" @click="openModal('delete')">삭제</button>
        </div>
      </div>
    </article>

    <section v-else class="detail-card empty-state">
      <h1>게시글을 찾을 수 없습니다.</h1>
      <p>삭제되었거나 잘못된 주소로 접근했습니다.</p>
      <RouterLink class="btn btn-primary" :to="{ name: 'board' }">게시판으로 이동</RouterLink>
    </section>

    <PasswordModal
      :open="Boolean(modalMode)"
      :title="modalMode === 'delete' ? '게시글 삭제' : '게시글 수정'"
      :error="passwordError"
      @cancel="closeModal"
      @confirm="confirmPassword"
    />
  </main>
</template>
