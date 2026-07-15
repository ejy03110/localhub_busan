<script setup>
import { ref } from 'vue';
import AppHeader from './components/AppHeader.vue';
import AppFooter from './components/AppFooter.vue';
import ChatPanel from './components/ChatPanel.vue';

const isChatOpen = ref(false);
</script>

<template>
  <a class="skip-link" href="#main">본문 바로가기</a>

  <AppHeader @open-chat="isChatOpen = true" />

  <div id="main">
    <RouterView />
  </div>

  <ChatPanel
    :open="isChatOpen"
    @open="isChatOpen = true"
    @close="isChatOpen = false"
  />

  <AppFooter />
</template>
