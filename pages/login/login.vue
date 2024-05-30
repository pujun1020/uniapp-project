<!-- 蓝色登录页面2 -->
<template>
	<view>
		<view class="img-a">
			<view class="t-b">
				{{$getLang('您好')}}，
				<br />
				{{$getLang('欢迎使用')}}{{$getLang('恒勃智驾')}}
			</view>
		</view>
		<view class="login-view" style="">
			<view class="t-login">
				<form class="cl">
					<view class="t-a">
						<text class="txt">{{$getLang('账号')}}</text>
						<u-input type="text" :placeholder="$getLang('请输入账号')" v-model="username" />
					</view>
					<view class="t-a">
						<text class="txt">{{$getLang('密码')}}</text>
						<u-input type="password" :placeholder="$getLang('请输入密码')" v-model="password" />
					</view>
					<view class="u-flex u-col-center">
						<u-checkbox-group>
							<u-checkbox v-model="remPassword"></u-checkbox>
						</u-checkbox-group>
						{{$getLang('记住账号和密码')}}
					</view>
					<view class="u-m-t-100">
						<button @tap="login()">{{$getLang('登 录')}}</button>
						<view class="u-text-center u-type-primary u-font-24 u-m-t-40" @click="reg">{{$getLang('还没有账号？点击注册')}}</view>
					</view>
				</form>
			</view>
		</view>
	</view>
</template>
<script>
	import { md5 } from '@/common/md5.js'
	import {connectWifi,getConnectedSSID,removeWifi,removeWifiBySSID} from '../../common/cx-wifi/cx-wifi.js'
	export default {
		data() {
			return {
				username: '', 
				password: '',
				remPassword: false
			};
		},
		onLoad() {
			uni.setNavigationBarTitle({title:this.$getLang('登录')});
			if (uni.getStorageSync('remPassword')) {
				this.username = uni.getStorageSync('username') || ''
				this.password = uni.getStorageSync('password') || ''
				this.remPassword = uni.getStorageSync('remPassword') === true
			}
			
		},
		methods: {
			//当前登录按钮操作
			login() {
				var that = this;
				if (!that.username) {
					uni.showToast({
						title:this.$getLang('请输入您的账号'),
						icon: 'none'
					});
					return;
				}
				// if (!/^[1][3,4,5,7,8,9][0-9]{9}$/.test(that.phone)) {
				// 	uni.showToast({
				// 		title: '请输入正确手机号',
				// 		icon: 'none'
				// 	});
				// 	return;
				// }
				if (!that.password) {
					uni.showToast({
						title:this.$getLang('请输入您的密码'),
						icon: 'none'
					});
					return;
				}
				this.$u.api.login({ username: this.username, password: md5(this.password, 16).toUpperCase() })
					.then(res => {
						if (res.code === 0) {
							if (this.remPassword) {
								uni.setStorageSync('username', this.username)
								uni.setStorageSync('password', this.password)
								uni.setStorageSync('remPassword', this.remPassword)
							} else {
								uni.setStorageSync('password', '')
								uni.setStorageSync('remPassword', false)
							}
							uni.showToast({
								title:this.$getLang('登录成功'),
								icon: 'success'
							});
							getApp().globalData.apitoken = res.token
							getApp().globalData.user = res.user
							uni.setStorageSync('apitoken', res.token)
							uni.setStorageSync('user', res.user)
							uni.reLaunch({
								url:"/pages/index/index"
							})
						} else {
							uni.showToast({
								title: res.message,
								icon: 'none'
							});
						}
						
					}).catch(e => {
						console.log('登录失败：',e)
						if(e.errMsg.indexOf('request:fail abort statusCode:-1')>-1){
							var curSSID=getConnectedSSID();
							console.log(curSSID.replace('"','').replace('"','')) 
							removeWifiBySSID(curSSID.replace('"','').replace('"',''));
							uni.showLoading({
								title:'网络连接中',
								mask:true,
							})
							
							setTimeout(()=>{
								uni.hideLoading();
								uni.showToast({
									title:'网络异常，请重新尝试点击登录！',
									icon:'none'
								})
								
								setTimeout(()=>{
									uni.redirectTo({
										url:'/pages/login/login'
									})
								},1500)
							},1500)
					
						}else{
							uni.showToast({
								title:this.$getLang('账号或密码错误'),
								icon: 'none'
							});
						}
						
					})
			},
			//注册按钮点击
			reg() {
				uni.navigateTo({
					url:"/pages/login/register"
				})
			}
		}
	};
</script>
<style>
	.txt {
		font-size: 32rpx;
		font-weight: bold;
		color: #333333;
	}

	.img-a {
		width: 100%;
		height: 450rpx;
		background-image: url(../../static/login/head.png);
		background-size: 100%;
	}

	.login-view {
		width: 100%;
		position: relative;
		margin-top: -120rpx;
		background-color: #ffffff;
		border-radius: 8% 8% 0% 0;
	}

	.t-login {
		width: 600rpx;
		margin: 0 auto;
		font-size: 28rpx;
		padding-top: 80rpx;
	}

	.t-login button {
		font-size: 28rpx;
		background: #2796f2;
		color: #fff;
		height: 90rpx;
		line-height: 90rpx;
		border-radius: 50rpx;
		font-weight: bold;
	}

	.t-login input {
		height: 90rpx;
		line-height: 90rpx;
		margin-bottom: 50rpx;
		border-bottom: 1px solid #e9e9e9;
		font-size: 28rpx;
	}

	.t-login .t-a {
		position: relative;
	}

	.t-b {
		text-align: left;
		font-size: 42rpx;
		color: #ffffff;
		padding: 130rpx 0 0 70rpx;
		font-weight: bold;
		line-height: 70rpx;
	}

	.t-login .t-c {
		position: absolute;
		right: 22rpx;
		top: 22rpx;
		background: #5677fc;
		color: #fff;
		font-size: 24rpx;
		border-radius: 50rpx;
		height: 50rpx;
		line-height: 50rpx;
		padding: 0 25rpx;
	}

	.t-login .t-d {
		text-align: center;
		color: #999;
		margin: 80rpx 0;
	}

	.t-login .t-e {
		text-align: center;
		width: 250rpx;
		margin: 80rpx auto 0;
	}

	.t-login .t-g {
		float: left;
		width: 50%;
	}

	.t-login .t-e image {
		width: 50rpx;
		height: 50rpx;
	}

	.t-login .t-f {
		text-align: center;
		margin: 150rpx 0 0 0;
		color: #666;
	}

	.t-login .t-f text {
		margin-left: 20rpx;
		color: #aaaaaa;
		font-size: 27rpx;
	}

	.t-login .uni-input-placeholder {
		color: #aeaeae;
	}

	.cl {
		zoom: 1;
	}

	.cl:after {
		clear: both;
		display: block;
		visibility: hidden;
		height: 0;
		content: '\20';
	}
</style>