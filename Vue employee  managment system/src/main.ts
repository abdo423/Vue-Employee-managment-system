import { createApp } from 'vue'
import { createPinia } from 'pinia'
import "../styles.css";

import PrimeVue from 'primevue/config';
import Aura from '@primeuix/themes/aura';
import ToastService from 'primevue/toastservice';
import DialogService from 'primevue/dialogservice';
import router from './router'
import ConfirmationService from 'primevue/confirmationservice';
import App from './App.vue';

const app = createApp(App)
app.use(ToastService);
app.use(createPinia())
app.use(router)
app.use(PrimeVue,{
  theme:{
    preset:Aura
  }
});
app.use(DialogService);
app.use(ConfirmationService);
app.mount('#app')
