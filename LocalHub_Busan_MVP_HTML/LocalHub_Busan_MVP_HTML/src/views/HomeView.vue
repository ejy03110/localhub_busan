<script setup>
import { computed, onActivated, onMounted, ref } from 'vue';
import { getPosts } from '../composables/usePosts';

const posts = ref([]);
const featuredPlaces = ref([]);
const placeError = ref('');

<<<<<<< HEAD
const stats = ref({
  관광지: 0,
  문화시설: 0,
  숙박: 0,
  쇼핑: 0,
});

const weather = ref({
  icon: '🌤️',
  temperature: '--°',
  description: '날씨 정보를 불러오는 중입니다.',
  high: '🔥최고: --°',
  low: '❄️최저: --°',
  rain: '🌧️강수 --mm',
  wind: '💨바람 --km/h',
});

/**
 * 게시글을 최신순으로 정렬한 뒤
 * 홈 화면에 3개만 표시합니다.
 */
const recentPosts = computed(() => {
  return [...posts.value]
    .sort((a, b) => Number(b.id) - Number(a.id))
    .slice(0, 3);
});
=======
const popularPosts = computed(() =>
  [...posts.value]
    .sort((a, b) => {
      const scoreA =
        Number(a.likes || 0) * 3 +
        Number(a.views || 0);

      const scoreB =
        Number(b.likes || 0) * 3 +
        Number(b.views || 0);

      return scoreB - scoreA;
    })
    .slice(0, 3)
);
>>>>>>> d7e4628194c8c7fa1c408bf7b0ee03fb39834a43

function loadPosts() {
  posts.value = getPosts();
}

async function loadJson(path) {
  const response = await fetch(path);

  if (!response.ok) {
    throw new Error(path);
  }

  return response.json();
}

async function loadHomeData() {
  try {
    const [
      tourism,
      culture,
      lodging,
      shopping,
    ] = await Promise.all([
      loadJson('/data/tourist-spots.json'),
      loadJson('/data/cultural-facilities.json'),
      loadJson('/data/accommodations.json'),
      loadJson('/data/shopping.json'),
    ]);

    stats.value = {
      관광지: tourism.items?.length ?? 0,
      문화시설: culture.items?.length ?? 0,
      숙박: lodging.items?.length ?? 0,
      쇼핑: shopping.items?.length ?? 0,
    };

    featuredPlaces.value = (tourism.items || [])
      .filter((place) => place.firstimage || place.firstimage2)
      .slice(0, 4);
  } catch (error) {
    console.error(error);
    placeError.value = '추천 관광지를 불러오지 못했습니다.';
  }
}

function getWeatherDescription(code) {
  if (code === 0) return '맑음';
  if (code === 1) return '대체로 맑음';
  if (code === 2) return '부분적으로 흐림';
  if (code === 3) return '흐림';
  if ([45, 48].includes(code)) return '안개';
  if ([51, 53, 55, 56, 57].includes(code)) return '이슬비';
  if ([61, 63, 65, 66, 67].includes(code)) return '비';
  if ([71, 73, 75, 77].includes(code)) return '눈';
  if ([80, 81, 82].includes(code)) return '소나기';
  if ([95, 96, 99].includes(code)) return '뇌우';

  return '날씨 정보';
}

function getWeatherIcon(code) {
  if (code === 0) return '☀️';
  if ([1, 2].includes(code)) return '🌤️';
  if (code === 3) return '☁️';
  if ([45, 48].includes(code)) return '🌫️';

  if (
    [
      51,
      53,
      55,
      56,
      57,
      61,
      63,
      65,
      66,
      67,
      80,
      81,
      82,
    ].includes(code)
  ) {
    return '🌧️';
  }

  if ([71, 73, 75, 77].includes(code)) return '🌨️';
  if ([95, 96, 99].includes(code)) return '⛈️';

  return '🌤️';
}

async function loadWeather() {
  try {
    const url = 'https://api.open-meteo.com/v1/forecast?latitude=35.1796&longitude=129.0756&current=temperature_2m,precipitation,weather_code,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min&timezone=Asia%2FSeoul';

    const response = await fetch(url);
    const data = await response.json();
    const current = data.current;

    weather.value = {
      icon: getWeatherIcon(current.weather_code),
      temperature: `${Math.round(current.temperature_2m)}°`,
      description: getWeatherDescription(current.weather_code),
      high: `🔥최고: ${Math.round(data.daily.temperature_2m_max[0])}°`,
      low: `❄️최저: ${Math.round(data.daily.temperature_2m_min[0])}°`,
      rain: `🌧️강수 ${current.precipitation}mm`,
      wind: `💨바람 ${current.wind_speed_10m}km/h`,
    };
  } catch (error) {
    console.error(error);
    weather.value.description = '현재 날씨를 불러오지 못했습니다.';
  }
}

onMounted(() => {
  loadPosts();
  loadHomeData();
  loadWeather();
});
onActivated(loadPosts);
</script>

