<script setup>
import { ref, watch } from 'vue';
import { useRoute } from 'vue-router';

defineEmits(['open-chat']);

const route = useRoute();
const isMenuOpen = ref(false);

function toggleMenu() {
  isMenuOpen.value = !isMenuOpen.value;
}

function closeMenu() {
  isMenuOpen.value = false;
}

watch(
  () => route.fullPath,
  () => closeMenu(),
);
</script>

<template>
  <header class="app-header">
    <div class="header-inner">
      <RouterLink class="logo" to="/" aria-label="LocalHub 홈">
        <span class="logo-mark">L</span>
        <span>LocalHub</span>
      </RouterLink>

      <nav
        class="main-nav"
        :class="{ open: isMenuOpen }"
        aria-label="주요 메뉴"
      >
        <RouterLink class="nav-link" active-class="active" exact-active-class="active" to="/">
          홈
        </RouterLink>
        <RouterLink class="nav-link" active-class="active" to="/explore">
          지역 탐색
        </RouterLink>
        <RouterLink class="nav-link" active-class="active" to="/board">
          커뮤니티
        </RouterLink>
      </nav>

      <div class="header-actions">
        <button
          class="icon-btn"
          type="button"
          aria-label="챗봇 열기"
          @click="$emit('open-chat')"
        >
          💬
        </button>
        <button
          class="icon-btn mobile-nav-button"
          type="button"
          :aria-expanded="isMenuOpen"
          aria-label="메뉴 열기 또는 닫기"
          @click="toggleMenu"
        >
          {{ isMenuOpen ? '×' : '☰' }}
        </button>
      </div>
    </div>
  </header>
</template>
