// src/main.ts
import { createApp } from 'vue';
import App from './App.vue';
import router from './router'; // Importe o router

const app = createApp(App);

app.use(router); // Registre o router

app.mount('#app');