<template>
	<view class="wrap">
		<u-form :model="form" ref="uForm">
			<u-form-item label="账号" prop="userName" label-width="150"><u-input v-model="form.userName"
					placeholder="请输入账号" /></u-form-item>
			<u-form-item label="手机号码" prop="mobile" label-width="150"><u-input v-model="form.mobile"
					placeholder="请输入手机号码" /></u-form-item>
			<u-form-item label="姓名" prop="nickName" label-width="150"><u-input v-model="form.nickName"
					placeholder="请输入姓名" /></u-form-item>
			<u-form-item label="邮箱" prop="email" label-width="150"><u-input v-model="form.email"
					placeholder="请输入邮箱" /></u-form-item>
			<u-form-item label="密码" prop="password" label-width="150"><u-input type="password" v-model="form.password"
					placeholder="请输入密码" /></u-form-item>
			<u-form-item label="确认密码" prop="confirmpass" label-width="150"><u-input type="password" v-model="form.confirmpass"
					placeholder="请输入确认密码" /></u-form-item>
		</u-form>
		<view class="u-m-t-100">
			<button @tap="register()">注 册</button>
			<view class="u-text-center u-type-primary u-font-24 u-m-t-40" @click="back">已有帐号？点击登陆</view>
		</view>
	</view>
</template>

<script>
	import { md5 } from '@/common/md5.js'
	
	export default {
		data() {
			return {
				form: {
					userName: '',
					nickName: '',
					mobile: '',
					email: '',
					password: '',
					confirmpass: ''
				},
				rules: {
					userName: [{
						required: true,
						message: '请输入账号',
						trigger: ['change', 'blur']
					}],
					nickName: [{
						required: true,
						message: '请输入姓名',
						trigger: ['change', 'blur']
					}],
					mobile: [{
						required: true,
						message: '请输入手机号',
						trigger: ['change', 'blur']
					}],
					email: [{
						required: true,
						message: '请输入邮箱',
						trigger: ['change', 'blur']
					}],
					password: [{
						required: true,
						message: '请输入密码',
						trigger: ['change', 'blur']
					}],
					confirmpass: [{
						required: true,
						message: '请输入确认密码',
						trigger: ['change', 'blur']
					}]
				}
			}
		},
		methods: {
			back() {
				uni.navigateBack()
			},
			register() {
				if (this.form.password !== this.form.confirmpass) {
					uni.showToast({
						title: '两次密码输入不一致！',
						icon: 'none'
					})
					return
				}
				this.$refs.uForm.validate(valid => {
					if (valid) {
						const params = { ...this.form, password: md5(this.form.password, 16).toUpperCase()}
						console.log(params)
						this.$u.api.register(params).then(res => {
							if (res.code === 0) {
								uni.showToast({
									title: '注册成功！',
									icon: 'none'
								});
								uni.navigateTo({
									url:"/pages/login/login"
								})
							} else {
								uni.showToast({
									title: res.message,
									icon: 'none'
								});
							}
						})
					}
				});
			}
		},
		onReady() {
			this.$refs.uForm.setRules(this.rules);
		}
	}
</script>

<style>
	button {
		font-size: 28rpx;
		background: #2796f2;
		color: #fff;
		height: 90rpx;
		line-height: 90rpx;
		border-radius: 50rpx;
		font-weight: bold;
	}

	.wrap {
		margin: 40rpx;
	}
</style>