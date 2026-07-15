<script setup>
import { ref, computed, onMounted } from 'vue'
import { loadPlaces, categoryLabels } from '../services/placeService.js'
import PlaceCard from '../components/place/PlaceCard.vue'
const places=ref([]), loading=ref(true), keyword=ref(''), category=ref(''), page=ref(1), perPage=24
onMounted(async()=>{try{places.value=await loadPlaces()}finally{loading.value=false}})
const filtered=computed(()=>places.value.filter(p=>(!category.value||p.category===category.value)&&(!keyword.value||(p.title+p.address).toLowerCase().includes(keyword.value.toLowerCase()))))
const pages=computed(()=>Math.max(1,Math.ceil(filtered.value.length/perPage)))
const shown=computed(()=>filtered.value.slice((page.value-1)*perPage,page.value*perPage))
function reset(){page.value=1}
</script>
<template><div class="page"><div class="page-heading"><div><div class="breadcrumb">홈 &gt; 지역 탐색</div><h1>부산 지역 탐색</h1><p>제공된 공공데이터를 분류와 검색어로 찾아보세요.</p></div></div>
<div class="toolbar"><input v-model="keyword" @input="reset" placeholder="장소명 또는 주소 검색"><select v-model="category" @change="reset"><option value="">전체 분류</option><option v-for="c in categoryLabels" :key="c">{{c}}</option></select><strong>{{filtered.length.toLocaleString()}}건</strong></div>
<div class="notice">지도 좌표가 있는 항목은 카드의 ‘지도에서 보기’를 눌러 카카오맵에서 위치를 확인할 수 있습니다. 축제 캘린더 화면은 제외했습니다.</div>
<p v-if="loading">데이터를 불러오는 중입니다.</p><div v-else class="place-grid"><PlaceCard v-for="p in shown" :key="p.id" :place="p" /></div>
<div class="pagination"><button :disabled="page===1" @click="page--">이전</button><span>{{page}} / {{pages}}</span><button :disabled="page===pages" @click="page++">다음</button></div></div></template>
