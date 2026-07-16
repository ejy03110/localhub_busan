<script setup>
import { computed, reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import {
  createPost,
  getPostById,
  updatePost,
} from '../composables/usePosts';

const route = useRoute();
const router = useRouter();

const editId = computed(() => (
  route.name === 'post-edit'
    ? Number(route.params.id)
    : null
));

const existingPost = editId.value
  ? getPostById(editId.value)
  : null;

const notFound = Boolean(editId.value && !existingPost);

const errors = reactive({
  topic: '',
  postType: '',
  title: '',
  content: '',
  password: '',
});

const submitting = ref(false);
const processingImage = ref(false);
const imageError = ref('');

const form = reactive({
  topic: existingPost?.topic ?? '관광',
  postType: existingPost?.postType ?? '질문',
  title: existingPost?.title ?? '',
  content: existingPost?.content ?? '',
  place: existingPost?.place ?? '',

  // 수정 화면에서는 기존 사진을 그대로 불러옵니다.
  image: existingPost?.image ?? '',

  password: existingPost?.password ?? '',
});

const isEdit = computed(() => Boolean(editId.value));

/**
 * 선택한 사진을 브라우저에서 축소합니다.
 *
 * 원본 사진을 그대로 localStorage에 저장하면 용량을 많이 차지하므로,
 * 최대 1200px 크기의 JPEG 이미지로 변환합니다.
 */
function resizeImage(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onerror = () => {
      reject(new Error('이미지 파일을 읽지 못했습니다.'));
    };

    reader.onload = () => {
      const image = new Image();

      image.onerror = () => {
        reject(new Error('올바른 이미지 파일이 아닙니다.'));
      };

      image.onload = () => {
        const MAX_WIDTH = 1200;
        const MAX_HEIGHT = 1200;

        let width = image.width;
        let height = image.height;

        const scale = Math.min(
          1,
          MAX_WIDTH / width,
          MAX_HEIGHT / height,
        );

        width = Math.round(width * scale);
        height = Math.round(height * scale);

        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');

        if (!context) {
          reject(new Error('이미지를 처리할 수 없습니다.'));
          return;
        }

        canvas.width = width;
        canvas.height = height;

        context.drawImage(image, 0, 0, width, height);

        // 0.75 품질로 변환해 localStorage 사용량을 줄입니다.
        const resizedImage = canvas.toDataURL('image/jpeg', 0.75);

        resolve(resizedImage);
      };

      image.src = String(reader.result);
    };

    reader.readAsDataURL(file);
  });
}

/**
 * 사용자가 파일 선택창에서 사진을 선택했을 때 실행됩니다.
 */
async function handleImageChange(event) {
  imageError.value = '';

  const file = event.target.files?.[0];

  // 파일 선택을 취소한 경우에는 기존 사진을 유지합니다.
  if (!file) return;

  const allowedTypes = [
    'image/jpeg',
    'image/png',
    'image/webp',
  ];

  if (!allowedTypes.includes(file.type)) {
    imageError.value = 'JPG, PNG, WEBP 형식의 사진만 첨부할 수 있습니다.';
    event.target.value = '';
    return;
  }

  if (file.size > 5 * 1024 * 1024) {
    imageError.value = '사진 파일은 5MB 이하만 첨부할 수 있습니다.';
    event.target.value = '';
    return;
  }

  processingImage.value = true;

  try {
    form.image = await resizeImage(file);
  } catch (error) {
    console.error(error);
    imageError.value = '사진을 처리하지 못했습니다. 다른 사진을 선택해 주세요.';
  } finally {
    processingImage.value = false;

    // 같은 파일을 다시 선택해도 change 이벤트가 발생하도록 초기화합니다.
    event.target.value = '';
  }
}

/**
 * 현재 선택된 사진을 삭제합니다.
 */
function removeImage() {
  form.image = '';
  imageError.value = '';
}

function validate() {
  Object.keys(errors).forEach((key) => {
    errors[key] = '';
  });

  if (!form.topic) {
    errors.topic = '주제를 선택하세요.';
  }

  if (!form.postType) {
    errors.postType = '글 성격을 선택하세요.';
  }

  if (!form.title.trim()) {
    errors.title = '제목을 입력하세요.';
  } else if (form.title.trim().length > 100) {
    errors.title = '제목은 100자 이하로 입력하세요.';
  }

  if (!form.content.trim()) {
    errors.content = '내용을 입력하세요.';
  }

  if (form.password.length < 4) {
    errors.password = '비밀번호는 4자리 이상 입력하세요.';
  }

  return !Object.values(errors).some(Boolean);
}

function cancel() {
  if (isEdit.value && existingPost) {
    router.push({
      name: 'post-detail',
      params: {
        id: existingPost.id,
      },
    });

    return;
  }

  router.push({
    name: 'board',
  });
}

function submit() {
  if (
    submitting.value
    || processingImage.value
    || !validate()
  ) {
    return;
  }

  submitting.value = true;

  const payload = {
    topic: form.topic,
    postType: form.postType,
    title: form.title.trim(),
    content: form.content.trim(),
    place: form.place.trim(),

    // 사진이 없으면 빈 문자열이 저장됩니다.
    image: form.image || '',

    password: form.password,
  };

  try {
    const saved = isEdit.value
      ? updatePost(editId.value, payload)
      : createPost(payload);

    if (saved) {
      router.push({
        name: 'post-detail',
        params: {
          id: saved.id,
        },
      });
    }
  } catch (error) {
    console.error(error);

    alert(
      '게시글을 저장하지 못했습니다. '
      + '첨부 사진의 용량이 너무 크거나 저장 공간이 부족할 수 있습니다.',
    );
  } finally {
    submitting.value = false;
  }
}
</script>

