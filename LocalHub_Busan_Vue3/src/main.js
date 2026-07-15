import { createApp } from 'vue'
import App from './App.vue'
import router from './router/index.js'
import './assets/styles.css'

// Vue 애플리케이션을 생성하고 Router를 연결한 뒤 #app에 표시합니다.
createApp(App).use(router).mount('#app')
