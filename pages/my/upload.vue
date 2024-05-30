<template>
	<view class="content">
		<view class="cropper-wrapper" style="min-height:717px;">
			<canvas
				class="cropper"
				disable-scroll="true"
				@touchstart="touchStart"
				@touchmove="touchMove"
				@touchend="touchEnd"
				:style="{ width: cropperOpt.width, height: cropperOpt.height }"
				canvas-id="cropper"
			></canvas>
		</view>
		<view class="cropper-buttons">
			<view class="upload" @tap="uploadTap">{{$getLang('重新选择')}}</view>
			<view class="getCropperImage" @tap="getCropperImage">{{$getLang('确定')}}</view>
		</view>
	</view>
</template>

<script>
import weCropper from '../../static/weCropper';
const device = uni.getSystemInfoSync();
const width = device.windowWidth;
const height = device.windowHeight - 50;
console.log(device);
export default {
	data() {
		return {
			cropperOpt: {
				id: 'cropper',
				width: width,
				height: height,
				scale: 2.5,
				zoom: 10,
				cut: {
					x: (width - 300) / 2,
					y: (height - 300) / 2,
					width: 300,
					height: 300
				}
			},
			weCropper: ''
		};
	},
	methods: {
		touchStart(e) {
			this.weCropper.touchStart(e);
		},
		touchMove(e) {
			this.weCropper.touchMove(e);
		},
		touchEnd(e) {
			this.weCropper.touchEnd(e);
		},
		convertBase64UrlToBlob(dataURI, type) {
			var binary = atob(dataURI.split(',')[1]);
			var array = [];
			for (var i = 0; i < binary.length; i++) {
				array.push(binary.charCodeAt(i));
			}
			return new Blob([new Uint8Array(array)], { type: type }, { filename: '1111.jpg' });
		},
		blobToDataURL(blob) {
			var a = new FileReader();
			a.readAsDataURL(blob); //读取文件保存在result中
			a.onload = function(e) {
				var getRes = e.target.result; //读取的结果在result中
				console.log(getRes);
			};
		},
		getCropperImage() {
			let _this = this;
			
			this.weCropper.getCropperImage(avatar => {
				if (avatar) {

					uni.uploadFile({
						url: this.$u.api.uploadpic(),
						filePath: avatar,
						name: 'photo',
						success: res => {
							console.log('uploadImage success, res is:', res);
							var data=JSON.parse(res.data) ;
							if(data.code==0){
								var url=data.data;
								var datas={ id: getApp().globalData.user.id, photo: url }
								console.log(datas)
								this.$u.api.setUser(datas)
								.then(res => {
									if (res.code === 0) {
										uni.setStorageSync('userAvatar',url);
										uni.showToast({
											title:_this.$getLang('上传成功'),
											icon: 'success'
										})
										var user = getApp().globalData.user;
										user.photo=url;
										uni.setStorageSync('user',user);
										setTimeout(()=>{
											uni.navigateBack(0)
										},1500)
									} else {
										uni.showToast({
											title:_this.$getLang(res.code),
											icon: 'none'
										})
									}
								});
							}else{
								uni.showToast({
									title:_this.$getLang('上传失败'),
									icon: 'none',
									duration: 1000
								});
							}
							
						},
						ail: err => {
							console.log('uploadImage fail', err);
							uni.showModal({
								content: err.errMsg,
								showCancel: false
							});
							uni.hideLoading();
						},
						complete: () => {
							console.log('complate');
						}
					});
				} else {
					console.log('获取图片失败，请稍后重试');
				}
			});
		},
		uploadTap() {
			const self = this;

			uni.chooseImage({
				count: 1, // 默认9
				sizeType: ['compressed'], // 可以指定是原图还是压缩图，默认二者都有
				sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
				success(res) {
					let src = res.tempFilePaths[0];
					//  获取裁剪图片资源后，给data添加src属性及其值

					self.weCropper.pushOrign(src);
				}
			});
		}
	},
	onLoad(option) {
		var that=this;
		uni.setNavigationBarTitle({title:this.$getLang('上传头像')});
		// do something
		const cropperOpt = this.cropperOpt;
		const src = option.src;
		if (src) {
			Object.assign(cropperOpt, {
				src
			});

			this.weCropper = new weCropper(cropperOpt)
				.on('ready', function(ctx) {})
				.on('beforeImageLoad', ctx => {
					uni.showToast({
						title:that.$getLang('上传中'),
						icon: 'loading',
						duration: 3000
					});
				})
				.on('imageLoad', ctx => {
					uni.hideToast();
				});
		}
	}
};
</script>

<style>
.content {
	background: rgba(255, 255, 255, 1);
}

.head-list {
	height: 43px;
	width: 100%;
	background: #ffffff;
	justify-content: center;
	align-items: center;
	display: flex;
	border-bottom: 1px solid rgba(244, 244, 244, 1);
}

.head-info {
	text-align: center;
	font-size: 18px;
	color: #000000;
	font-weight: bold;
}

.save-box {
	position: absolute;
	right: 0px;
	width: 50px;
	height: 43px;
	line-height: 43px;
}

.save {
	color: rgba(98, 111, 252, 1);
	font-size: 16px;
	font-weight: 400;
}

.icon-back {
	margin-top: 11px;
	width: 10px;
	height: 18px;
	color: #000000;
	margin-left: 6px;
}

.icon-back-box {
	display: block;
	position: absolute;
	left: 6px;
	height: 43px;
	width: 30px;
	align-items: center;
}
.cropper {
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
}

.cropper-buttons {
	background-color: rgba(0, 0, 0, 0.95);
	color: #04b00f;
}
.cropper-wrapper {
	position: relative;
	display: flex;
	flex-direction: row;
	justify-content: space-between;
	align-items: center;
	width: 100%;
	background-color: #F0F0F0;
}

.cropper-buttons {
	width: 100vw;
	height: 50px;
	display: flex;
	flex-direction: row;
	justify-content: space-between;
	align-items: center;
	position: fixed;
	bottom: 0;
	left: 0;
	line-height: 50px;
}

.cropper-buttons .upload,
.cropper-buttons .getCropperImage {
	width: 50%;
	text-align: center;
}
</style>
