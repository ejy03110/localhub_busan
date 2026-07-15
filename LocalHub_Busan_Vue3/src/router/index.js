import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

// 화면 주소와 Vue 화면 컴포넌트를 연결합니다.
const routes = [
  { path: '/', name: 'home', component: HomeView },
  { path: '/explore', name: 'explore', component: () => import('../views/ExploreView.vue') },
  { path: '/board', name: 'board', component: () => import('../views/BoardListView.vue') },
  { path: '/board/write', name: 'board-write', component: () => import('../views/BoardFormView.vue') },
  { path: '/board/:id', name: 'board-detail', component: () => import('../views/BoardDetailView.vue') },
  { path: '/board/:id/edit', name: 'board-edit', component: () => import('../views/BoardFormView.vue') },
]
export default createRouter({ history: createWebHistory(import.meta.env.BASE_URL), routes, scrollBehavior:()=>({top:0}) })
