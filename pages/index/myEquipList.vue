<template>
	<view class="gui-padding" style="min-height:100vh; background-color:#F8F8F8;">
		<view class="gui-card-view gui-margin-top gui-box-shadow">
			<view class="gui-card-body gui-border-b gui-flex gui-rows gui-nowrap">
				<!-- <image src="https://images.unsplash.com/photo-1663188646682-7bdc8a7738d9?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxlZGl0b3JpYWwtZmVlZHw3fHx8ZW58MHx8fHw%3D&auto=format&fit=crop&w=100&q=80" 
				class="gui-card-img"></image> -->
				<view class="gui-card-desc">
					<view class="gui-flex gui-rows gui-nowrap gui-align-items-center">
						<text class="gui-card-name">张三</text>
						<text class="gui-text-small gui-color-blue">当前设备</text>
					</view>
					<text class="gui-card-text gui-block-text" style="margin-top:10rpx;">北京市朝阳区</text> 
					<text class="gui-card-text gui-block-text">139*****888</text>
				</view>
			</view>
			<view class="gui-card-footer gui-flex gui-rows gui-nowrap gui-space-between gui-align-items-center">
				<text class="gui-icons gui-card-footer-item gui-border-r"  style="color:red;">删除</text>
				<text class="gui-icons gui-card-footer-item" style="color: #2B9DF3;">切换设备</text>
			</view>
		</view>
		<view class="gui-card-view gui-margin-top gui-box-shadow">
			<view class="gui-card-body gui-border-b gui-flex gui-rows gui-nowrap">
				<!-- <image src="https://images.unsplash.com/photo-1663188646682-7bdc8a7738d9?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxlZGl0b3JpYWwtZmVlZHw3fHx8ZW58MHx8fHw%3D&auto=format&fit=crop&w=100&q=80" 
				class="gui-card-img"></image> -->
				<view class="gui-card-desc">
					<view class="gui-flex gui-rows gui-nowrap gui-align-items-center">
						<text class="gui-card-name">张三</text>
						<!-- <text class="gui-text-small gui-color-blue">补充信息</text> -->
					</view>
					<text class="gui-card-text gui-block-text" style="margin-top:10rpx;">北京市朝阳区</text> 
					<text class="gui-card-text gui-block-text">139*****888</text>
				</view>
			</view>
			<view class="gui-card-footer gui-flex gui-rows gui-nowrap gui-space-between gui-align-items-center">
				<text class="gui-icons gui-card-footer-item gui-border-r"  style="color:red;">删除</text>
				<text class="gui-icons gui-card-footer-item" style="color: #2B9DF3;">切换设备</text>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				
			}
		}
	}
</script>

<style>
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
	.gui-card-view{background-color:#FFFFFF; padding:25rpx;}
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