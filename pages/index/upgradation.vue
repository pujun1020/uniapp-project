<template>
	<view>
		<u-navbar title="OTA升级" :background="background" title-size="34" title-color="#000" back-icon-color="#000"
			title-bold :border-bottom="false"></u-navbar>
		<view class="bg">
			<view class="u-flex-col u-col-center u-p-t-230">
				<u-image src="/static/index/ota/cloud.png" width="327rpx" height="233.82rpx" mode="aspectFit"></u-image>
			</view>
			<view class="info">
				当前设备信息
			</view>
			<view class="info-box">
				<view class="u-p-t-34 u-p-b-34 u-p-r-24 u-p-l-34 u-flex u-row-between">
					<view class="u-foont-24">MCU</view>
					<view class="u-flex">
						<view class="u-font-22 u-type-info">{{ equip.mcuVersion }}</view>
						<!-- <view class="dot u-m-l-12"></view> -->
					</view>
				</view>
				<view class="u-border-bottom"></view>
				<view class="u-p-t-34 u-p-b-34 u-p-r-24 u-p-l-34 u-flex u-row-between">
					<view class="u-foont-24">版本</view>
					<view class="u-flex">
						<view class="u-font-22 u-type-info">{{ equip.mcuOTCSN }}</view>
						<view v-show="otanew" class="dot u-m-l-12"></view>
					</view>
					<!-- <view class="u-font-22 u-type-info">{{ mcuProjectSN }}</view> -->
				</view>
			</view>
			<view v-show="!otanew" style="text-align: center; margin-top: 30px;">已是最近版本</view>
			<u-button v-show="otanew" style="width: 60%; margin-top: 20px;" @click="onOtaUpgrad" type="primary">OTA升级</u-button>
		</view>
		<!-- 下载进度弹出层 start -->
		<u-popup v-model="uploadShow" mode="center" width="500" height="500" border-radius="14" :mask-close-able="false">
			<view class="u-m-l-30 u-m-r-30 u-m-t-25 u-m-b-30">
				<view class="u-text-center">
					<view class="u-font-34 u-font-weight">{{ progressTitle }}OTA升级包</view>
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

