import { createApp } from 'vue';
import App from './App.vue';
import router from './router/index.js';
import './assets/styles.css';
import './assets/stage2.css';

createApp(App).use(router).mount('#app');
