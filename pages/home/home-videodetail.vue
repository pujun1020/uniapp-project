<template>
	<view>
		
		<!-- video start -->
		<view class="videoBox">
			<video v-if="isShpwPlayVideo&&!uploadShow" :src="params.playUrl" :poster="thumbUrl"
				class="videoBox__video"></video>
		</view>
		<!-- header start -->
		<view class=" u-type-info u-font-24" style=" padding:0 20rpx;">
			<!-- time -->
			<view class="u-m-t-30" style="font-size:30rpx;color: #000;line-height: 50rpx;margin-bottom: 10rpx;">
			{{ params.name }}
			</view>
			<!-- name -->
			
			<!-- size -->
			<view style="display: flex;">
				<view>视频时常：{{ videoTime }}</view> 
				<view style="margin-left: 50rpx;"> 视频大小：{{ params.size }}</view> 
				<view style="margin-left: 50rpx;">{{ params.angle ? (params.angle === 'front' ? $getLang('前录') : $getLang('后录')) : '' }}</view>
			</view>
			<view style="display: flex;" v-if="params.date">
				<view style="line-height: 50rpx;">视频时间：{{ params.date }}</view> 
				<view style="margin-left: 50rpx;line-height: 50rpx;">
					<text  v-if="isUploadToCloud" style="padding: 3rpx 12rpx;background-color: green;color: #fff;font-size: 20rpx;border-radius: 4rpx;">已上传云端</text>
					<text  v-if="isDownLoad" style="padding: 3rpx 12rpx;background-color: green;color: #fff;font-size: 20rpx;border-radius: 4rpx;">本地已下载</text>
				</view>
			</view>
		</view>
		<view style="width: 100%;height: 16rpx;background-color: #f8f8f8;margin: 20rpx 0;"></view>
		<view v-if="curVideoGroup.time" style="width: 100%;min-height: 400rpx;">
			<u-cell-group :title="'【'+curVideoGroup.time+'】视频列表'" :title-style="{color:'#000'}">
				<u-cell-item @click="tapCellItem(item,index)" v-for="(item,index) in curVideoGroup.body" icon="play-circle" :title="item.date" :arrow="false" 
				:value="params.date==item.date?'当前视频':''" :value-style="{ color: 'red' }"></u-cell-item>
			</u-cell-group>
		</view>
		<view style="width: 100%;height:170rpx ;"></view>
		<!-- video end -->

		<!-- button start -->
		<view class="button" style="z-index: 999;background-color: #fff;">
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
				<u-grid-item bg-color="#fff" @click="onToPhotosAlbum">
					<u-icon name="download" :size="46"></u-icon>
					<view class="grid-text">{{'保存到相册'}}</view>
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
	import { verfyDownLoad,verfyUploadToCloud,dvrDownLoadToPhotosAlbum,extractAndFormatDateTime,extractYearMonthDay } from '../../common/common.js'
	
	export default {
		data() {
			return {
				params: {},
				uploadShow: false,
				progressVal: 0,
				progressTxt: '',
				uploadOrDownload: '',
				videoTime: '',
				thumbUrl:'',
				isUploadToCloud:false,
				isDownLoad:false,
				curVideoGroup:{},
				
				isShpwPlayVideo:true,
				optType:0,
			}
		},
		onLoad(option) {
			// console.log(getApp().globalData)
			if (option) {
				this.params = option
				this.optType=option.type;
				console.log(option);
				if(option.type==2){
					this.videoTime=this.params.duration;
					this.params.angle=this.params.angle==0?'front':'';
					var list=getApp().globalData.curVideoGroup;
					if(list){
						this.curVideoGroup=list;
					}
					console.log('当天的所有视频列表',list)
				}else{
					const sec = Math.floor(Number(this.params.duration) / 1000)
					this.videoTime = `${ Math.floor(sec/60) }分${Math.floor(sec%60)}秒`
					
					//判断是否已经上传云端
					if(this.params.type==1){
						var list=getApp().globalData.curVideoGroup;
						if(list){
							for(var i=0;i<list.body.length;i++){
								list.body[i].date=extractAndFormatDateTime(list.body[i].name);
							}
							this.curVideoGroup=list;
						}
						setTimeout(async()=>{
							var flag=await verfyUploadToCloud(this,this.params.id,1);
							if(flag==false){
								this.isUploadToCloud=true;
							}
						},10)
						console.log('本地视频对象：',this.params)
					}
					//判断是否下载本地
					if(this.params.type==0){
						var list=getApp().globalData.curVideoGroup;
						if(list){
							for(var i=0;i<list.body.length;i++){
								list.body[i].date=extractAndFormatDateTime(list.body[i].name);
							}
							this.curVideoGroup=list;
						}
						setTimeout(async()=>{
							console.log(this.params.id)
							var flag=await verfyDownLoad(this,this.params.id,1);
							if(flag){
								this.isDownLoad=true;
							}
						},10)
					}
				}
				if(!this.params.date){//如果时间为空，重视频标题里面截取
					this.params.date=extractAndFormatDateTime(this.params.name);
					console.log(this.params.date)
				}
				if(this.params.thumbUrl){
					this.thumbUrl=this.params.thumbUrl;
				}
			}
		},
		methods: {
			tapCellItem(item,index){
				// console.log(item);
				// if(this.optType==2||this.optType==1){
					this.params=item;
					if(this.optType==0){
						const sec = Math.floor(Number(this.params.duration) / 1000)
						this.videoTime = `${ Math.floor(sec/60) }分${Math.floor(sec%60)}秒`
						setTimeout(async()=>{
							var flag=await verfyDownLoad(this,this.params.id,1);
							if(flag){
								this.isDownLoad=true;
							}else{
								this.isDownLoad=false;
							}
						},10)
					}else{
						if(this.optType==1){
							setTimeout(async()=>{
								var flag=await verfyUploadToCloud(this,this.params.id,1);
								if(flag==false){
									this.isUploadToCloud=true;
								}else{
									this.isUploadToCloud=false;
								}
							},10)
						}
						
						
						this.videoTime=item.duration?item.duration:item.totalTime;
					}
					
					this.params.angle=this.params.angle==0?'front':'';
					this.params.type=this.optType;
					this.isShpwPlayVideo=false;
					setTimeout(()=>{
						this.isShpwPlayVideo=true;
					},1);
					uni.pageScrollTo({
					    scrollTop: 0, // 滚动到顶部
					    duration: 100 // 瞬间完成滚动，如果希望有动画效果，可以设置一个非零值，单位ms
					});
				// }
			},
			//保存视频到相册
			async onToPhotosAlbum(){
				await dvrDownLoadToPhotosAlbum(this,this.params,0);
			},
			async onDownLoad() {
				var verfyDow=await verfyDownLoad(this,this.params.id);
				if(verfyDow){
					this.uploadShow = true
					this.uploadOrDownload =this.$getLang('正在下载');
					
					var thumbUrl="";//封面图临时路径
					uni.downloadFile({
						url: this.params.thumbUrl,
						success:(res)=>{
							uni.saveFile({
								tempFilePath: res.tempFilePath,
								success: (img) => {
									thumbUrl=img.savedFilePath;
								},
							});
						}
					});
					
					const downloadTask = uni.downloadFile({
						url: this.params.playUrl,
						success: (res) => {
							console.log('uploadOrDownload',res.tempFilePath)
							uni.saveFile({
								tempFilePath: res.tempFilePath,
								success: (fileRes) => {
									this.params.devSN=getApp().globalData.equip.sn;
									// this.params.date=new Date();
									this.params.playUrl=fileRes.savedFilePath;
									if(thumbUrl){
										this.params.thumbUrl=thumbUrl;
									}
									uni.setStorageSync(fileRes.savedFilePath, this.params)
									var downloadSound=uni.getStorageSync('downloadSound');
									if(downloadSound!="关闭"){
										uni.showModal({
											title:this.$getLang('提示'),
											content:'恭喜您，视频下载到本地完成，您可以到【在路上】的【本地】列表进行查看，是否返回DVR列表页面？',
											cancelText:this.$getLang('取消'),
											confirmText:this.$getLang('确认'),
											success:(res)=>{
												if(res.confirm){
													uni.navigateBack();
												}
											}
										})
										
									}
					
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
				}
				
				
			},

			async onUpload() {
				
				//判断当前视频是否已经上传到云端
				var flag=await verfyUploadToCloud(this,this.params.id);
				if(flag==false||this.uploadShow){
					return;
				}
				
				if (!getApp().globalData.uploadtoken) {
					await this.uploadLogin()
				}
				
				var thumbUrl =await this.uploadThumbUrlimg(this.thumbUrl);
				
				// console.log(thumbUrl)
				const size = await this.getFileInfo()
				const nameArr = this.params.name.split('-')
				const videoDate = `${nameArr[1].replace('_', '-').replace('_', '-')} ${nameArr[2].replace('_', ':').replace('_', ':')}`
				this.uploadShow = true
				this.uploadOrDownload =this.$getLang('正在上传') 
				// console.log('请求token', getApp().globalData.uploadtoken);
				if(this.params.angle){
					this.params.angle = this.params.angle === 'front'? '0' : '1';
				}else{
					this.params.angle='2';
				}
				var formData={
					'devSN':getApp().globalData.equip.sn,
					'videoName': nameArr[0],
					'videoDate': videoDate,
					'videoFileName': this.params.name,
					'videoTotalTime': this.videoTime,
					'videoCameraType': this.params.angle,
					'videoSize': size,
					'thumbUrl':thumbUrl
				};
				console.log(formData)
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
								
								var uploadSound=uni.getStorageSync('uploadSound');
								if(uploadSound!="关闭"){
									uni.showModal({
										title: this.$getLang('提示'),
										content:'恭喜您，当前视频已上传到云端，在云端列表可查看！',
										showCancel:false,
										confirmText:this.$getLang('确定'),
										success:()=>{
											
										}
									})
								}
								
								var locVieoList = uni.getStorageInfoSync().keys.filter(k => k.includes('/uniapp_save/')).map(k => {
									return { ...uni.getStorageSync(k), playUrl: k }
								})
								
								for(var i=0;i<locVieoList.length;i++){
									var loc=locVieoList[i];
									if(loc.id==this.params.id){
										loc.is_upload=true;
										uni.setStorageSync(loc.playUrl, loc);
									}
								}
								
								
							} else {
								uni.showToast({
									title: this.$getLang(data.code),
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
						this.uploadShow=false;
						uni.showToast({
							title:this.$getLang('上传服务错误，请稍后重试'),
							icon: 'none'
						})
						
						console.error('upload error:', uploadError);
					}
				});
				uploadTask.onProgressUpdate(res => {
							this.progressVal = res.progress
							this.progressTxt = ''
				});
			},
			//上传封面图返货封面图地址
			uploadThumbUrlimg(thumbUrl){
				return new Promise((resolve, reject) => {
					uni.uploadFile({
						url: this.$u.api.uploadpic(),
						filePath: thumbUrl,
						name: 'photo',
						success: res => {
							var data=JSON.parse(res.data) ;
							if(data.code==0){
								var url=data.data;
								resolve(url);
							}else{
								resolve('');
							}
						}
					});
				});
			},
			getNetworkType(){
				return new Promise((resolve, reject) => {
					uni.getNetworkType({
					   success: (res) => {
							if(res.networkType=="wifi"){
								resolve(true);
							}else{
								resolve(false);
							}

					   },
					   fail: (err) => {
						 resolve(false);
					   }
				   });
				})
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
							if(e.errMsg.indexOf('request:fail abort statusCode:-1')>-1){
								uni.showToast({
									title:'抱歉，网络连接失败,无法上传云端！',
									icon:'none'
								})
								// setTimeout(()=>{
								// 	uni.redirectTo({
								// 		url:'/pages/index/index'
								// 	})
								// },2000);
							}
							// reject(e)
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
		height: 400rpx;

		// margin-top: 35%;

		&__video {
			width: 100%;
			height: 400rpx;
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