import App from './App'
import en from './locale/en.json'
import zhHans from './locale/zh-Hans.json'
import socket from './common/socket.js'

Vue.prototype.$socket = socket;

const messages = {
	en,
	'zh-Hans': zhHans
}
console.log('uni.getLocale()',uni.getLocale())
let i18nConfig = {
  locale: uni.getLocale(),// 获取已设置的语言
  messages
}

// #ifndef VUE3
import Vue from 'vue'
import VueI18n from 'vue-i18n'// v8.x
Vue.use(VueI18n)
const i18n = new VueI18n(i18nConfig)

import uView from "uview-ui";
Vue.use(uView);

import './uni.promisify.adaptor'
Vue.config.productionTip = false
App.mpType = 'app'
const app = new Vue({
	i18n,
  ...App
})


// http拦截器，此为需要加入的内容，如果不是写在common目录，请自行修改引入路径
import httpInterceptor from '@/common/http.interceptor.js'
// 这里需要写在最后，是为了等Vue创建对象完成，引入"app"对象(也即页面的"this"实例)
Vue.use(httpInterceptor, app)
// http接口API集中管理引入部分
import httpApi from '@/common/http.api.js'
import httpUploadApi from '@/common/http.upload.js'
Vue.use(httpApi, app)
Vue.use(httpUploadApi, app)

app.$mount()
// #endif

import langObg from './common/language.js'
// 挂载全局方法
Vue.prototype.$getLang = langObg.getLangContent;
Vue.prototype.$lang=langObg.lang;


// #ifdef VUE3
import { createSSRApp } from 'vue'
export function createApp() {
  const app = createSSRApp(App)
  return {
    app
  }
}
// #endif