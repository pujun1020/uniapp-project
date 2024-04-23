<template>
	<view>
		<u-navbar title="OTA升级" :background="background" title-size="34" title-color="#000" back-icon-color="#000"
			title-bold :border-bottom="false"></u-navbar>
		<view class="bg">
			<view class="u-flex-col u-col-center u-p-t-230">
				<u-image src="/static/index/ota/cloud.png" width="327rpx" height="233.82rpx" mode="aspectFit"></u-image>
			</view>
			<view class="info">
				当前版本信息
			</view>
			<view class="info-box">
				<view class="u-p-t-34 u-p-b-34 u-p-r-24 u-p-l-34 u-flex u-row-between">
					<view class="u-foont-24">APP</view>
					<view class="u-flex">
						<view class="u-font-22 u-type-info">HB-MK630-HJ-256.01TY-R2104-0.0-231205.A</view>
						<view class="dot u-m-l-12"></view>
					</view>
				</view>
				<view class="u-border-bottom"></view>
				<view class="u-p-t-34 u-p-b-34 u-p-r-24 u-p-l-34 u-flex u-row-between">
					<view class="u-foont-24">MCU</view>
					<view class="u-font-22 u-type-info">BR160-15-00-231205</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				background: {
					backgroundColor: "#D7EAFF"
				}
			}
		}
	}
</script>

<style lang="scss">
	.bg {
		background: url("../../static/index/ota/bg.png") no-repeat;
		background-size: cover;
		height: 1448rpx;
	}

	.info {
		font-size: 30rpx;
		font-weight: 400;
		color: #222222;
		margin: 92rpx 0 0 40rpx;
	}

	.info-box {
		background-color: white;
		border-radius: 12rpx;
		margin: 24rpx 40rpx 0 40rpx;
	}

	.dot {
		width: 12rpx;
		height: 12rpx;
		background: #FF3C3C;
		border-radius: 50%;
		opacity: 1;
	}
</style>