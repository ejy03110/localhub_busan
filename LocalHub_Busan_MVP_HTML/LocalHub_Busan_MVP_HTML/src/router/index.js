import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';
import ExploreView from '../views/ExploreView.vue';
import BoardView from '../views/BoardView.vue';
import PostDetailView from '../views/PostDetailView.vue';
import PostWriteView from '../views/PostWriteView.vue';

const routes = [
  { path: '/', name: 'home', component: HomeView },
  { path: '/explore', name: 'explore', component: ExploreView },
  { path: '/board', name: 'board', component: BoardView },
  { path: '/posts/new', name: 'post-write', component: PostWriteView },
  { path: '/posts/:id/edit', name: 'post-edit', component: PostWriteView },
  { path: '/posts/:id', name: 'post-detail', component: PostDetailView },
  { path: '/:pathMatch(.*)*', redirect: '/' },
];

export default createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() { return { top: 0 }; },
});
