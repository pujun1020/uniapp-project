<template>
	<view>
		<!-- header start -->
		<view class="u-text-center u-type-info u-font-24">
			<!-- time -->
			<view class="u-m-t-30">{{ params.name }}</view>
			<!-- name -->
			<view>{{ params.angle ? (params.angle === 'front' ? $getLang('前录') : $getLang('后录')) : '' }}</view>
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
				<u-grid-item @click="onDelete" bg-color="#fff">
					<u-icon name="trash" :size="46"></u-icon>
					<view class="grid-text">{{$getLang('删除')}}</view>
				</u-grid-item>
				<u-grid-item bg-color="#fff" @click="onUpload" v-show="params.type === '1'">
					<u-icon name="arrow-upward" :size="46"></u-icon>
					<view class="grid-text">{{$getLang('上传')}}</view>
				</u-grid-item>
				<u-grid-item bg-color="#fff" @click="onDownLoad" v-show="params.type === '0'">
					<u-icon name="download" :size="46"></u-icon>
					<view class="grid-text">{{$getLang('下载')}}</view>
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
	import { connectStartWifi, openWebSocket } from '../../common/wifi-tcp.js'
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
			// console.log(getApp().globalData)
			if (option) {
				this.params = option
				if(option.type==2){
					this.videoTime=this.params.duration;
				}else{
					const sec = Math.floor(Number(this.params.duration) / 1000)
					this.videoTime = `${ Math.floor(sec/60) }分${Math.floor(sec%60)}秒`
				}
				
				
			}
		},
		methods: {
			onDownLoad() {
				this.uploadShow = true
				this.uploadOrDownload =this.$getLang('正在下载') 
				const downloadTask = uni.downloadFile({
					url: this.params.playUrl,
					success: (res) => {
						uni.saveFile({
							tempFilePath: res.tempFilePath,
							success: (fileRes) => {
								this.params.devSN=getApp().globalData.equip.sn;
								this.params.date=new Date();
								this.params.playUrl=fileRes.savedFilePath;
								console.log(fileRes)
								console.log(this.params)
								uni.setStorageSync(fileRes.savedFilePath, this.params)
								uni.showToast({
									title:this.$getLang('下载完成！') ,
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
				this.uploadOrDownload =this.$getLang('正在上传') 
				// console.log('请求token', getApp().globalData.uploadtoken);
				var formData={
					'devSN':getApp().globalData.equip.sn,
					'videoName': nameArr[0],
					'videoDate': videoDate,
					'videoFileName': this.params.name,
					'videoTotalTime': this.videoTime,
					'videoCameraType': this.params.angle === 'front' ? '0' : '1',
					'videoSize': size
				};
				// console.log(formData)
				const uploadTask = uni.uploadFile({
					url: getApp().globalData.uploadUrl + '/api/video', // 你的上传API地址
					filePath: this.params.playUrl,
					name: 'video', // 文件对应的 key , 开发者在服务器端通过这个 key 可以获取到文件二进制内容
								header: {
									'content-type': 'multipart/form-data',
									'Authorization': getApp().globalData.uploadtoken,
								},
					formData: formData,
					fileSize: 200 * 1024 * 1024,
					success: uploadRes => {
						this.uploadShow = false
						if (uploadRes.statusCode === 200) {
							const data = JSON.parse(uploadRes.data)
							if (data.code === 0) {
								uni.showModal({
									title: this.$getLang('提示'),
									content:'恭喜您，当前视频已上传到云端，在云端列表可查看！',
									showCancel:false,
									confirmText:this.$getLang('确定'),
									success:()=>{
										
									}
								})
								// uni.showToast({
								// 	title:this.$getLang('上传完成！') ,
								// 	icon: 'none'
								// })
							} else {
								uni.showToast({
									title: data.message,
									icon: 'none'
								})
							}
							
						} else {
							uni.showToast({
								title:this.$getLang('上传服务错误，请稍后重试'),
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
							console.log(res)
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
			},
			onDelete() {
				uni.showModal({
					title: this.$getLang('提示'),
					content: this.$getLang('确认要删除当前视频吗'),
					cancelText:this.$getLang('取消'),
					confirmText:this.$getLang('确定'),
					success: async(res) => {
						if (res.confirm) {
							if(this.params.type==0){
								console.log(this.params)
								let socketTask = getApp().globalData.socketTask;
								console.log('socketTask',socketTask)
								if(socketTask){
									var temps=[this.params.playUrl];
									socketTask.send({
										data: '{ "METHOD":"FILE.DELETE", "exigency":true, "playUrlList":'+JSON.stringify(temps)+'}'
									})
									socketTask.onMessage((res) => {
										this.getOpenerEventChannel().emit('sonPageData',this.params)
										uni.navigateBack();
									});
								}
							}else if(this.params.type==1){
								var fileUrl=this.params.playUrl;
								uni.removeSavedFile({
									filePath: fileUrl,
									success: ()=> {
									  uni.showToast({
									  	title:'删除成功！'
									  })
									  uni.removeStorageSync(fileUrl);
									  setTimeout(()=>{
										  this.getOpenerEventChannel().emit('sonPageData',this.params)
										  uni.navigateBack();
									  },2000)
									 
									},
									fail:()=> {
										uni.showToast({
											title:'删除失败！',
											icon:'none'
										})
									}
								});
							}else{
								// console.log(this.params)
								var datas={ devSN: this.params.devSN, id:Number(this.params.id) };
								// console.log('datas',datas)
								this.$u.api.delteCloundVideo(datas)
									.then(res => {
										// console.log(res)
										if (res.code === 0) {
											uni.navigateTo({
												url:"/pages/home/home"
											})
										} else {
											uni.showToast({
												title: res.message,
												icon: 'none'
											})
										}
									})
									.catch((err)=>{
										console.log(err)
									})
							}
							
						}
					}
				})
			}
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