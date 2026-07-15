<script setup>
import { ref, onMounted, computed } from 'vue'
import { loadPlaces } from '../services/placeService.js'
import { getPosts } from '../services/postService.js'
import PlaceCard from '../components/place/PlaceCard.vue'
const places=ref([]), posts=ref(getPosts().slice(0,5)), loading=ref(true)
onMounted(async()=>{try{places.value=await loadPlaces()}finally{loading.value=false}})
const stats=computed(()=>Object.entries(places.value.reduce((a,p)=>(a[p.category]=(a[p.category]||0)+1,a),{})))
const featured=computed(()=>places.value.filter(p=>p.image).slice(0,6))
</script>
<template><div class="page">
<section class="hero"><div class="hero-copy"><span class="kicker">📍 부산 공공데이터 기반 지역 플랫폼</span><h1>부산을 찾고,<br>경험을 나누다.</h1><p>관광지·문화시설·레포츠·숙박·쇼핑·여행코스를 탐색하고 익명 커뮤니티에서 경험을 공유하세요.</p><div class="hero-actions"><RouterLink class="btn light" to="/explore">부산 지역 탐색</RouterLink><RouterLink class="btn teal" to="/board">커뮤니티 보기</RouterLink></div></div><div class="hero-visual"><div class="map-art">BUSAN<div class="pin p1">●</div><div class="pin p2">●</div><div class="pin p3">●</div></div></div></section>
<section class="section"><div class="section-head"><div><h2>부산 정보 한눈에 보기</h2><p>제공된 JSON의 실제 데이터 건수입니다.</p></div></div><div class="stat-grid"><article v-for="[name,count] in stats" :key="name" class="stat-card"><strong>{{ count.toLocaleString() }}</strong><span>{{ name }}</span></article></div></section>
<section class="section"><div class="section-head"><div><h2>추천 장소</h2><p>대표 이미지가 있는 장소 일부를 보여줍니다.</p></div><RouterLink to="/explore">전체 탐색 →</RouterLink></div><p v-if="loading">데이터를 불러오는 중입니다.</p><div class="place-grid"><PlaceCard v-for="p in featured" :key="p.id" :place="p" /></div></section>
<section class="section recent-panel"><div class="section-head"><div><h2>최근 커뮤니티 글</h2><p>현재 브라우저에 저장된 익명 게시글</p></div><RouterLink to="/board">전체보기 →</RouterLink></div><RouterLink v-for="p in posts" :key="p.id" class="post-row" :to="`/board/${p.id}`"><span><strong>{{p.title}}</strong><small>{{p.category}}</small></span><time>{{p.createdAt}}</time></RouterLink></section>
</div></template>
