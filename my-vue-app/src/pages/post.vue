<script setup>
import { useRoute } from 'vue-router'
const route = useRoute()
</script>

<template>
  <div><h1>Post {{ route.params.id }}</h1><p>게시글 상세(플레이스홀더)</p></div>
</template>