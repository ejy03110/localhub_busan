<script setup>
defineProps({ place:{type:Object,required:true} })
</script>
<template>
  <!-- 장소 한 건을 표시하는 재사용 카드입니다. -->
  <article class="place-card">
    <div class="place-image" :style="place.image ? {backgroundImage:`url(${place.image})`}:{}"><span v-if="!place.image">이미지 없음</span></div>
    <div class="place-content"><span class="badge">{{ place.category }}</span><h3>{{ place.title }}</h3><p>{{ place.address || '주소 정보 없음' }}</p><a v-if="place.latitude && place.longitude" :href="`https://map.kakao.com/link/map/${encodeURIComponent(place.title)},${place.latitude},${place.longitude}`" target="_blank" rel="noopener">지도에서 보기 →</a></div>
  </article>
</template>
