// /common/http.api.js

// 如果没有通过拦截器配置域名的话，可以在这里写上完整的URL(加上域名部分)
let hotUrl = 'http://106.53.202.68:4000/loadbalancing';
let requestUrl = ''

// 此处第二个参数vm，就是我们在页面使用的this，你可以通过vm获取vuex等操作，更多内容详见uView对拦截器的介绍部分：
// https://uviewui.com/js/http.html#%E4%BD%95%E8%B0%93%E8%AF%B7%E6%B1%82%E6%8B%A6%E6%88%AA%EF%BC%9F
const install = (Vue, vm) => {
	// 此处没有使用传入的params参数
	let getCloud = (params = {}) => vm.$u.get(hotUrl, {});
	// 设置请求url和登录负载均衡
	let setRequestUrl = (url, username, password) => requestUrl = url
	// 注册
	let register = (params = {}) => vm.$u.post(requestUrl + '/api/user/regist', params, { 'content-type': 'application/x-www-form-urlencoded' });
	// 登录
	let login = (params = {}) => vm.$u.get(requestUrl + '/api/login', params);
	// 获取用户信息
	let getUser = (params = {}) => vm.$u.get(requestUrl + '/api/user', params);
	// 设置用户信息
	let setUser = (params = {}) => vm.$u.put(requestUrl + '/api/user', params, { 'content-type': 'application/x-www-form-urlencoded' });
	// 修改账户密码
	let modifypwd = (params = {}) => vm.$u.put(requestUrl + '/api/user/modifypwd', params);
	// 获取配置信息
	let getConfig = (params = {}) => vm.$u.get(requestUrl + '/api/userconfig', params);
	// 修改配置信息
	let setConfig = (params = {}) => vm.$u.put(requestUrl + '/api/userconfig', params);
	// 提交用户反馈
	let feedback = (params = {}) => vm.$u.post(requestUrl + '/api/userfeedback', params);
	// 上报设备信息到云端
	let sendDevInfo = (params = {}) => vm.$u.post(requestUrl + '/api/dev/info', params);
	// 查询云端视频列表
	let getCloundVideoList = (params = {}) => vm.$u.get(requestUrl + '/api/video/get', params);
	// 删除云端视频
	let delteCloundVideo = (params = {}) => vm.$u.delete(requestUrl + '/api/video/delete', params);
	// 获取app最新版本信息
	let getLastPackage = (params = {}) => vm.$u.get(requestUrl + '/api/apppackage/lastpackage', params);
	// 获取设备列表信息
	let getEquipList = (params = {}) => vm.$u.get(requestUrl + '/api/dev', params);
	// 删除设备信息
	let delteEquip = (params = {}) => vm.$u.delete(requestUrl + '/api/dev', params);
	// 获取MCU最新版本信息（用于MCU升级）
	let getMcuPackage = (params = {}) => vm.$u.get(requestUrl + '/api/mcupackage/lastpackage', params);
	// 获取OSAPP最新版本信息（用于OSAPP升级）
	let getOsAppPackage = (params = {}) => vm.$u.get(requestUrl + '/api/osapppackage/lastpackage', params);
	//用户头像上传地址
	let uploadpic= (params = {}) => requestUrl + '/api/user/uploadpic';
	// 将各个定义的接口名称，统一放进对象挂载到vm.$u.api(因为vm就是this，也即this.$u.api)下
	vm.$u.api = {getCloud, setRequestUrl, register, login, getUser, setUser, modifypwd, getConfig, setConfig, feedback, sendDevInfo, getCloundVideoList, getLastPackage, getEquipList, delteEquip, getMcuPackage, getOsAppPackage,uploadpic};
}

export default {
	install
}