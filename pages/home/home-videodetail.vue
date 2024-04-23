<template>
	<view>
		<!-- header start -->
		<view class="u-text-center u-type-info u-font-24">
			<!-- time -->
			<view class="u-m-t-30">{{ params.name }}</view>
			<!-- name -->
			<view>{{ params.angle ? (params.angle === 'front' ? '前录' : '后录') : '' }}</view>
			<!-- size -->
			<view>{{ params.size }}</view>
			<view>{{ videoTime }}</view>
		</view>
		<!-- header end -->

		<!-- video start -->
		<view v-show="!uploadShow" class="videoBox">
			<video :src="params.playUrl"
				class="videoBox__video"></video>
		</view>
		<!-- video end -->

		<!-- button start -->
		<view class="button">
			<u-grid :col="3">
				<u-grid-item bg-color="#fff">
					<u-icon name="trash" :size="46"></u-icon>
					<view class="grid-text">删除</view>
				</u-grid-item>
				<u-grid-item bg-color="#fff" @click="onUpload" v-show="params.type === '1'">
					<u-icon name="arrow-upward" :size="46"></u-icon>
					<view class="grid-text">上传</view>
				</u-grid-item>
				<u-grid-item bg-color="#fff" @click="onDownLoad" v-show="params.type === '0'">
					<u-icon name="download" :size="46"></u-icon>
					<view class="grid-text">下载</view>
				</u-grid-item>
			</u-grid>
		</view>
		<!-- 下载进度弹出层 start -->
		<u-popup v-model="uploadShow" mode="center" width="500" height="500" border-radius="14" :mask-close-able="false">
			<view class="u-m-l-30 u-m-r-30 u-m-t-25 u-m-b-30">
				<view class="u-text-center">
					<view class="u-font-34 u-font-weight">{{ uploadOrDownload }}</view>
					<view class="u-type-info u-font-24 u-m-t-10">{{ params.name }}</view>
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
	import { socketLogin, socket2001, socket2003 } from '@/common/upload.js'
	
	export default {
		data() {
			return {
				params: {},
				uploadShow: false,
				progressVal: 0,
				progressTxt: '',
				uploadOrDownload: '',
				videoTime: ''
			}
		},
		onLoad(option) {
			if (option) {
				this.params = option
				const sec = Math.floor(Number(this.params.duration) / 1000)
				this.videoTime = `${ Math.floor(sec/60) }分${Math.floor(sec%60)}秒`
			}
		},
		methods: {
			onDownLoad() {
				this.uploadShow = true
				this.uploadOrDownload = '正在下载'
				const downloadTask = uni.downloadFile({
					url: this.params.playUrl,
					success: (res) => {
						uni.saveFile({
							tempFilePath: res.tempFilePath,
							success: (fileRes) => {
								uni.setStorageSync(fileRes.savedFilePath, this.params)
								uni.showToast({
									title: '下载完成！',
									icon: 'none'
								})
								this.uploadShow = false
							},
							fail: (err) => {
								console.log('保存失败', err)
							}
						})
					}
				})
				downloadTask.onProgressUpdate(res => {
					this.progressVal = res.progress
					this.progressTxt = `${res.totalBytesWritten}/${res.totalBytesExpectedToWrite}`
				})
			},
			async onUpload() {
				if (!getApp().globalData.uploadtoken) {
					await this.uploadLogin()
				}
				const size = await this.getFileInfo()
				const nameArr = this.params.name.split('-')
				const videoDate = `${nameArr[1].replace('_', '-').replace('_', '-')} ${nameArr[2].replace('_', ':').replace('_', ':')}`
				this.uploadShow = true
				this.uploadOrDownload = '正在上传'
				const uploadTask = uni.uploadFile({
          url: getApp().globalData.uploadUrl + '/api/video', // 你的上传API地址
          filePath: this.params.playUrl,
          name: 'video', // 文件对应的 key , 开发者在服务器端通过这个 key 可以获取到文件二进制内容
					header: {
						'content-type': 'multipart/form-data',
						'Authorization': getApp().globalData.uploadtoken,
					},
          formData: {
            'devSN': getApp().globalData.devSN,
						'videoName': nameArr[0],
						'videoDate': videoDate,
						'videoFileName': this.params.name,
						'videoTotalTime': this.videoTime,
						'videoCameraType': this.params.angle === 'front' ? '0' : '1',
						'videoSize': size
          },
					fileSize: 200 * 1024 * 1024,
					success: uploadRes => {
						this.uploadShow = false
						if (uploadRes.statusCode === 200) {
							const data = JSON.parse(uploadRes.data)
							if (data.code === 0) {
								uni.showToast({
									title: '上传完成！',
									icon: 'none'
								})
							} else {
								uni.showToast({
									title: data.message,
									icon: 'none'
								})
							}
							
						} else {
							uni.showToast({
								title: '上传服务错误，请稍后重试！',
								icon: 'none'
							})
						}
					},
					fail: uploadError => {
						console.error('upload error:', uploadError);
					}
        });
        uploadTask.onProgressUpdate(res => {
					this.progressVal = res.progress
					this.progressTxt = ''
        });
			},
			getFileInfo() {
				console.log('获取文件信息')
				return new Promise((resove, reject) => {
					uni.getFileInfo({
						filePath: this.params.playUrl,
						success: (res) => {
							resove(res.size)
						},
						fail: (err) => {
							console.log('获取文件失败', err)
						}
					})
				})
			},
			uploadLogin() {
				return new Promise((resove, reject) => {
					this.$u.upload.login({ username: getApp().globalData.user.userName, password: getApp().globalData.user.password })
						.then(res => {
							if (res.code === 0) {
								getApp().globalData.uploadtoken = res.token
								resove(true)
							} else {
								reject('上传登陆失败')
							}
						}).catch(e => {
							reject(e)
						})
				})
			}
			// async onUpload() {
			// 	const ws = await this.openWebSocket()
			// 	const buffer = socketLogin()
			// 	ws.send({ data: buffer })
			// 	ws.onMessage(messageEvent => {
			// 		if (messageEvent.data instanceof ArrayBuffer) {
			// 			let dataView = new DataView(messageEvent.data);
			// 			// 注意强制使用小端模式
			// 			var version = dataView.getUint16(0, true)       // 协议版本号
			// 			var messageId = dataView.getUint16(2, true)       // 登录消息号
			// 			var bodySize = dataView.getUint16(4, true)       // 包体长度
			// 			console.log('messageId:' + messageId)
			// 			if (messageId == 2001) {
			// 				const buffer = socket2001(dataView, messageEvent)
			// 				ws.send({ data: buffer })
			// 			} else if(messageId == 2003) {
			// 				socket2003(dataView, messageEvent, this.params.playUrl, ws)
			// 				// ws.send({ data: buffer })
			// 			} else if (messageId == 2005) {
			// 				var requestId = dataView.getInt32(6, true)       // 请求号
			// 				var code  = dataView.getInt32(10, true)           // 错误码
			// 				// code 转码
			// 				var message = "";
			// 				if (code === 1001) {
			// 					message = "服务器处理异常";
			// 				} else if(code === 1002){
			// 					message = "文件上传位置和服务器当前位置不匹配";
			// 				} else if(code === 1003){
			// 					message = "文件上传字节数超出文件总大小";
			// 				} else if(code === 1004){
			// 					message = "未登录，请登录后请求该接口";
			// 				} else if(code === 1005){
			// 					message = "请求的fileKey不存在";
			// 				} else if(code === 1006){
			// 					message = "与云服务通讯异常";
			// 				}
			// 				console.log('收到请求文件信息响应消息：requestId:'+requestId+"  code:"+code + " message:"+message)
			// 				if(code != 0) {
			// 					// 弹出错误消息，注意是并发的，可能会来很多，但是只要弹出一次
			// 				} else {
			// 					// 根据requestID 确定最后一包如果code=0 上传结束成功
			// 				}
			// 			}
			// 		}
			// 	})
			// },
			// openWebSocket() {
			// 	console.log('socket连接！')
			// 	return new Promise((resolve, reject) => {
			// 		const ws = uni.connectSocket({
			// 		  url: 'ws://106.53.202.68:4001/',
			// 			success: res => {
			// 			},
			// 			fail: err => {
			// 				console.error(err)
			// 			},
			// 		});
			// 		ws.onOpen(() => {
			// 			console.log('上传socket连接成功');
			// 			resolve(ws)
			// 		});
			// 		ws.onError((err) => {
			// 			reject(err)
			// 		  console.log('WebSocket连接打开失败，请检查！');
			// 		});
			// 	})
			// },
		}
	}
</script>

<style lang="scss">
	.videoBox {
		margin-top: 35%;

		&__video {
			width: 100%;
		}
	}

	.button {
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		width: 100%;
	}
</style>