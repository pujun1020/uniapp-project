<template>
	<view class="wrap">
		<!-- list -->
		<u-cell-group :border="false">
			<u-cell-item title="头像" hover-class="none" :arrow="false">
				<u-avatar src="/static/tabbar/menu_my_active.png" size="mini"></u-avatar>
			</u-cell-item>
			<u-cell-item title="姓名" hover-class="none" :value="user.nickName" @click="showName = true"></u-cell-item>
			<u-cell-item title="手机号码" hover-class="none" :value="user.mobile" @click="showMobile = true"></u-cell-item>
			<u-cell-item title="邮箱" hover-class="none" :value="user.email" @click="showEmail = true"></u-cell-item>
			<u-cell-item title="密码" hover-class="none" value="***********" @click="showPwd = true"></u-cell-item>
		</u-cell-group>
		
		<u-popup v-model="showName" mode="bottom" height="30%">
			<view class="popupBox">
				<u-form>
					<u-form-item label="姓名"><u-input v-model="nickName" placeholder="请输入新姓名" /></u-form-item>
				</u-form>
				<view class="u-flex u-row-around u-m-t-80">
					<u-button @click="closeName()" type="info">取消</u-button>
					<u-button @click="updateName()" type="primary">确定</u-button>
				</view>
			</view>
		</u-popup>
		<u-popup v-model="showMobile" mode="bottom" height="30%">
			<view class="popupBox">
				<u-form>
					<u-form-item label="新号码"><u-input v-model="mobile" placeholder="请输入新号码" /></u-form-item>
				</u-form>
				<view class="u-flex u-row-around u-m-t-80">
					<u-button @click="closeMobile()" type="info">取消</u-button>
					<u-button @click="updateMobile()" type="primary">确定</u-button>
				</view>
			</view>
		</u-popup>
		<u-popup v-model="showEmail" mode="bottom" height="30%">
			<view class="popupBox">
				<u-form>
					<u-form-item label="新邮箱"><u-input v-model="email" placeholder="请输入新邮箱" /></u-form-item>
				</u-form>
				<view class="u-flex u-row-around u-m-t-80">
					<u-button @click="closeEmail()" type="info">取消</u-button>
					<u-button @click="updateEmail()" type="primary">确定</u-button>
				</view>
			</view>
		</u-popup>
		<u-popup v-model="showPwd" mode="bottom" height="45%">
			<view class="popupBox">
				<u-form>
					<u-form-item label="原密码"><u-input type="password" v-model="oldPassword" placeholder="请输入原密码" /></u-form-item>
				</u-form>
				<u-form>
					<u-form-item label="新密码"><u-input type="password" v-model="newPassword" placeholder="请输入新密码" /></u-form-item>
				</u-form>
				<u-form>
					<u-form-item label="确认新密码"><u-input type="password" v-model="newPassword2" placeholder="请输入确认新密码" /></u-form-item>
				</u-form>
				<view class="u-flex u-row-around u-m-t-80">
					<u-button @click="closePassword()" type="info">取消</u-button>
					<u-button @click="updatePassword()" type="primary">确定</u-button>
				</view>
			</view>
		</u-popup>
	</view>
</template>

<script>
	import { md5 } from '@/common/md5.js'
	
	export default {
		data() {
			return {
				user: {},
				nickName: '',
				mobile: '',
				email: '',
				oldPassword: '',
				newPassword: '',
				newPassword2: '',
				showName: false,
				showMobile: false,
				showEmail: false,
				showPwd: false
			}
		},
		onLoad() {
			this.user = getApp().globalData.user
		},
		methods: {
			closeName() {
				this.showName = false
				this.nickName = ''
			},
			updateName() {
				this.$u.api.setUser({ id: getApp().globalData.user.id, nickName: this.nickName })
					.then(res => {
						console.log(res)
						if (res.code === 0) {
							uni.showToast({
								title: '修改姓名成功！',
								icon: 'none'
							})
							this.user.nickName = this.nickName
							getApp().globalData.user.nickName = this.nickName
							this.closeName()
						} else {
							uni.showToast({
								title: res.message,
								icon: 'none'
							})
						}
					})
			},
			closeMobile() {
				this.showMobile = false
				this.mobile = ''
			},
			updateMobile() {
				this.$u.api.setUser({ id: getApp().globalData.user.id, mobile: this.mobile })
					.then(res => {
						if (res.code === 0) {
							uni.showToast({
								title: '修改手机号成功！',
								icon: 'none'
							})
							this.user.mobile = this.mobile
							getApp().globalData.user.mobile = this.mobile
							this.closeMobile()
						} else {
							uni.showToast({
								title: res.message,
								icon: 'none'
							})
						}
					})
			},
			closeEmail() {
				this.showEmail = false
				this.email = ''
			},
			updateEmail() {
				this.$u.api.setUser({ id: getApp().globalData.user.id, email: this.email })
					.then(res => {
						if (res.code === 0) {
							uni.showToast({
								title: '修改邮箱成功！',
								icon: 'none'
							})
							this.user.email = this.email
							getApp().globalData.user.email = this.email
							this.closeEmail()
						} else {
							uni.showToast({
								title: res.message,
								icon: 'none'
							})
						}
					})
			},
			closePassword() {
				this.showPwd = false
				this.oldPassword = ''
				this.newPassword = ''
				this.newPassword2 = ''
			},
			updatePassword() {
				if (this.newPassword !== this.newPassword2) {
					uni.showToast({
						title: '两次密码输入不一致！',
						icon: 'none'
					})
					return
				}
				this.$u.api.modifypwd({ id: getApp().globalData.user.id, oldPassword: md5(this.oldPassword, 16).toUpperCase(), newPassword: md5(this.newPassword, 16).toUpperCase() })
					.then(res => {
						if (res.code === 0) {
							uni.showToast({
								title: '修改密码成功！',
								icon: 'none'
							})
							this.closePassword()
							uni.navigateTo({
								url:"/pages/login/login"
							})
						} else {
								uni.showToast({
									title: res.message,
									icon: 'none'
								})
							}
					}).catch(e => console.log(e))
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
		padding: 30rpx 30rpx 60rpx 30rpx;
		border-radius: 20rpx;
		margin: 80rpx 30rpx 30rpx 30rpx;
	}

	.popupBox {
		margin: 40rpx;
	}
</style>