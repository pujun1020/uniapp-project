<template>
	<view class="wrap">
		<u-navbar :is-back="false" :background="background" :border-bottom="false"></u-navbar>
		<!-- header -->
		<view class="wrap__header">
			<u-avatar v-if="!user.photo" src="/static/tabbar/menu_my_active.png" size="100"></u-avatar>
			<u-avatar v-else :src="user.photo" size="mini"></u-avatar>
			<view class="u-flex-col u-m-l-30">
				<text class="u-font-30 u-font-weight">{{ user.nickName}}</text>
				<text class="u-m-t-20 u-type-info u-font-24">{{ user.userName }}</text>
			</view>
		</view>
		<!-- list -->
		<view class="wrap__list">
			<u-cell-group :border="false">
				<u-cell-item icon="man-add" :title="$getLang('用户信息')" @click="menu(1)" hover-class="none"></u-cell-item>
				<u-cell-item icon="kefu-ermai" :title="$getLang('用户反馈')" @click="menu(2)" hover-class="none"></u-cell-item>
				<u-cell-item icon="setting" :title="$getLang('设置信息')" @click="menu(3)" hover-class="none"></u-cell-item>
				<u-cell-item icon="file-text" :title="$getLang('隐私协议')" @click="menu(4)" hover-class="none"></u-cell-item>
				<u-cell-item icon="man-delete" :title="$getLang('退出登录')" style="color: #dd6161" @click="login" hover-class="none"></u-cell-item>
				<!-- <u-cell-item icon="file-text" title="scoket测试" @click="test()" hover-class="none"></u-cell-item> -->
			</u-cell-group>
		</view>

		<u-tabbar v-model="tabCurrent" :list="tablist" :mid-button="true" :border-top="false" active-color="#087DFF"
			@change="changes" mid-button-size="140" icon-size="50"></u-tabbar>
	</view>
</template>

<script>
	import {connectWifi,getConnectedSSID,getConnectedSSIDNew,removeWifi,removeWifiBySSID} from '../../common/cx-wifi/cx-wifi.js'
	export default {
		data() {
			return {
				background: {
					background: "#F3F3F5"
				},
				tablist: [{
						iconPath: "/static/tabbar/menu_ls.png",
						selectedIconPath: "/static/tabbar/menu_ls_active.png",
						text: this.$getLang('在路上'),
						customIcon: false
					},
					{
						iconPath: "/static/tabbar/car_un.png",
						selectedIconPath: "/static/tabbar/car.png",
						text: '',
						midButton: true,
						customIcon: false,
					},
					{
						iconPath: "/static/tabbar/menu_my.png",
						selectedIconPath: "/static/tabbar/menu_my_active.png",
						text: this.$getLang('我的'),
						customIcon: false,
					}
				],
				tabCurrent: 2,
				user: {}
			}
		},
		onShow() {
		
		},
		onLoad() {
			const token = uni.getStorageSync('apitoken')
			const user = uni.getStorageSync('user')
			
			if (token && user) {
				this.user = user;
			}else{
				uni.redirectTo({
					url:'/pages/login/login'
				})
			}
			
		},
		methods: {
			async menu(param) {
				var getCurSSID=await getConnectedSSIDNew();//当前的网络wifi
				if(getApp().globalData.equip){
					const ssid = getApp().globalData.equip.apSN;//设备绑定的wifi
					if(`"${ssid}"`==getCurSSID){
						uni.showModal({
							title: this.$getLang('提示'),
							content:'您当前连接的是设备WIFI，暂无网络，无法操作用户信息！',
							showCancel:false,
							confirmText:this.$getLang('确定'),
							success:(res)=>{
								
							}
						})
						return;
					}
				}
				else{
					if (param == 1) {
						uni.navigateTo({
							url: "/pages/my/userinfo"
						})
					} else if (param == 2) {
						uni.navigateTo({
							url: "/pages/my/feedback"
						})
					} else if (param == 3) {
						uni.navigateTo({
							url: "/pages/my/set"
						})
					} else {
						uni.navigateTo({
							url: "/pages/my/privacy"
						})
					}
				}
				
				
			},
			test() {
				uni.navigateTo({
					url: "/pages/my/test"
				})
			},
		  async	login() {
				var getCurSSID=await getConnectedSSIDNew();//当前的网络wifi
				
				if(getApp().globalData.equip){
					const ssid = getApp().globalData.equip.apSN;//设备绑定的wifi
					if(`"${ssid}"`==getCurSSID){
						uni.showModal({
							title: this.$getLang('提示'),
							content:'您当前连接的是设备WIFI，暂无网络，无法操作用户信息！',
							showCancel:false,
							confirmText:this.$getLang('确定'),
							success:(res)=>{
								
							}
						})
						return;
					}
				}
				else{
				
					uni.showModal({
						title: this.$getLang('提示'),
						content:this.$getLang('确认要退出登录吗') ,
						cancelText:this.$getLang('取消'),
						confirmText:this.$getLang('确认'),
						success: (res) => {
							if (res.confirm) {
								uni.removeStorageSync('username');
								uni.removeStorageSync('password');
								uni.removeStorageSync('remPassword');
								uni.removeStorageSync('apitoken');
								uni.removeStorageSync('user');
								uni.removeStorageSync('equip');
								getApp().globalData.equip =null;
								getApp().globalData.user=null;
								uni.navigateTo({
									url: "/pages/login/login"
								})
							}
						}
					})
				}
			},
			changes(index) {
				if (index == 0) {
					uni.navigateTo({
						url: "/pages/home/home",
						animationType: "fade-in"
					})
				} else if (index == 1) {
					uni.navigateTo({
						url: "/pages/index/index",
						animationType: "fade-in"
					})
				}
			},
		}
	}
</script>

<style lang="scss">
	body,
	html {
		background-color: #F3F3F5;
	}

	.wrap {

		&__header {
			margin: 30rpx 30rpx 80rpx 30rpx;
			display: flex;
			align-items: center;
		}

		&__list {
			background-color: white;
			padding: 0 30rpx 30rpx 30rpx;
			border-radius: 20rpx;
			margin: 30rpx;
		}
	}
</style>