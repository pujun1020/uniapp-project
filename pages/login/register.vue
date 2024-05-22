<template>
	<view class="wrap">
		<u-form :model="form" ref="uForm">
			<u-form-item :label="$getLang('账号')" prop="userName" label-width="200"><u-input v-model="form.userName"
					:placeholder="$getLang('请输入账号')" /></u-form-item>
			<u-form-item :label="$getLang('手机号')" prop="mobile" label-width="200"><u-input v-model="form.mobile"
					:placeholder="$getLang('请输入手机号')" maxlength="11" type="number" /></u-form-item>
			<u-form-item :label="$getLang('姓名')" prop="nickName" label-width="200"><u-input v-model="form.nickName"
					:placeholder="$getLang('请输入姓名')" /></u-form-item>
			<u-form-item :label="$getLang('邮箱')" prop="email" label-width="200"><u-input v-model="form.email" @input="handleInputEmail"
					:placeholder="$getLang('请输入邮箱')" maxlength="150" /></u-form-item>
			<u-form-item :label="$getLang('密码')" prop="password" label-width="200">
				<u-input type="password" v-model="form.password"
					:placeholder="$getLang('请输入密码')"  maxlength="20" /></u-form-item>
			<u-form-item :label="$getLang('确认密码')" prop="confirmpass" label-width="200">
				<u-input type="password" v-model="form.confirmpass"
					:placeholder="$getLang('请输入确认密码')"  maxlength="20" /></u-form-item>
		</u-form>
		<view class="u-m-t-100">
			<button @tap="register()">{{$getLang('注 册')}}</button>
			<view class="u-text-center u-type-primary u-font-24 u-m-t-40" @click="back">{{$getLang('已有帐号？点击登陆')}}</view>
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
						message:this.$getLang('请输入账号'),
						trigger: ['change', 'blur']
					}],
					nickName: [{
						required: true,
						message: this.$getLang('请输入姓名'),
						trigger: ['change', 'blur']
					}],
					mobile: [{
						required: true,
						message: this.$getLang('请输入手机号'),
						trigger: ['change', 'blur']
					}],
					email: [{
						required: true,
						message: this.$getLang('请输入邮箱'),
						trigger: ['change', 'blur']
					}],
					password: [{
						required: true,
						message: this.$getLang('请输入密码'),
						trigger: ['change', 'blur']
					}],
					confirmpass: [{
						required: true,
						message: this.$getLang('请输入确认密码'),
						trigger: ['change', 'blur']
					}]
				}
			}
		},
		onLoad:function(){
			uni.setNavigationBarTitle({title:this.$getLang('注册')});
		},
		methods: {
			back() {
				uni.navigateBack()
			},
			register() {
				if(!this.isValidPhoneNumber(this.form.mobile)){
					uni.showToast({
						title:'手机号格式不正确！',
						icon: 'none'
					})
					return
				}
				if(!this.isValidEmail(this.form.email)){
					uni.showToast({
						title:'邮箱号格式不正确！',
						icon: 'none'
					})
					return
				}
				if (this.form.password !== this.form.confirmpass) {
					uni.showToast({
						title:this.$getLang('两次密码输入不一致'),
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
									title:this.$getLang('注册成功'),
									icon: 'none'
								});
								uni.navigateTo({
									url:"/pages/login/login"
								})
							} else {
								uni.showToast({
									title:this.$getLang(res.code),
									icon: 'none'
								});
							}
						})
					}
				});
			},
			handleInputEmail(){
				var text = this.form.email;
				var regex = /[\u4e00-\u9fa5]/g; // 添加了 'g' 标志
				setTimeout(()=>{
					this.form.email = text.replace(regex, '');
				},200)
			},
			isValidEmail(email) {
			  var regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
			  return regex.test(email);
			},
			isValidPhoneNumber(phoneNumber) {
			  var regex = /^1[3-9]\d{9}$/;
			  return regex.test(phoneNumber);
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