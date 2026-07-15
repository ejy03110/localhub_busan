<script setup>
defineProps({
  title: { type: String, required: true },
  description: { type: String, required: true },
});
</script>

<template>
  <section class="stage-placeholder">
    <p class="stage-badge">2단계 공통 영역 적용 완료</p>
    <h1>{{ title }}</h1>
    <p>{{ description }}</p>
    <p>이 화면의 본문은 정해진 다음 단계에서 원본 디자인 그대로 변환합니다.</p>
  </section>
</template>
