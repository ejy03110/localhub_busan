<script setup>
import { ref } from 'vue'
const menuOpen = ref(false)
const closeMenu = () => { menuOpen.value = false }
</script>
<template>
  <!-- 상단 메뉴: 축제 캘린더 메뉴는 요구사항에 따라 제거했습니다. -->
  <header class="app-header">
    <div class="header-inner">
      <RouterLink class="logo" to="/" @click="closeMenu"><span class="logo-mark">L</span><span>LocalHub</span></RouterLink>
      <nav class="main-nav" :class="{ open: menuOpen }" aria-label="주요 메뉴">
        <RouterLink to="/" @click="closeMenu">홈</RouterLink>
        <RouterLink to="/explore" @click="closeMenu">지역 탐색</RouterLink>
        <RouterLink to="/board" @click="closeMenu">커뮤니티</RouterLink>
      </nav>
      <button class="mobile-menu" type="button" @click="menuOpen=!menuOpen" aria-label="모바일 메뉴 열기">☰</button>
    </div>
  </header>
</template>