import {connectWifi,getConnectedSSID} from '../../common/cx-wifi/cx-wifi.js'
	var _self;
	export default {
		data() {
			return {
				background: {
					backgroundColor: "#D7EAFF",
				},
				equip: {},
				otaDownUrl: '',
				otanew: false,
				uploadShow: false,
				progressVal: 0,
				progressTxt: '',
				progressTitle: '',
				
				fileBytes:[],//文件字节数组
				ip: '192.168.13.1',
				port: '5001',
				channel: '1',
				
				otaUpgraStatus:0,//
				position:0,
				crcVal:0xFFFFFFFF,
			}
		},
		onLoad(option) {
			_self = this;
			this.equip = getApp().globalData.equip
			this.otanew = false
			this.loadData()
		},
		methods: {
			loadData() {
				// ota升级
				this.$u.api.getMcuPackage({ mcuProjectSN: this.equip.mcuProjectSN })
					.then(res => {
						console.log(res)
						if (res.code === 0 && res.data) {
							const data = res.data
							this.otanew = Number(data.vercode) - Number(this.equip.mcuOTCSN) > 0
							if (this.otanew) {
								this.otaDownUrl = data.path
							}
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
				this.progressTitle = '正在下载所需升级包'
				const downloadTask = uni.downloadFile({
					url: this.otaDownUrl,
					success: (res) => {
						console.log(res.tempFilePath)
						plus.io.resolveLocalFileSystemURL(res.tempFilePath, (entry) => {
							entry.file((file) => {
								this.progressTitle = '开始检查升级包'
								this.progressTxt = ''
								this.progressVal = 0
								var reader = new plus.io.FileReader();
								reader.onload =async (e) => {
									var dataUrl = e.target.result;
									// console.log(dataUrl.substr(0,8000))
									var base64Index = dataUrl.indexOf('base64,') + 'base64,'.length;
									var binaryData = atob(dataUrl.substring(base64Index));
									var bytes = new Uint8Array(binaryData.length);
									for (var i = 0; i < binaryData.length; i++) {
										bytes[i] = binaryData.charCodeAt(i);
									}
									this.progressTitle = '升级包检查成功, 请求连接车机中'
									this.progressTxt = ''
									this.progressVal = 20
									var flag =await this.connectStartWifi();
									if(flag){
										setTimeout(async()=>{
											var tcpStatus= await this.connectTCP();
											this.progressTitle = '车机连接成功，开始传输升级包'
											this.progressTxt = ''
											this.progressVal = 40
											if(tcpStatus){
												this.fileBytes=bytes;
												var bytesLength=bytes.length;
												const otaData =bytes;// new Uint8Array(e.target.result)
												// 获取字节中第12个字节开始向后4个字节，以小端模式转换为int，此字段为crc校验位
												const crc = new DataView(otaData.buffer, 12, 4).getInt32(0, true)
												console.log('crc',crc);
												
												// 获取字节中第16个字节开始向后4个字节，以小端模式转换为int，此字段为文件类型
												const fileType = new DataView(otaData.buffer, 16, 4).getInt32(0, true)
												console.log('fileType',fileType);
												// 发送文本指令
												var sendStr="download,update.bin,"+bytesLength.toString(16)+","+fileType.toString(16)+","+crc.toString(16)+",";
												console.log(sendStr)
												this.position=0;
												this.otaUpgraStatus=1;
												this.crcVal = 0xFFFFFFFF;
												this.$socket.send(_self.channel, sendStr);
												
											}
										},3000)
									}else{
										uni.showToast({
											title:'wifi连接失败，请使用手动连接',
											icon:'none'
										})
									}
									
									
									
								};
								reader.onerror = function(e) {
									console.log('读取文件失败：');
									console.log(e);
									uni.showToast({
										title:'读取文件失败',
										icon:'none'
									})
								}
								// 如果状态为EMPTY（0），手动调用一次readAsArrayBuffer
								if (reader.readyState === 0) { 
									console.log('手动调用readAsArrayBuffer');
									reader.readAsDataURL(file);
								}
							})
						})
					}
				})
				downloadTask.onProgressUpdate(res => {
					this.progressVal = res.progress
					this.progressTxt = `${res.totalBytesWritten}/${res.totalBytesExpectedToWrite}`
				})
			},
			//连接socket服务
			connectTCP() {
				return new Promise((resolve, reject) => {
					this.$socket.init(_self.channel, _self.ip, _self.port);
					this.$socket.receivedStatus = function(channel, status) {
						//服务器返回状态
						console.log(channel, status);
						if (status == '0') {
							//TCP连接成功
							console.log('通道:' + channel + '连接成功');
							resolve(true);
						} else if (status == '1') {
							//TCP断开连接
							console.log('通道:' + channel + '断开连接');
							resolve(false);
						}
					};
					
					this.$socket.receivedMsgCallBack = (channel, receivedMsg)=> {
						console.log('通道:' + channel);
						console.log(receivedMsg);
						
						//服务器返回字符串
						if(this.otaUpgraStatus==1){
							if(receivedMsg.indexOf('ok')>-1){
								console.log('1,',receivedMsg);

								var buf = this.scoketPkg(this.position);
								console.log('2',buf.length);
								var deepCopy = [];
								for (var i = 0; i < buf.length; i++) {
									deepCopy[i]=buf[i];
								}
								console.log('3',deepCopy.length);
								deepCopy[12] = 0;//# file crc is 0
								deepCopy[13] = 0;
								deepCopy[14] = 0;
								deepCopy[15] = 0;
								this.crcVal = this.xcrc32(deepCopy,this.crcVal);
								console.log('4',this.crcVal);
								var sendStr="continue,"+this.position.toString(16)+","+buf.length.toString(16)+","+this.crcVal.toString(16)+",";
								console.log(sendStr)
								this.otaUpgraStatus=2;
								this.$socket.send(_self.channel, sendStr);
								
							}else if(receivedMsg.indexOf('same checksum')>-1){
								this.otaUpgraStatus=0;
								uni.showToast({
									title:'已是最新版本',
									icon:'none'
								})
							}
						}else if(this.otaUpgraStatus==2){
							//continue,0,ok,
							var resultMsg="continue,"+this.position.toString(16).toUpperCase()+",ok";
							if(receivedMsg.indexOf(resultMsg)>-1){
								console.log('自定义结果：',resultMsg);
								var buf = this.scoketPkg(this.position);
								var bufstr=[];
								for(var i=0;i<buf.length;i++){
									bufstr[i]=buf[i].toString(16).toUpperCase();
								}
								console.log('bufstr',bufstr.slice(0,20));
								this.otaUpgraStatus=3;
								this.$socket.sendBytes(_self.channel, JSON.stringify(bufstr));
							}
							
						}else if(this.otaUpgraStatus==3){
							var resultMsg1="data,"+this.position.toString(16).toUpperCase()+",ok";
							var resultMsg2="resend,"+this.position.toString(16).toUpperCase()+"";
							if(receivedMsg.indexOf(resultMsg1)>-1){
								this.position+=0x10000;
								var buf = this.scoketPkg(this.position);
								if(buf.length==0){
									this.progressTitle = '升级包传输完成，等待设备升级'
									this.progressTxt = ''
									this.progressVal = 100
									this.uploadShow = false
									uni.showToast({
										title:'升级包传输完成，等待设备升级！',
										icon:'none'
									})
									return;
								}
								this.crcVal = this.xcrc32(buf,this.crcVal);
								var sendStr="continue,"+this.position.toString(16)+","+buf.length.toString(16)+","+this.crcVal.toString(16)+",";
								this.otaUpgraStatus=2;
								this.$socket.send(_self.channel, sendStr);
								
							}else{
								var buf = this.scoketPkg(this.position);
								var bufstr=[];
								for(var i=0;i<buf.length;i++){
									bufstr[i]=buf[i].toString(16).toUpperCase();
								}
								this.otaUpgraStatus=3;
								this.$socket.sendBytes(_self.channel, JSON.stringify(bufstr));
							}
						}
						
						
					};
					this.$socket.receivedHexMsgCallBack = (channel, receivedHexMsg)=> {
						//硬件服务器返回16进制数据
						// console.log('通道:' + channel);
						// console.log(receivedHexMsg);
						// let msg = receivedHexMsg;
						// let sum = msg.length / 2;
						// let arr = [];
						// for (let k = 0; k < sum; k++) {
						// 	let i = msg.substring(k * 2, k * 2 + 2);
						// 	arr.push(i);
						// }
						// console.log(arr);
					};
					
				});
			},
			xcrc32(buf, init){
				let crc = init;  
				for (let i = 0; i < buf.length; i++) {  
					let data = buf[i];  
					let idx = ((crc >>> 24) & 0xFF) ^ (data & 0xFF);  
					crc = ((crc << 8) & 0xFFFFFFFF) ^ crc32Table[idx];  
				}  
				// 使用无符号右移和掩码确保结果为正数  
				return crc >>> 0;  
			},
			scoketPkg(position){
				const bytes =this.fileBytes;
				return bytes.slice(Number(position),Number(position)+0x10000);
			},
			connectStartWifi(){
				return new Promise((resolve, reject) => {
					const ssid =uni.getStorageSync('ssid')
					const password =uni.getStorageSync('wifipwd')
					console.log(ssid,password)
					connectWifi(ssid,password);
					var index=0;
					var interval = setInterval(()=>{
						var getCurSSID=getConnectedSSID();
						if(index>20){
							clearInterval(interval);
							resolve(false);
						}
						if(`"${ssid}"`==getCurSSID){
							clearInterval(interval);
							resolve(true);
						}else{
							index++;
						}
					},1000)
				});
			},
		}
	}

	var crc32Table =[
				0x00000000, 0x04c11db7, 0x09823b6e, 0x0d4326d9,
				0x130476dc, 0x17c56b6b, 0x1a864db2, 0x1e475005,
				0x2608edb8, 0x22c9f00f, 0x2f8ad6d6, 0x2b4bcb61,
				0x350c9b64, 0x31cd86d3, 0x3c8ea00a, 0x384fbdbd,
				0x4c11db70, 0x48d0c6c7, 0x4593e01e, 0x4152fda9,
				0x5f15adac, 0x5bd4b01b, 0x569796c2, 0x52568b75,
				0x6a1936c8, 0x6ed82b7f, 0x639b0da6, 0x675a1011,
				0x791d4014, 0x7ddc5da3, 0x709f7b7a, 0x745e66cd,
				0x9823b6e0, 0x9ce2ab57, 0x91a18d8e, 0x95609039,
				0x8b27c03c, 0x8fe6dd8b, 0x82a5fb52, 0x8664e6e5,
				0xbe2b5b58, 0xbaea46ef, 0xb7a96036, 0xb3687d81,
				0xad2f2d84, 0xa9ee3033, 0xa4ad16ea, 0xa06c0b5d,
				0xd4326d90, 0xd0f37027, 0xddb056fe, 0xd9714b49,
				0xc7361b4c, 0xc3f706fb, 0xceb42022, 0xca753d95,
				0xf23a8028, 0xf6fb9d9f, 0xfbb8bb46, 0xff79a6f1,
				0xe13ef6f4, 0xe5ffeb43, 0xe8bccd9a, 0xec7dd02d,
				0x34867077, 0x30476dc0, 0x3d044b19, 0x39c556ae,
				0x278206ab, 0x23431b1c, 0x2e003dc5, 0x2ac12072,
				0x128e9dcf, 0x164f8078, 0x1b0ca6a1, 0x1fcdbb16,
				0x018aeb13, 0x054bf6a4, 0x0808d07d, 0x0cc9cdca,
				0x7897ab07, 0x7c56b6b0, 0x71159069, 0x75d48dde,
				0x6b93dddb, 0x6f52c06c, 0x6211e6b5, 0x66d0fb02,
				0x5e9f46bf, 0x5a5e5b08, 0x571d7dd1, 0x53dc6066,
				0x4d9b3063, 0x495a2dd4, 0x44190b0d, 0x40d816ba,
				0xaca5c697, 0xa864db20, 0xa527fdf9, 0xa1e6e04e,
				0xbfa1b04b, 0xbb60adfc, 0xb6238b25, 0xb2e29692,
				0x8aad2b2f, 0x8e6c3698, 0x832f1041, 0x87ee0df6,
				0x99a95df3, 0x9d684044, 0x902b669d, 0x94ea7b2a,
				0xe0b41de7, 0xe4750050, 0xe9362689, 0xedf73b3e,
				0xf3b06b3b, 0xf771768c, 0xfa325055, 0xfef34de2,
				0xc6bcf05f, 0xc27dede8, 0xcf3ecb31, 0xcbffd686,
				0xd5b88683, 0xd1799b34, 0xdc3abded, 0xd8fba05a,
				0x690ce0ee, 0x6dcdfd59, 0x608edb80, 0x644fc637,
				0x7a089632, 0x7ec98b85, 0x738aad5c, 0x774bb0eb,
				0x4f040d56, 0x4bc510e1, 0x46863638, 0x42472b8f,
				0x5c007b8a, 0x58c1663d, 0x558240e4, 0x51435d53,
				0x251d3b9e, 0x21dc2629, 0x2c9f00f0, 0x285e1d47,
				0x36194d42, 0x32d850f5, 0x3f9b762c, 0x3b5a6b9b,
				0x0315d626, 0x07d4cb91, 0x0a97ed48, 0x0e56f0ff,
				0x1011a0fa, 0x14d0bd4d, 0x19939b94, 0x1d528623,
				0xf12f560e, 0xf5ee4bb9, 0xf8ad6d60, 0xfc6c70d7,
				0xe22b20d2, 0xe6ea3d65, 0xeba91bbc, 0xef68060b,
				0xd727bbb6, 0xd3e6a601, 0xdea580d8, 0xda649d6f,
				0xc423cd6a, 0xc0e2d0dd, 0xcda1f604, 0xc960ebb3,
				0xbd3e8d7e, 0xb9ff90c9, 0xb4bcb610, 0xb07daba7,
				0xae3afba2, 0xaafbe615, 0xa7b8c0cc, 0xa379dd7b,
				0x9b3660c6, 0x9ff77d71, 0x92b45ba8, 0x9675461f,
				0x8832161a, 0x8cf30bad, 0x81b02d74, 0x857130c3,
				0x5d8a9099, 0x594b8d2e, 0x5408abf7, 0x50c9b640,
				0x4e8ee645, 0x4a4ffbf2, 0x470cdd2b, 0x43cdc09c,
				0x7b827d21, 0x7f436096, 0x7200464f, 0x76c15bf8,
				0x68860bfd, 0x6c47164a, 0x61043093, 0x65c52d24,
				0x119b4be9, 0x155a565e, 0x18197087, 0x1cd86d30,
				0x029f3d35, 0x065e2082, 0x0b1d065b, 0x0fdc1bec,
				0x3793a651, 0x3352bbe6, 0x3e119d3f, 0x3ad08088,
				0x2497d08d, 0x2056cd3a, 0x2d15ebe3, 0x29d4f654,
				0xc5a92679, 0xc1683bce, 0xcc2b1d17, 0xc8ea00a0,
				0xd6ad50a5, 0xd26c4d12, 0xdf2f6bcb, 0xdbee767c,
				0xe3a1cbc1, 0xe760d676, 0xea23f0af, 0xeee2ed18,
				0xf0a5bd1d, 0xf464a0aa, 0xf9278673, 0xfde69bc4,
				0x89b8fd09, 0x8d79e0be, 0x803ac667, 0x84fbdbd0,
				0x9abc8bd5, 0x9e7d9662, 0x933eb0bb, 0x97ffad0c,
				0xafb010b1, 0xab710d06, 0xa6322bdf, 0xa2f33668,
				0xbcb4666d, 0xb8757bda, 0xb5365d03, 0xb1f740b4
	        ]
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