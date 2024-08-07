import VueI18n from 'vue-i18n'
import en from './locales/en.json'
import zhLocale from './locales/zh-Hans.json'
import Vue from 'vue'
Vue.use(VueI18n)
 
 
const lang = uni.getStorageSync('language') || '0';//获取缓存中的语言
// VueI18n构造函数所需要的配置
console.log('系统lang',lang)
const i18nConfig = {
    locale: uni.getLocale(),// 获取已设置的语言
		// 所需要用的语言包
    messages:[
		en,
		'zh-Hans':zhLocale
		]
	}
const i18n = new VueI18n(i18nConfig)
Vue.prototype._i18n = i18n
// 设置应用启动名称
const currentLocale = i18n.locale
const appName = i18n.messages[currentLocale].app_name
export default i18n