<script setup>
import { computed, reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { createPost, getPostById, updatePost } from '../composables/usePosts';

const route = useRoute();
const router = useRouter();
const editId = computed(() => route.name === 'post-edit' ? Number(route.params.id) : null);
const existingPost = editId.value ? getPostById(editId.value) : null;
const notFound = Boolean(editId.value && !existingPost);
const errors = reactive({ topic: '', postType: '', title: '', content: '', password: '' });
const submitting = ref(false);

const form = reactive({
  topic: existingPost?.topic ?? '관광',
  postType: existingPost?.postType ?? '질문',
  title: existingPost?.title ?? '',
  content: existingPost?.content ?? '',
  place: existingPost?.place ?? '',
  password: existingPost?.password ?? '',
});

const isEdit = computed(() => Boolean(editId.value));

function validate() {
  Object.keys(errors).forEach((key) => { errors[key] = ''; });
  if (!form.topic) errors.topic = '주제를 선택하세요.';
  if (!form.postType) errors.postType = '글 성격을 선택하세요.';
  if (!form.title.trim()) errors.title = '제목을 입력하세요.';
  else if (form.title.trim().length > 100) errors.title = '제목은 100자 이하로 입력하세요.';
  if (!form.content.trim()) errors.content = '내용을 입력하세요.';
  if (form.password.length < 4) errors.password = '비밀번호는 4자리 이상 입력하세요.';
  return !Object.values(errors).some(Boolean);
}

function cancel() {
  if (isEdit.value && existingPost) router.push({ name: 'post-detail', params: { id: existingPost.id } });
  else router.push({ name: 'board' });
}

function submit() {
  if (submitting.value || !validate()) return;
  submitting.value = true;
  const payload = {
    topic: form.topic,
    postType: form.postType,
    title: form.title.trim(),
    content: form.content.trim(),
    place: form.place.trim(),
    password: form.password,
  };
  const saved = isEdit.value ? updatePost(editId.value, payload) : createPost(payload);
  submitting.value = false;
  if (saved) router.push({ name: 'post-detail', params: { id: saved.id } });
}
</script>

<template>
  <main class="page">
    <div class="breadcrumb">홈 &gt; 부산 커뮤니티 &gt; {{ isEdit ? '게시글 수정' : '글쓰기' }}</div>

    <div class="page-heading">
      <div>
        <h1>{{ isEdit ? '게시글 수정' : '게시글 작성' }}</h1>
        <p>지역 주민과 관광객에게 도움이 되는 정보를 공유해 주세요.</p>
      </div>
    </div>

    <section v-if="notFound" class="form-card empty-state">
      <h2>수정할 게시글을 찾을 수 없습니다.</h2>
      <RouterLink class="btn btn-primary" :to="{ name: 'board' }">게시판으로 이동</RouterLink>
    </section>

    <form v-else class="form-card" @submit.prevent="submit">
      <div class="field">
        <label for="topic">주제</label>
        <select id="topic" v-model="form.topic">
          <option value="관광">관광</option>
          <option value="숙박">숙박</option>
          <option value="맛집">맛집</option>
          <option value="기타">기타</option>
        </select>
        <div class="help">게시글 내용과 가장 가까운 큰 주제를 선택하세요.</div>
        <p v-if="errors.topic" class="form-error">{{ errors.topic }}</p>
      </div>

      <div class="field">
        <label for="postType">글 성격</label>
        <select id="postType" v-model="form.postType">
          <option value="질문">질문</option>
          <option value="후기">후기</option>
          <option value="기타">기타</option>
        </select>
        <div class="help">선택한 주제 안에서 질문, 후기, 기타 중 하나를 선택하세요.</div>
        <p v-if="errors.postType" class="form-error">{{ errors.postType }}</p>
      </div>

      <div class="field">
        <label for="title">제목</label>
        <input id="title" v-model="form.title" class="input" type="text" maxlength="100" placeholder="제목을 입력하세요">
        <div class="help">{{ form.title.length }} / 100자</div>
        <p v-if="errors.title" class="form-error">{{ errors.title }}</p>
      </div>

      <div class="field">
        <label for="content">내용</label>
        <textarea id="content" v-model="form.content" placeholder="지역 정보나 방문 경험을 입력하세요"></textarea>
        <p v-if="errors.content" class="form-error">{{ errors.content }}</p>
      </div>

      <div class="field">
        <label for="place">장소 <span class="optional-label">(선택)</span></label>
        <input
          id="place"
          v-model="form.place"
          class="input"
          type="text"
          maxlength="100"
          placeholder="예: 남포동, 광안리해수욕장, 감천문화마을"
        >
        <div class="help">입력한 장소는 게시글 상세 화면에서 지역 탐색 지도와 연결됩니다.</div>
      </div>

      <div class="field">
        <label for="password">수정용 비밀번호</label>
        <input id="password" v-model="form.password" class="input" type="password" placeholder="4자리 이상 입력">
        <div class="help">수정·삭제 시 동일한 비밀번호가 필요합니다. 교육용 설계에 따라 현재 브라우저에 저장됩니다.</div>
        <p v-if="errors.password" class="form-error">{{ errors.password }}</p>
      </div>

      <div class="form-actions">
        <button class="btn btn-ghost" type="button" @click="cancel">취소</button>
        <button class="btn btn-primary" type="submit" :disabled="submitting">{{ submitting ? '저장 중...' : '저장' }}</button>
      </div>
    </form>
  </main>
</template>
