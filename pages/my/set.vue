<template>
	<view class="wrap">
		<!-- list -->
		<u-cell-group :border="false">
			<u-cell-item style="display: none;" :title="$getLang('必须wifi环境上传')" hover-class="none" :arrow="false">
				<u-switch v-model="wifi" @change="onChangeSwitch('wifi', wifi)" size="30" :loading="loading"></u-switch>
			</u-cell-item>
			<u-cell-item  style="display: none;" :title="$getLang('上传成功提示窗')" hover-class="none" :arrow="false">
				<u-switch v-model="uploadSound" @change="onChangeSwitch('uploadSound', uploadSound)" size="30" :loading="loading"></u-switch>
			</u-cell-item>
			<u-cell-item  style="display: none;" :title="$getLang('下载成功提示窗')" hover-class="none" :arrow="false">
				<u-switch v-model="downloadSound" @change="onChangeSwitch('downloadSound', downloadSound)" size="30" :loading="loading"></u-switch>
			</u-cell-item>
			<u-cell-item :title="$getLang('地区')" hover-class="none" :value="area" @click="showArea = true"></u-cell-item>
			<u-cell-item :title="$getLang('语言')" hover-class="none" :value="language" @click="showLanguage = true"></u-cell-item>
			<u-cell-item :title="$getLang('关于我们')" hover-class="none" @click="about"></u-cell-item>
		</u-cell-group>
		<u-select v-model="showArea" :list="areaList" @confirm="onConfirmArea"></u-select>
		<u-select v-model="showLanguage" :list="languageList" @confirm="onConfirmLanguage"></u-select>
	</view>
</template>

<script>
	
	var lang = require("../../common/language.js");
	
	export default {
		data() {
			return {
				id: '',
				wifi: false,
				uploadSound: true,
				downloadSound: true,
				area: '',
				language: '',
				loading: false,
				showArea: false,
				areaList: [{ value: '0', label:this.$getLang('中国') }, { value: '1', label: this.$getLang('美国') }],
				showLanguage: false,
				languageList: [{ value: '0', label: this.$getLang('中文') }, { value: '1', label: this.$getLang('英文') }]
			}
		},
		onLoad() {
			uni.setNavigationBarTitle({title:this.$getLang('设置')});
			this.$u.api.getConfig({ userId: getApp().globalData.user.id })
				.then(res => {
					if (res.code === 0) {
						console.log(res)
						const data = res.data
						this.id = res.id
						this.wifi = data.wifi === '1'
						this.uploadSound = data.uploadSound === '1'
						this.downloadSound = data.downloadSound === '1'
						this.area = data.area === '0' ? this.$getLang('中国') : this.$getLang('美国')
						this.language = data.language === '0' ? this.$getLang('中文') : this.$getLang('英文')
						var language=uni.getStorageSync('language');
						if(language==0){
							this.language=this.$getLang('中文');
						}
						if(language==1){
							this.language=this.$getLang('英文');
						}
					} else {
						uni.showToast({
							title: res.message,
							icon: 'none'
						})
					}
				})
		},
		methods: {
			onChangeSwitch(key, value) {
				const params = { id: this.id }
				params[key] = value ? '1' : '0'
				this.$u.api.setConfig(params)
					.then(res => {
						if (res.code === 0) {
							uni.showToast({
								title: this.$getLang('修改提示成功'),
								icon: 'none'
							})
							if(key=="uploadSound"){
								uni.setStorageSync(key,value?this.$getLang('开启'):this.$getLang('关闭'));
							}
							if(key=="downloadSound"){
								uni.setStorageSync(key,value?this.$getLang('开启'):this.$getLang('关闭'));
							}
							if(key=="wifi"){
								uni.setStorageSync(key,value?"":"no_wifi");
							}
						} else {
							uni.showToast({
								title: res.message,
								icon: 'none'
							})
						}
					})
			},
			onConfirmArea(e) {
				this.$u.api.setConfig({ id: this.id, area: e[0].value })
					.then(res => {
						if (res.code === 0) {
							uni.showToast({
								title: this.$getLang('修改地区成功'),
								icon: 'none'
							})
							this.area = e[0].label
						} else {
							uni.showToast({
								title: res.message,
								icon: 'none'
							})
						}
					})
			},
			onConfirmLanguage(e) {
				var langIndex =e[0].value; 
				uni.setStorageSync('language',e[0].value);
				
				this.$u.api.setConfig({ id: this.id, language: e[0].value })
					.then(res => {
						if (res.code === 0) {
							uni.showToast({
								title: this.$getLang('语言切换成功'),
								icon: 'none'
							})
							this.areaList=[{ value: '0', label:this.$getLang('中国') }, { value: '1', label: this.$getLang('美国') }];
							this.languageList=[{ value: '0', label: this.$getLang('中文') }, { value: '1', label: this.$getLang('英文') }];
							this.area=this.$getLang(this.area);
							this.language = e[0].label
							
						} else {
							uni.showToast({
								title: this.$getLang(res.code),
								icon: 'none'
							})
						}
					}).catch(e => console.log(e))
			},
			about() {
				uni.navigateTo({
					url: "/pages/my/about"
				})
			},
			getLangStr:function(str){
				return this.$getLang(str);
			}
		}
	}
</script>

<style lang="scss">
	body,
	html {
		background-color: #F3F3F5;
	}

	.wrap {
		background-color: white;
		padding: 30rpx 30rpx 600rpx 30rpx;
		border-radius: 20rpx;
		margin: 40rpx;
	}
</style>