<template>
  <main class="page">
    <div class="breadcrumb">
      홈 &gt; 부산 커뮤니티 &gt;
      {{ isEdit ? '게시글 수정' : '글쓰기' }}
    </div>

    <div class="page-heading">
      <div>
        <h1>
          {{ isEdit ? '게시글 수정' : '게시글 작성' }}
        </h1>

        <p>
          지역 주민과 관광객에게 도움이 되는 정보를 공유해 주세요.
        </p>
      </div>
    </div>

    <section
      v-if="notFound"
      class="form-card empty-state"
    >
      <h2>수정할 게시글을 찾을 수 없습니다.</h2>

      <RouterLink
        class="btn btn-primary"
        :to="{ name: 'board' }"
      >
        게시판으로 이동
      </RouterLink>
    </section>

    <form
      v-else
      class="form-card"
      @submit.prevent="submit"
    >
      <div class="field">
        <label for="topic">주제</label>

        <select
          id="topic"
          v-model="form.topic"
        >
          <option value="관광">관광</option>
          <option value="숙박">숙박</option>
          <option value="맛집">맛집</option>
          <option value="기타">기타</option>
        </select>

        <div class="help">
          게시글 내용과 가장 가까운 큰 주제를 선택하세요.
        </div>

        <p
          v-if="errors.topic"
          class="form-error"
        >
          {{ errors.topic }}
        </p>
      </div>

      <div class="field">
        <label for="postType">글 성격</label>

        <select
          id="postType"
          v-model="form.postType"
        >
          <option value="질문">질문</option>
          <option value="후기">후기</option>
          <option value="기타">기타</option>
        </select>

        <div class="help">
          선택한 주제 안에서 질문, 후기, 기타 중 하나를 선택하세요.
        </div>

        <p
          v-if="errors.postType"
          class="form-error"
        >
          {{ errors.postType }}
        </p>
      </div>

      <div class="field">
        <label for="title">제목</label>

        <input
          id="title"
          v-model="form.title"
          class="input"
          type="text"
          maxlength="100"
          placeholder="제목을 입력하세요"
        >

        <div class="help">
          {{ form.title.length }} / 100자
        </div>

        <p
          v-if="errors.title"
          class="form-error"
        >
          {{ errors.title }}
        </p>
      </div>

      <div class="field">
        <label for="content">내용</label>

        <textarea
          id="content"
          v-model="form.content"
          placeholder="지역 정보나 방문 경험을 입력하세요"
        ></textarea>

        <p
          v-if="errors.content"
          class="form-error"
        >
          {{ errors.content }}
        </p>
      </div>

      <!-- 사진 첨부 영역 -->
      <div class="field">
        <label for="postImage">
          사진 첨부
          <span class="optional-label">(선택)</span>
        </label>

        <input
          id="postImage"
          class="image-file-input"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          @change="handleImageChange"
        >

        <div class="help">
          JPG, PNG, WEBP 사진을 첨부할 수 있습니다.
          사진을 첨부하지 않아도 글을 작성할 수 있습니다.
        </div>

        <p
          v-if="processingImage"
          class="help"
        >
          사진을 처리하고 있습니다...
        </p>

        <p
          v-if="imageError"
          class="form-error"
        >
          {{ imageError }}
        </p>

        <div
          v-if="form.image"
          class="image-preview"
        >
          <img
            :src="form.image"
            alt="첨부 사진 미리보기"
          >

          <button
            class="btn btn-danger"
            type="button"
            @click="removeImage"
          >
            사진 삭제
          </button>
        </div>
      </div>

      <div class="field">
        <label for="place">
          장소
          <span class="optional-label">(선택)</span>
        </label>

        <input
          id="place"
          v-model="form.place"
          class="input"
          type="text"
          maxlength="100"
          placeholder="예: 남포동, 광안리해수욕장, 감천문화마을"
        >

        <div class="help">
          입력한 장소는 게시글 상세 화면에서 지역 탐색 지도와 연결됩니다.
        </div>
      </div>

      <div class="field">
        <label for="password">
          수정용 비밀번호
        </label>

        <input
          id="password"
          v-model="form.password"
          class="input"
          type="password"
          placeholder="4자리 이상 입력"
        >

        <div class="help">
          수정·삭제 시 동일한 비밀번호가 필요합니다.
          교육용 설계에 따라 현재 브라우저에 저장됩니다.
        </div>

        <p
          v-if="errors.password"
          class="form-error"
        >
          {{ errors.password }}
        </p>
      </div>

      <div class="form-actions">
        <button
          class="btn btn-ghost"
          type="button"
          @click="cancel"
        >
          취소
        </button>

        <button
          class="btn btn-primary"
          type="submit"
          :disabled="submitting || processingImage"
        >
          {{
            processingImage
              ? '사진 처리 중...'
              : submitting
                ? '저장 중...'
                : '저장'
          }}
        </button>
      </div>
    </form>
  </main>
</template>