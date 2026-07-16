<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watchEffect } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();

const categories = [
  { label: '관광지', file: 'tourist-spots.json' },
  { label: '문화시설', file: 'cultural-facilities.json' },
  { label: '레포츠', file: 'leports.json' },
  { label: '쇼핑', file: 'shopping.json' },
  { label: '숙박', file: 'accommodations.json' },
];

const selectedCategories = ref(categories.map((item) => item.label));
const selectedRegion = ref('부산 전체');
const searchKeyword = ref('');
const allPlaces = ref([]);
const filteredPlaces = ref([]);
const loading = ref(true);
const errorMessage = ref('');
const mapElement = ref(null);
let map = null;
let markerLayer = null;

const regionOptions = computed(() => {
  const regions = new Set();
  allPlaces.value.forEach((place) => {
    const match = String(place.addr1 || '').match(/부산광역시\s+([^\s]+)/);
    // "해운대구광역시" 제외
    if (match?.[1] && match[1] !== '해운대구광역시') regions.add(match[1]);
  });
  return ['부산 전체', ...Array.from(regions).sort((a, b) => a.localeCompare(b, 'ko'))];
});

function loadLeaflet() {
  return new Promise((resolve, reject) => {
    if (window.L) {
      resolve(window.L);
      return;
    }
    if (!document.querySelector('link[data-localhub-leaflet]')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css';
      link.dataset.localhubLeaflet = 'true';
      document.head.appendChild(link);
    }
    const existing = document.querySelector('script[data-localhub-leaflet]');
    if (existing) {
      existing.addEventListener('load', () => resolve(window.L), { once: true });
      existing.addEventListener('error', reject, { once: true });
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js';
    script.dataset.localhubLeaflet = 'true';
    script.onload = () => resolve(window.L);
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

async function loadPlaces() {
  const datasets = await Promise.all(
    categories.map(async (category) => {
      const response = await fetch(`/data/${category.file}`);
      if (!response.ok) throw new Error(`${category.label} 데이터를 불러오지 못했습니다.`);
      const data = await response.json();
      return (data.items || []).map((item) => ({ ...item, category: category.label }));
    }),
  );
  allPlaces.value = datasets.flat();
}

function applyFilter() {
  const keyword = searchKeyword.value.trim().toLowerCase();
  filteredPlaces.value = allPlaces.value.filter((place) => {
    const categoryMatched = selectedCategories.value.includes(place.category);
    const regionMatched = selectedRegion.value === '부산 전체'
      || String(place.addr1 || '').includes(selectedRegion.value);
    const searchMatched = !keyword
      || String(place.title || '').toLowerCase().includes(keyword)
      || String(place.addr1 || '').toLowerCase().includes(keyword);
    return categoryMatched && regionMatched && searchMatched;
  });
  renderMarkers();
}

async function resetFilter() {
  selectedCategories.value = categories.map((item) => item.label);
  selectedRegion.value = '부산 전체';
  searchKeyword.value = '';
  
  // 라우터 업데이트 완료를 기다린 후 필터 적용
  await router.push({ name: 'explore' });
  await nextTick();
  applyFilter();
}

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function renderMarkers() {
  console.log('🗺️ renderMarkers 실행. map 존재?', !!map, 'L 존재?', !!window.L);
  
  if (!map || !window.L) {
    console.error('❌ map이 없습니다!');
    return;
  }
  if (markerLayer) markerLayer.clearLayers();
  markerLayer = window.L.layerGroup().addTo(map);

  const visiblePlaces = [];

  filteredPlaces.value.forEach((place) => {
    const latitude = Number.parseFloat(place.mapy);
    const longitude = Number.parseFloat(place.mapx);
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      console.log('⚠️ 좌표 오류:', place.title, { latitude, longitude });
      return;
    }

    const marker = window.L.marker([latitude, longitude]).bindPopup(`
      <strong>${escapeHtml(place.title || '이름 없는 장소')}</strong><br>
      <span>${escapeHtml(place.category)}</span><br>
      <small>${escapeHtml(place.addr1 || '주소 정보 없음')}</small>
    `);

    markerLayer.addLayer(marker);
    visiblePlaces.push({ place, latitude, longitude, marker });
  });

  console.log('📍 생성된 마커 수:', visiblePlaces.length);

  if (visiblePlaces.length === 0) {
    map.setView([35.1796, 129.0756], 11);
    return;
  }

  const keyword = searchKeyword.value.trim().toLowerCase();
  console.log('🔍 검색 키워드:', keyword);
  
  const exactMatch = keyword
    ? visiblePlaces.find(({ place }) => {
        const match = String(place.title || '').trim().toLowerCase() === keyword;
        return match;
      })
    : null;

  const focusedPlace = exactMatch || (keyword && visiblePlaces.length === 1 ? visiblePlaces[0] : null);
  if (focusedPlace) {
    console.log('🎯 센터링 대상:', focusedPlace.place.title, { lat: focusedPlace.latitude, lng: focusedPlace.longitude });
    console.log('📍 map.setView 호출 전:', map.getCenter());
    map.setView([focusedPlace.latitude, focusedPlace.longitude], 17, { animate: true });
    console.log('📍 map.setView 호출 후:', map.getCenter());
    focusedPlace.marker.openPopup();
    return;
  }

  const bounds = visiblePlaces.map(({ latitude, longitude }) => [latitude, longitude]);
  map.fitBounds(bounds, {
    padding: [40, 40],
    maxZoom: keyword ? 14 : 12,
    animate: true,
  });
}

async function initializeMap() {
  const L = await loadLeaflet();
  await nextTick();
  map = L.map(mapElement.value).setView([35.1796, 129.0756], 11);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors',
    maxZoom: 19,
  }).addTo(map);
  renderMarkers();
}

onMounted(async () => {
  try {
    await loadPlaces();
    filteredPlaces.value = [...allPlaces.value];
    await initializeMap();
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : '지역 탐색 화면을 불러오지 못했습니다.';
    console.error('❌ 에러:', error);
  } finally {
    loading.value = false;
  }
});

watchEffect(async () => {
  const routeQuery = route.query;
  console.log('👀 route.query 변경 감지:', routeQuery);
  
  const routeCategory = typeof routeQuery.category === 'string' ? routeQuery.category.trim() : '';
  const routeDistrict = typeof routeQuery.district === 'string' ? routeQuery.district.trim() : '';
  const routePlaceName = typeof routeQuery.placeName === 'string' ? routeQuery.placeName.trim() : '';

  console.log('🎯 새로운 파라미터:', { routeCategory, routeDistrict, routePlaceName });

  // 항상 기본값으로 초기화
  selectedCategories.value = categories.map((item) => item.label);
  selectedRegion.value = '부산 전체';
  searchKeyword.value = '';

  // 쿼리 파라미터가 있으면 적용
  if (routeCategory) {
    selectedCategories.value = [routeCategory];
    console.log('✅ 카테고리 설정:', selectedCategories.value);
  }

  if (routeDistrict && routeDistrict !== '') {
    selectedRegion.value = routeDistrict;
    console.log('✅ 지역 설정:', selectedRegion.value);
  }

  if (routePlaceName) {
    searchKeyword.value = routePlaceName;
    console.log('✅ 검색어 설정:', searchKeyword.value);
  }

  // 지도가 준비될 때까지 대기
  await nextTick();
  await new Promise(resolve => setTimeout(resolve, 100));

  console.log('🔍 필터 적용 시작');
  applyFilter();
  console.log('✅ 필터 적용 완료. 필터된 장소 수:', filteredPlaces.value.length);
});

onBeforeUnmount(() => {
  if (map) {
    map.remove();
    map = null;
  }
});
</script>

<template>
  <main class="page">
    <div class="breadcrumb">홈 &gt; 부산 &gt; 지역 탐색</div>
    <div class="page-heading">
      <div>
        <h1>부산 지역 탐색</h1>
        <p>관광지, 문화시설, 레포츠, 쇼핑, 숙박을 지도에서 확인하세요.</p>
      </div>
    </div>

    <div class="explore-layout">
      <aside class="panel filter-panel">
        <div class="filter-group">
          <h3>카테고리</h3>
          <div class="checkbox-list">
            <label v-for="category in categories" :key="category.label">
              <input v-model="selectedCategories" type="checkbox" :value="category.label">
              {{ category.label }}
            </label>
          </div>
        </div>

        <div class="filter-group">
          <label for="region-select">지역</label>
          <select id="region-select" v-model="selectedRegion">
            <option v-for="region in regionOptions" :key="region" :value="region">{{ region }}</option>
          </select>
        </div>

        <div class="filter-group">
          <label for="search-input">검색</label>
          <input
            id="search-input"
            v-model="searchKeyword"
            class="input"
            type="text"
            placeholder="장소명을 입력하세요"
            @keyup.enter="applyFilter"
          >
        </div>

        <div class="explore-filter-actions">
          <button class="btn btn-primary" type="button" @click="applyFilter">필터 적용</button>
          <button class="btn explore-reset-button" type="button" @click="resetFilter">초기화</button>
        </div>
      </aside>

      <section class="panel map-panel">
        <div ref="mapElement" class="explore-map" aria-label="부산 지역 장소 지도"></div>
        <div class="explore-map-info" aria-live="polite">
          <span v-if="loading">공공데이터와 지도를 불러오는 중입니다.</span>
          <span v-else-if="errorMessage">{{ errorMessage }}</span>
          <span v-else-if="filteredPlaces.length">{{ filteredPlaces.length }}개의 장소를 지도에 표시했습니다.</span>
          <span v-else>선택한 조건에 맞는 장소가 없습니다.</span>
        </div>
      </section>
    </div>
  </main>
</template>