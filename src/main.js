import { createApp } from 'vue'
import { Quasar } from 'quasar'
import quasarLang from 'quasar/lang/ru'
import iconSet from 'quasar/icon-set/material-icons'

import App from './App.vue'
import router from './router'

import '@quasar/extras/material-icons/material-icons.css'
import 'quasar/src/css/index.sass'
import './css/app.scss'

const app = createApp(App)

app.use(Quasar, {
  lang: quasarLang,
  iconSet
})

app.use(router)
app.mount('#q-app')