<template>
  <section class="home-hero">
    <div class="home-hero-image">
      <img
        src="/images/hero-busan.jpg"
        alt="광안대교와 부산 해변"
      >

      <div class="home-hero-overlay">
        <span class="home-badge">
          📍 부산 지역 커뮤니티
        </span>

        <h1>
          부산의 장소마다<br>
          사람들의 이야기가 쌓이는 공간
        </h1>

        <p>
          부산 주민과 관광객이 질문, 후기, 지역소식을<br>
          자유롭게 공유하는 익명 커뮤니티입니다.
        </p>

        <div class="home-hero-actions">
          <RouterLink
            class="home-primary-button"
            to="/posts/new"
          >
            게시글 작성
          </RouterLink>

          <RouterLink
            class="home-secondary-button"
            to="/explore"
          >
            지역정보 보기
          </RouterLink>
        </div>
      </div>
    </div>
  </section>

  <section class="section community-preview">
    <div class="section-head">
      <div>
        <h2>🔥 인기 게시글</h2>
        <p>지역 주민과 관광객의 최신 이야기</p>
      </div>

      <RouterLink
        class="btn btn-ghost"
        to="/board"
      >
        전체보기
      </RouterLink>
    </div>

    <div class="community-card-grid">
<<<<<<< HEAD
      <RouterLink
        v-for="(post, index) in recentPosts"
        :key="post.id"
        class="community-card"
        :class="{
          'community-card-no-image': !post.image,
        }"
        :to="`/posts/${post.id}`"
      >
=======
      <RouterLink v-for="post in popularPosts" :key="post.id" class="community-card" :to="`/posts/${post.id}`">
>>>>>>> d7e4628194c8c7fa1c408bf7b0ee03fb39834a43
        <div class="community-card-content">
          <span class="community-category">
            {{ post.postType || post.topic || '기타' }}
          </span>

          <h3>{{ post.title }}</h3>

          <p>{{ post.content }}</p>
<<<<<<< HEAD

          <div class="community-meta">
            <span>♡ {{ 23 - index * 5 }}</span>
            <span>◎ {{ 145 - index * 28 }}</span>
=======
          <div class="community-meta">
            <span>♡ {{ post.likes || 0 }}</span>
            <span>◎ {{ post.views || 0 }}</span>
>>>>>>> d7e4628194c8c7fa1c408bf7b0ee03fb39834a43
            <span>{{ post.createdAt }}</span>
          </div>
        </div>

        <!--
          게시글에 첨부 사진이 있을 때만 표시합니다.
          사진이 없으면 이미지 영역도 생성되지 않습니다.
        -->
        <div
          v-if="post.image"
          class="community-thumb"
          :style="{
            backgroundImage: `url('${post.image}')`,
          }"
          role="img"
          :aria-label="`${post.title} 첨부 사진`"
        ></div>
      </RouterLink>
    </div>
  </section>

  <section class="section">
    <div class="section-head">
      <div>
        <h2>📍 추천 관광지</h2>
        <p>부산에서 많이 찾는 장소를 만나보세요.</p>
      </div>

      <RouterLink
        class="btn btn-ghost"
        to="/explore"
      >
        전체보기
      </RouterLink>
    </div>

    <div class="place-grid">
      <article
        v-for="place in featuredPlaces"
        :key="place.contentid"
        class="place-card"
      >
        <div
          class="place-image"
          :style="{
            backgroundImage: `url('${
              place.firstimage2
              || place.firstimage
              || '/images/hero-busan.jpg'
            }')`,
          }"
        ></div>

        <div class="place-content">
          <span class="badge">관광지</span>

          <h3>
            {{ place.title || '장소명 없음' }}
          </h3>

          <p>
            {{
              [place.addr1, place.addr2]
                .filter(Boolean)
                .join(' ')
              || '주소 정보 없음'
            }}
          </p>

          <a
            v-if="place.mapx && place.mapy"
            :href="`https://map.kakao.com/link/map/${
              encodeURIComponent(place.title || '부산 장소')
            },${place.mapy},${place.mapx}`"
            target="_blank"
            rel="noopener"
          >
            📍 지도 보기
          </a>
        </div>
      </article>

      <p
        v-if="placeError"
        class="notice"
      >
        {{ placeError }}
      </p>
    </div>
  </section>

  <section class="section">
    <div class="section-head">
      <div>
        <h2>부산 정보 한눈에 보기</h2>
        <p>
          제공 JSON 데이터를 기준으로 구성한 MVP 요약입니다.
        </p>
      </div>
    </div>

    <div class="stat-grid">
      <article class="stat-card">
        <div class="stat-icon">🏛️</div>

        <div>
          <span class="stat-value">
            {{ stats.관광지 }}
          </span>

          <span class="stat-label">
            관광지
          </span>
        </div>
      </article>

      <article class="stat-card">
        <div class="stat-icon">🎭</div>

        <div>
          <span class="stat-value">
            {{ stats.문화시설 }}
          </span>

          <span class="stat-label">
            문화시설
          </span>
        </div>
      </article>

      <article class="stat-card">
        <div class="stat-icon">🏨</div>

        <div>
          <span class="stat-value">
            {{ stats.숙박 }}
          </span>

          <span class="stat-label">
            숙박
          </span>
        </div>
      </article>

      <article class="stat-card">
        <div class="stat-icon">🛍️</div>

        <div>
          <span class="stat-value">
            {{ stats.쇼핑 }}
          </span>

          <span class="stat-label">
            쇼핑
          </span>
        </div>
      </article>
    </div>
  </section>

  <section class="weather-card">
    <small>부산 현재 날씨</small>

    <div class="weather-main">
      <span>{{ weather.icon }}</span>
      <span>{{ weather.temperature }}</span>
    </div>

    <strong>{{ weather.description }}</strong>

    <div class="weather-row">
      <span>{{ weather.high }}</span>
      <span>{{ weather.low }}</span>
    </div>

    <div class="weather-row">
      <span>{{ weather.rain }}</span>
      <span>{{ weather.wind }}</span>
    </div>
  </section>
</template>
