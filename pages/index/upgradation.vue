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
						<view class="u-font-22 u-type-info">{{ osAppProjectSN }}</view>
						<view class="dot u-m-l-12"></view>
					</view>
				</view>
				<view class="u-border-bottom"></view>
				<view @click="onOtaUpgrad" class="u-p-t-34 u-p-b-34 u-p-r-24 u-p-l-34 u-flex u-row-between">
					<view class="u-foont-24">MCU</view>
					<view class="u-flex">
						<view class="u-font-22 u-type-info">{{ mcuProjectSN }}</view>
						<view v-show="otanew" class="dot u-m-l-12"></view>
					</view>
					<!-- <view class="u-font-22 u-type-info">{{ mcuProjectSN }}</view> -->
				</view>
			</view>
		</view>
		<!-- 下载进度弹出层 start -->
		<u-popup v-model="uploadShow" mode="center" width="500" height="500" border-radius="14" :mask-close-able="false">
			<view class="u-m-l-30 u-m-r-30 u-m-t-25 u-m-b-30">
				<view class="u-text-center">
					<view class="u-font-34 u-font-weight">正在下载OTA升级包</view>
					<view class="u-type-info u-font-24 u-m-t-30">{{ progressTxt }}</view>
				</view>
				
				<view style="margin-top: 30%;">
					<u-line-progress active-color="#2979ff" :percent="progressVal"></u-line-progress>
				</view>
			</view>
		</u-popup>
		<!-- button end -->
	</view>
</template>

<script>
	export default {
		data() {
			return {
				background: {
					backgroundColor: "#D7EAFF",
				},
				osAppProjectSN: '',
				mcuProjectSN: '',
				mcuOTCSN: '',
				otaDownUrl: '',
				otanew: false,
				uploadShow: false,
				progressVal: 0,
				progressTxt: ''
			}
		},
		onLoad(option) {
			this.osAppProjectSN = option.osAppProjectSN
			this.mcuProjectSN = option.mcuProjectSN
			this.mcuOTCSN = option.mcuOTCSN
			this.otanew = false
			this.loadData()
		},
		methods: {
			loadData() {
				// ota升级
				this.$u.api.getMcuPackage({ mcuProjectSN: this.mcuProjectSN })
					.then(res => {
						console.log(res)
						if (res.code === 0 && res.data) {
							const data = res.data
							this.otanew = Number(data.vercode) - Number(this.mcuOTCSN) > 0
							if (this.otanew) {
								this.otaDownUrl = data.path
							}
						}
					})
				this.$u.api.getOsAppPackage({ projectSN: this.osAppProjectSN })
					.then(res => {
						if (res.code === 0) {
							// app自动升级
						}
					})
			},
			onOtaUpgrad() {
				if (!this.otanew) {
					return
				}
				uni.showModal({
					title: '提示',
					content: '可升级OTA固件,请确定车机已连接',
					success: (res) => {
						if (res.confirm) {
							this.otaDownLoad()
						} else if (res.cancel) {
							console.log('用户点击取消')
						}
					}
				})
			},
			otaDownLoad() {
				this.uploadShow = true
				const downloadTask = uni.downloadFile({
					url: this.otaDownUrl,
					success: (res) => {
						plus.io.resolveLocalFileSystemURL(res.tempFilePath, (entry) => {
							entry.file((file) => {
								var reader = new plus.io.FileReader();
								
								reader.onload = (e) => {
									console.log('读取文件成功：');
									const otaData = new Uint8Array(e.target.result)
									// 获取字节中第12个字节开始向后4个字节，以小端模式转换为int，此字段为crc校验位
									const crc = new DataView(otaData.buffer, 12, 4).getInt32(0, true)
									
									// 获取字节中第16个字节开始向后4个字节，以小端模式转换为int，此字段为文件类型
									const fileType = new DataView(otaData.buffer, 16, 4).getInt32(0, true)
									
									// 发送文本指令
									
								};
								reader.onerror = function(e) {
									console.log('读取文件失败：');
									console.log(e);
								}
							})
						})
					}
				})
				downloadTask.onProgressUpdate(res => {
					this.progressVal = res.progress
					this.progressTxt = `${res.totalBytesWritten}/${res.totalBytesExpectedToWrite}`
				})
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