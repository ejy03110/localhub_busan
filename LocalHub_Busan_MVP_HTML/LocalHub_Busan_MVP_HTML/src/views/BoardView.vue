<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import { getPosts } from '../composables/usePosts';

const ITEMS_PER_PAGE = 5;

const posts = ref([]);
const searchInput = ref('');
const appliedKeyword = ref('');
const selectedTopic = ref('');
const selectedPostType = ref('');
const currentPage = ref(1);

const filteredPosts = computed(() => {
  const keyword = appliedKeyword.value.trim().toLowerCase();

  return [...posts.value]
    .sort((a, b) => Number(b.id) - Number(a.id))
    .filter((post) => {
      const titleMatches = !keyword || String(post.title || '').toLowerCase().includes(keyword);
      const topicMatches = !selectedTopic.value || post.topic === selectedTopic.value;
      const postTypeMatches = !selectedPostType.value || post.postType === selectedPostType.value;
      return titleMatches && topicMatches && postTypeMatches;
    });
});

const totalPages = computed(() => Math.max(1, Math.ceil(filteredPosts.value.length / ITEMS_PER_PAGE)));
const pagedPosts = computed(() => {
  const start = (currentPage.value - 1) * ITEMS_PER_PAGE;
  return filteredPosts.value.slice(start, start + ITEMS_PER_PAGE);
});
const pageNumbers = computed(() => Array.from({ length: totalPages.value }, (_, index) => index + 1));

function applySearch() {
  appliedKeyword.value = searchInput.value;
  currentPage.value = 1;
}

function movePage(page) {
  const nextPage = Math.min(Math.max(page, 1), totalPages.value);
  currentPage.value = nextPage;
}

watch([selectedTopic, selectedPostType], () => {
  currentPage.value = 1;
});

watch(totalPages, (pageCount) => {
  if (currentPage.value > pageCount) currentPage.value = pageCount;
});

onMounted(() => {
  posts.value = getPosts();
});
</script>

<template>
  <main class="page">
    <div class="breadcrumb">홈 &gt; 부산 &gt; 커뮤니티</div>

    <div class="page-heading">
      <div>
        <h1>부산 커뮤니티</h1>
        <p>부산 관광, 숙박, 맛집 기타 주제별로 질문과 후기를 나누는 익명 게시판입니다.</p>
      </div>
      <RouterLink class="btn btn-primary" to="/posts/new">+ 글쓰기</RouterLink>
    </div>

    <div class="notice">
      게시글은 현재 브라우저의 localStorage에만 저장됩니다. 다른 기기나 사용자와 실제로 공유되지는 않습니다.
    </div>

    <section class="panel">
      <div class="toolbar board-filter-toolbar">
        <input
          v-model="searchInput"
          class="input"
          type="search"
          placeholder="게시글 제목 검색"
          aria-label="게시글 제목 검색"
          @keydown.enter="applySearch"
        >

        <select v-model="selectedTopic" aria-label="게시글 주제 선택">
          <option value="">전체 주제</option>
          <option value="관광">관광</option>
          <option value="숙박">숙박</option>
          <option value="맛집">맛집</option>
          <option value="기타">기타</option>
        </select>

        <select v-model="selectedPostType" aria-label="글 성격 선택">
          <option value="">전체 글 성격</option>
          <option value="질문">질문</option>
          <option value="후기">후기</option>
          <option value="기타">기타</option>
        </select>

        <button class="btn btn-ghost" type="button" @click="applySearch">검색</button>
      </div>

      <div class="board-table-wrapper">
        <table class="board-table">
          <thead>
            <tr>
              <th scope="col">번호</th>
              <th scope="col">주제</th>
              <th scope="col">글 성격</th>
              <th scope="col">제목</th>
              <th scope="col">작성일</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="post in pagedPosts" :key="post.id">
              <td class="number-col">{{ post.id }}</td>
              <td>{{ post.topic || '기타' }}</td>
              <td>{{ post.postType || '기타' }}</td>
              <td>
                <RouterLink class="post-title" :to="`/posts/${post.id}`">{{ post.title }}</RouterLink>
              </td>
              <td class="date-col">{{ post.createdAt }}</td>
            </tr>
            <tr v-if="pagedPosts.length === 0">
              <td colspan="5">검색 결과가 없습니다.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="pagination" aria-label="게시판 페이지 이동">
        <button class="page-button" type="button" aria-label="이전 페이지" :disabled="currentPage === 1" @click="movePage(currentPage - 1)">‹</button>
        <button
          v-for="pageNumber in pageNumbers"
          :key="pageNumber"
          class="page-button"
          :class="{ active: currentPage === pageNumber }"
          type="button"
          :aria-current="currentPage === pageNumber ? 'page' : undefined"
          @click="movePage(pageNumber)"
        >
          {{ pageNumber }}
        </button>
        <button class="page-button" type="button" aria-label="다음 페이지" :disabled="currentPage === totalPages" @click="movePage(currentPage + 1)">›</button>
      </div>
    </section>
  </main>
</template>
