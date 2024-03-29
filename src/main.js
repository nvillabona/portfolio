import Vue from 'vue'
import App from './App.vue'
import './registerServiceWorker'
import router from './router'

import Vuesax from 'vuesax'

import 'vuesax/dist/vuesax.css' //Vuesax styles

require('vue2-animate/dist/vue2-animate.min.css')

Vue.config.productionTip = false
Vue.use(Vuesax)

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')


