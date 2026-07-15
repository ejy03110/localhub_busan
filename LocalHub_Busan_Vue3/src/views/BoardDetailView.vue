<script setup>
import { computed, ref } from 'vue'; import { useRoute,useRouter } from 'vue-router'; import { getPost,deletePost,verifyPassword } from '../services/postService.js'
const route=useRoute(),router=useRouter(),post=computed(()=>getPost(route.params.id)),show=ref(false),mode=ref(''),password=ref(''),error=ref('')
function ask(m){mode.value=m;password.value='';error.value='';show.value=true}
function confirm(){if(!verifyPassword(post.value,password.value)){error.value='비밀번호가 일치하지 않습니다.';return} if(mode.value==='edit')router.push(`/board/${post.value.id}/edit`);else{deletePost(post.value.id);router.push('/board')}}
</script>
<template><div class="page"><article v-if="post" class="detail-card"><div class="breadcrumb">홈 &gt; 커뮤니티 &gt; 상세</div><header><span class="badge">{{post.category}}</span><h1>{{post.title}}</h1><small>작성일 {{post.createdAt}}</small></header><div class="detail-body">{{post.content}}</div><footer><RouterLink class="btn ghost" to="/board">목록으로</RouterLink><div><button class="btn soft" @click="ask('edit')">수정</button><button class="btn danger" @click="ask('delete')">삭제</button></div></footer></article><p v-else>게시글을 찾을 수 없습니다.</p>
<div v-if="show" class="modal-backdrop" @click.self="show=false"><div class="modal"><h3>{{mode==='edit'?'수정':'삭제'}} 비밀번호 확인</h3><input v-model="password" type="password" placeholder="작성 시 입력한 비밀번호" @keyup.enter="confirm"><p class="error">{{error}}</p><div><button class="btn ghost" @click="show=false">취소</button><button class="btn primary" @click="confirm">확인</button></div></div></div></div></template>
