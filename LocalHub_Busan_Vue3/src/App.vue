<script setup>
import AppHeader from './components/common/AppHeader.vue'
import AppFooter from './components/common/AppFooter.vue'
import ChatbotWidget from './components/chat/ChatbotWidget.vue'
</script>

<template>
  <!-- 모든 화면에서 공통으로 보이는 레이아웃입니다. -->
  <a class="skip-link" href="#main-content">본문 바로가기</a>
  <AppHeader />
  <main id="main-content"><RouterView /></main>
  <AppFooter />
  <!-- 요청에 따라 챗봇을 웹 오른쪽 하단에 항상 표시합니다. -->
  <ChatbotWidget />
</template>
