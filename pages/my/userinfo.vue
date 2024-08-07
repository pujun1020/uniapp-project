<template>
	<view class="wrap">
		<!-- list -->
		<u-cell-group :border="false">
			<u-cell-item @click="coolImage()" :title="$getLang('头像')" hover-class="none">
				<u-avatar v-if="!user.photo" src="/static/tabbar/menu_my_active.png" size="mini"></u-avatar>
				<u-avatar v-else :src="user.photo" size="mini"></u-avatar>
			</u-cell-item>
			<u-cell-item :title="$getLang('姓名')" hover-class="none" :value="user.nickName" @click="showName = true"></u-cell-item>
			<u-cell-item :title="$getLang('手机号')" hover-class="none" :value="user.mobile" @click="showMobile = true"></u-cell-item>
			<u-cell-item :title="$getLang('邮箱')" hover-class="none" :value="user.email" @click="showEmail = true"></u-cell-item>
			<u-cell-item :title="$getLang('密码')" hover-class="none" value="***********" @click="showPwd = true"></u-cell-item>
		</u-cell-group>
		
		<u-popup v-model="showName" mode="bottom" height="30%">
			<view class="popupBox">
				<u-form>
					<u-form-item label-width="200" :label="$getLang('姓名')"><u-input v-model="nickName" :placeholder="$getLang('请输入新姓名')" /></u-form-item>
				</u-form>
				<view class="u-flex u-row-around u-m-t-80">
					<u-button @click="closeName()" type="info">{{$getLang('取消')}}</u-button>
					<u-button @click="updateName()" type="primary">{{$getLang('确定')}}</u-button>
				</view>
			</view>
		</u-popup>
		<u-popup v-model="showMobile" mode="bottom" height="30%">
			<view class="popupBox">
				<u-form>
					<u-form-item label-width="200" :label="$getLang('新号码')"><u-input v-model="mobile" :placeholder="$getLang('请输入新号码')" maxlength="11" type="number" /></u-form-item>
				</u-form>
				<view class="u-flex u-row-around u-m-t-80">
					<u-button @click="closeMobile()" type="info">{{$getLang('取消')}}</u-button>
					<u-button @click="updateMobile()" type="primary">{{$getLang('确定')}}</u-button>
				</view>
			</view>
		</u-popup>
		<u-popup v-model="showEmail" mode="bottom" height="30%">
			<view class="popupBox">
				<u-form>
					<u-form-item label-width="200" :label="$getLang('新邮箱')">
						<u-input v-model="email" :isChange="true" maxlength="150" @input="handleInputEmail" :placeholder="$getLang('请输入新邮箱')" />
					</u-form-item>
				</u-form>
				<view class="u-flex u-row-around u-m-t-80">
					<u-button @click="closeEmail()" type="info">{{$getLang('取消')}}</u-button>
					<u-button @click="updateEmail()" type="primary">{{$getLang('确定')}}</u-button>
				</view>
			</view>
		</u-popup>
		<u-popup v-model="showPwd" mode="bottom" height="60%">
			<view class="popupBox">
				<u-form>
					<u-form-item label-width="200" :label="$getLang('原密码')">
						<u-input type="password" v-model="oldPassword" :placeholder="$getLang('请输入原密码')" maxlength="20" /></u-form-item>
				</u-form>
				<u-form>
					<u-form-item label-width="200" :label="$getLang('新密码')">
						<u-input type="password" v-model="newPassword" :placeholder="$getLang('请输入新密码')" maxlength="20" /></u-form-item>
				</u-form>
				<u-form>
					<u-form-item label-width="200" :label="$getLang('确认新密码')">
						<u-input type="password" v-model="newPassword2" :placeholder="$getLang('请输入确认新密码')" maxlength="20" /></u-form-item>
				</u-form>
				<view class="u-flex u-row-around u-m-t-80">
					<u-button @click="closePassword()" type="info">{{$getLang('取消')}}</u-button>
					<u-button @click="updatePassword()" type="primary">{{$getLang('确定')}}</u-button>
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
		onShow() {
			var userAvatar=uni.getStorageSync('userAvatar');
			if(userAvatar){
				getApp().globalData.user.photo=userAvatar;
			}
			this.user = getApp().globalData.user
		},
		onLoad() {
			uni.setNavigationBarTitle({title:this.$getLang('用户信息')});
		},
		methods: {
			coolImage(){
				// console.log('选择文件')
				uni.chooseImage({
					count: 1, //默认9
					sizeType: ['original', 'compressed'], //可以指定是原图还是压缩图，默认二者都有
					sourceType: ['album'], //从相册选择
					success: function (res) {
						console.log(res.tempFilePaths[0])
						const tempFilePath = res.tempFilePaths[0]; // 假设只选择了一张图片 
						uni.navigateTo({
							url: './upload?src=' + tempFilePath
						})
					}
				});
			},
			closeName() {
				this.showName = false
				this.nickName = ''
			},
			updateName() {
				console.log(getApp().globalData.user.id,this.nickName)
				this.$u.api.setUser({ id: getApp().globalData.user.id, nickName: this.nickName })
					.then(res => {
						console.log(res)
						if (res.code === 0) {
							uni.showToast({
								title:this.$getLang('修改姓名成功'),
								icon: 'none'
							})
							this.user.nickName = this.nickName
							var user = getApp().globalData.user;
							user.nickName=this.nickName;
							uni.setStorageSync('user',user);
							
							getApp().globalData.user.nickName = this.nickName
							this.closeName()
						} else {
							uni.showToast({
								title: this.$getLang(res.code),
								icon: 'none'
							})
						}
					})
					.catch(err=>{
						console.log(err);
					})
					
			},
			closeMobile() {
				this.showMobile = false
				this.mobile = ''
			},
			updateMobile() {
				if(!this.isValidPhoneNumber(this.mobile)){
					uni.showToast({
						title:this.$getLang('手机号格式不正确'),
						icon: 'none'
					})
					return;
				}
				
				this.$u.api.setUser({ id: getApp().globalData.user.id, mobile: this.mobile })
					.then(res => {
						if (res.code === 0) {
							uni.showToast({
								title: this.$getLang('修改手机号成功'),
								icon: 'none'
							})
							this.user.mobile = this.mobile
							var user = getApp().globalData.user;
							user.mobile=this.mobile;
							uni.setStorageSync('user',user);
							getApp().globalData.user.mobile = this.mobile
							this.closeMobile()
						} else {
							uni.showToast({
								title: this.$getLang(res.code),
								icon: 'none'
							})
						}
					})
			},
			isValidEmail(email) {
			  var regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
			  return regex.test(email);
			},
			isValidPhoneNumber(phoneNumber) {
			  var regex = /^1[3-9]\d{9}$/;
			  return regex.test(phoneNumber);
			},
			handleInputEmail(){
				var text = this.email;
				var regex = /[\u4e00-\u9fa5]/g; // 添加了 'g' 标志
				setTimeout(()=>{
					this.email = text.replace(regex, '');
					console.log(this.email);
				},50)
				
			},
			closeEmail() {
				this.showEmail = false
				this.email = ''
			},
			updateEmail() {
				if(!this.isValidEmail(this.email)){
					uni.showToast({
						title:this.$getLang('邮箱号格式不正确'),
						icon: 'none'
					})
					return
				}
				this.$u.api.setUser({ id: getApp().globalData.user.id, email: this.email })
					.then(res => {
						if (res.code === 0) {
							uni.showToast({
								title: this.$getLang('修改邮箱成功'),
								icon: 'none'
							})
							this.user.email = this.email
							var user = getApp().globalData.user;
							user.email=this.email;
							uni.setStorageSync('user',user);
							getApp().globalData.user.email = this.email
							this.closeEmail()
						} else {
							uni.showToast({
								title: this.$getLang(res.code),
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
						title: this.$getLang('两次密码输入不一致'),
						icon: 'none'
					})
					return
				}
				this.$u.api.modifypwd({ id: getApp().globalData.user.id, oldPassword: md5(this.oldPassword, 16).toUpperCase(), newPassword: md5(this.newPassword, 16).toUpperCase() })
					.then(res => {
						if (res.code === 0) {
							uni.showToast({
								title:  this.$getLang('修改密码成功'),
								icon: 'none'
							})
							this.closePassword()
							uni.navigateTo({
								url:"/pages/login/login"
							})
						} else {
								uni.showToast({
									title: this.$getLang(res.code),
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