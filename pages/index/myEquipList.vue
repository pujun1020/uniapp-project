<template>
	<view class="gui-padding" style="min-height:100vh; background-color:#EBF5FF;">
		<view v-for="item of equipList" :key="item.id" class="gui-card-view gui-margin-top gui-box-shadow">
			<view class="gui-card-body gui-border-b gui-flex gui-rows gui-nowrap">
				<!-- <image src="https://images.unsplash.com/photo-1663188646682-7bdc8a7738d9?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxlZGl0b3JpYWwtZmVlZHw3fHx8ZW58MHx8fHw%3D&auto=format&fit=crop&w=100&q=80" 
				class="gui-card-img"></image> -->
				<view class="gui-card-desc">
					<view class="gui-flex gui-rows gui-nowrap gui-align-items-center">
						<text class="gui-card-name">{{ item.abbreviation }}</text>
						<text v-show="item.sn === equipSn" class="gui-text-small gui-color-blue">当前设备</text>
					</view>
					<view class="gui-card-text gui-block-text" style="margin-top:10rpx;">{{ item.mcuVersion }}</view> 
					<view class="gui-card-text gui-block-text">{{ item.createTime }}</view>
				</view>
			</view>
			<view class="gui-card-footer gui-flex gui-rows gui-nowrap gui-space-between gui-align-items-center">
				<text @click="onDel(item)" class="gui-icons gui-card-footer-item gui-border-r" :style="{ color: item.sn === equipSn ? '#626675' : 'red' }">删除</text>
				<text @click="onSelected(item)" class="gui-icons gui-card-footer-item" :style="{ color: item.sn === equipSn ? '#626675' : '#2B9DF3' }">切换设备</text>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				equipList: [],
				equipSn: '',
			}
		},
		onLoad() {
			this.equipSn = getApp().globalData.equip.sn
			this.loadEquipList()
		},
		methods: {
			loadEquipList() {
				this.$u.api.getEquipList({ userId: getApp().globalData.user.id })
					.then(res => {
						if (res.code === 0) {
							this.equipList = res.data
							console.log(this.equipList)
						}
					})
			},
			onDel(equip) {
				if (equip.sn === this.equipSn) return
				uni.showModal({
					title: '提示',
					content: '确认要解绑该设备吗？',
					success: (res) => {
						if (res.confirm) {
							this.$u.api.delteEquip([equip.id])
								.then(res => {
									if (res.code === 0) {
										this.loadEquipList()
									} else {
										uni.showToast({
											title: res.message,
											icon: 'none'
										})
									}
								})
						}
					}
				})
			},
			onSelected(equip) {
				if (equip.sn === this.equipSn) return
				uni.showModal({
					title: '提示',
					content: '确认要切换到该设备吗？',
					success: (res) => {
						if (res.confirm) {
							getApp().globalData.equip = equip
							getApp().globalData.devSN = equip.sn
							uni.setStorageSync('devsn', equip.sn)
							uni.navigateTo({
							    url: "/pages/index/index"
							})
						}
					}
				})
			}
		}
	}
</script>

<style>
	body,
	html {
		background-color: #EBF5FF;
	}
	.gui-padding{
		padding: 30rpx;
	}
	.gui-margin-top{
		margin-top: 20rpx;
	}
	.gui-flex{display:flex;}
	.gui-rows{flex-direction:row;}
	.gui-nowrap{flex-direction:row; flex-wrap:nowrap;}
	.gui-border-b{border-bottom-style:solid; border-bottom-width:1rpx; border-bottom-color:#F1F2F3;}
	.gui-border-r{border-right-style:solid; border-right-width:1rpx; border-right-color:#F1F2F3;}
	.gui-align-items-center{align-items:center;}
	.gui-align-items-end{align-items:flex-end;}
	.gui-space-between{justify-content:space-between;}
	.gui-color-blue{color:#008AFF !important;}
	.gui-text-small{font-size: 24rpx;}
	/* 卡片视图 */
	.gui-card-view{background-color:#FFFFFF; padding:25rpx; border-radius: 24rpx;}
	.gui-card-body{padding-bottom:25rpx;}
	.gui-card-img{width:100rpx; height:100rpx; border-radius:80rpx;}
	.gui-card-desc{width:400rpx; margin-left:25rpx; flex:1;}
	.gui-card-name{font-size:28rpx; color:#333333; line-height:40rpx; margin-right:20rpx;}
	.gui-card-text{line-height:40rpx; font-size:24rpx; color:#888888;}
	.gui-card-footer{ margin-top:25rpx;}
	.gui-card-footer-item{width:100rpx; text-align:center; flex:1; line-height:38rpx; font-size:26rpx; color:#666666;}
	/* #ifndef APP-NVUE */
	.gui-card-footer-item{display:block;}
	.gui-box-shadow{box-shadow:0px 0px 3rpx #999999;}
	/* #endif */
</style>