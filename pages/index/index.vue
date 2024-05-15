<template>
	<view class="wrap">
		<u-gap height="88" bg-color="#EBF5FF"></u-gap>
		 <!-- style="position:sticky;top: 0;background-color: #EBF5FF;z-index: 9999;"  v-show="localChannel == '1'" -->
		<view  class="wrap__head"> 
			<view class="tabs" v-show="localChannel == '1'">
			<!-- 	<u-tabs v-if="isPageLoaded" :list="list" :is-scroll="false" :current="current" @change="change" bg-color="#EBF5FF"
					font-size="32" active-color="#1F252A" bar-width="67"></u-tabs> -->
					<view class="tabs-body">
						<view @tap="change(0)" class="tabs-item " :class="current==0?'tabs-active':''" style="margin-right:100rpx;">
							{{this.$getLang('设备')}}
							<view v-if="current==0" class="tabs-bar"></view>
						</view>
						<view @tap="change(1)" class="tabs-item " :class="current==1?'tabs-active':''">
							DVR
							<view v-if="current==1" class="tabs-bar"></view>
						</view>
					</view>
			</view>
				<zb-popover placement="bottom-end"
					theme="dark"
					:options="actions"
					ref="Popover1"
					@select="onPlusDialog"
					class="item-popover">
					 <u-icon name="plus" color="#1F252A" size="40" class="wrap__head__plus"></u-icon>
				</zb-popover>
		</view>
		<!-- bg -->
		
		<swiper :current="current" @change="swiperChange"  :style="{'height':winHeight+'px'}">
			<swiper-item class="swiper-item">
				<scroll-view scroll-y style="width: 100%;" :style="{'height':winHeight+'px'}">
					<view class="bg">
						<view class="u-flex-col u-col-center u-p-t-38">
							<!-- <u-image @click="toEquipList" src="../../static/banner1.png" width="602rpx" height="448rpx" mode="aspectFit"></u-image> -->
							<image @click="toEquipList" src="../../static/banner1.png" mode="widthFix" style="width: 100%;"></image>
							<view class="u-flex-col u-col-center" style="margin-top: -130rpx;z-index: 999;">
								<view class="bg__name" v-show="localChannel == '1'">金浪318</view>
								<view class="bg__name" v-show="localChannel == '0'">恒勃智联</view>
								<!-- <view class="bg__status" :style="{ color: socketStatus === '已连接' ? 'green' : '#7D818C' }">{{ socketStatus }} | BT</view> -->
							</view>
						</view>
					</view>
				<!-- 	<view class="u-flex u-row-center u-m-l-30 u-m-r-30 map">
						<u-image src="/static/index/map.png" width="100%" height="140rpx" mode="aspectFit"></u-image>
						<view class="map__btn">{{$getLang('导航寻车')}}</view>
					</view> -->
					<view class="device" v-if="equipInfo">
						<view class="device__title">{{$getLang('设备信息')}}</view>
						<view class="u-m-t-10 u-font-26">{{$getLang('设备')}}：{{ equipInfo ? equipInfo.osAppProjectName : '' }}</view>
						<view class="u-m-t-10 u-font-26">MCU：{{ equipInfo ? equipInfo.mcuVersion : '' }}</view>
						<view class="u-m-t-10 u-font-26">{{$getLang('系统')}}：{{ equipInfo ? equipInfo.osAppProjectSN : '' }}</view>
					</view>
					<view v-else>
						<view class="u-m-t-100" style="width: 460rpx;height: 150rpx;margin:50rpx auto;text-align: center;">
							<text style="line-height: 50rpx;color: #ccc;font-size: 32rpx;">{{$getLang('您当前还未绑定任何设备哦')}}~</text>
							<button @tap="onPlusDialog({value:'sanc'})" 
							style="background-color:#087DFF;color: #fff;margin-top: 30rpx;width: 310rpx;">{{$getLang('立即扫码绑定')}}</button>
						</view>
					</view>
					<!-- <view v-show="localChannel == '1'" class="u-m-l-30 u-m-r-30 u-flex wrap__bottom u-row-between">
						<view  v-show="localChannel == '1'" class="wrap__bottom__view" @click="carinfo(0)">
							<u-icon name="/static/index/menu-1.png" size="64"></u-icon>
							<view class="u-font-26 u-type-info">{{$getLang('车辆信息')}}</view>
						</view>
						<view  v-show="localChannel == '1'" class="wrap__bottom__view" @click="carinfo(1)">
							<u-icon name="/static/index/menu-2.png" size="64"></u-icon>
							<view class="u-font-26 u-type-info">{{$getLang('仪表设置')}}</view>
						</view>
						
					</view> -->
					<view v-show="localChannel == '0'" class="u-m-l-30 u-m-r-30 u-flex wrap__bottom u-row-between">
						<view v-show="localChannel == '0'" class="wrap__bottom__view" @click="upgradation">
							<u-icon name="/static/index/menu-3.png" size="64"></u-icon>
							<view class="u-font-26 u-type-info">OTA</view>
						</view>
					</view>
				</scroll-view>
			</swiper-item>
			<swiper-item class="swiper-item">
				<scroll-view scroll-y style="width: 100%;" :style="{'height':winHeight+'px'}">
					<DvrList ref="dvrlist" />
				</scroll-view>
			</swiper-item>
		</swiper>
		
		
		<u-tabbar v-show="isShowTabbar" v-model="tabCurrent" :list="tablist" :mid-button="true" :border-top="false" active-color="#087DFF"
			@change="changes" mid-button-size="140" icon-size="50"></u-tabbar>
	</view>
</template>

<script>
	import DvrList from './components/dvrlist.vue'
	import {connectWifi,getConnectedSSID,removeWifi,removeWifiBySSID} from '../../common/cx-wifi/cx-wifi.js'
	export default {
		components: { DvrList },
		data() {
			return {
				tablist: [{
						iconPath: "/static/tabbar/menu_ls.png",
						selectedIconPath: "/static/tabbar/menu_ls_active.png",
						text: this.$getLang('在路上'),
						customIcon: false
					},
					{
						iconPath: "/static/tabbar/car_un.png",
						selectedIconPath: "/static/tabbar/car.png",
						text: '',
						midButton: true,
						customIcon: false,
					},
					{
						iconPath: "/static/tabbar/menu_my.png",
						selectedIconPath: "/static/tabbar/menu_my_active.png",
						text: this.$getLang('我的'),
						customIcon: false,
					}
				],
				tabCurrent: 1,
				list: [{
					name: this.$getLang('设备')
				}, {
					name: 'DVR'
				}],
				current: 0,
				actions: [{
					text: this.$getLang('扫一扫'),
					value: 'sanc'
				}],
				socketStatus: this.$getLang('未连接'),
				equipInfo: {},
				localChannel: '',
				osAppProjectSN: '',
				mcuProjectSN: '',
				mcuOTCSN: '',
				isShowTabbar:true,
				
				isPageLoaded:false,
				winHeight:860,
				
				isBlockEvent:true,
			}
		},
		onLoad() {
			uni.getSystemInfo({
			  success: function(res) {
			    console.log('屏幕高度:', res.screenHeight);
			    console.log('窗口高度:', res.windowHeight);
				this.winHeight=res.windowHeight-300;
				console.log(this.winHeight)
			  }
			});
			this.isShowTabbar=true;
			this.loadData()
		},
		methods: {
			swiperChange(e){
				this.change(e.target.current,1);
			},
			loadData() {
				const token = uni.getStorageSync('apitoken')
				const user = uni.getStorageSync('user')
				if (token && user) {
					getApp().globalData.apitoken = token
					getApp().globalData.user = user
				}
				if (getApp().globalData.apitoken == '') {
					this.returnLogin();
					return
				}
				this.$u.api.getUser({ userId: getApp().globalData.user.id })
					.then(res => {
						console.log(res)
					}).catch(e => {
						// uni.navigateTo({
						// 	url:"/pages/login/login"
						// })
						this.returnLogin();
					})
				this.loadEquipList()
				this.upgradeInfo()
			},
			returnLogin(){
				var getCurSSID=getConnectedSSID();//当前的网络wifi
				const ssid =uni.getStorageSync('devsn');//设备绑定的wifi
				console.log(getCurSSID,ssid);
				if(`"${ssid}"`==getCurSSID){
					uni.showLoading({
						title:'断开设备...',
					})
					removeWifiBySSID(ssid);
					setTimeout(()=>{
						uni.hideLoading();
						uni.navigateTo({
							url:"/pages/login/login"
						})
					},2000);
				}else{
					uni.navigateTo({
						url:"/pages/login/login"
					})
				}
				
			},
			loadEquipList() {
				this.$u.api.getEquipList({ userId: getApp().globalData.user.id, sn: uni.getStorageSync('devsn') })
					.then(res => {
						if (res.code === 0) {
							this.equipInfo = res.data[0]
							this.mcuProjectSN = this.equipInfo ? this.equipInfo.mcuVersion : ''
							this.mcuOTCSN = this.equipInfo ? this.equipInfo.mcuOTCSN : ''
							this.osAppProjectSN = this.equipInfo ? this.equipInfo.osAppProjectSN : ''
							this.localChannel = this.equipInfo ? this.equipInfo.channel : ''
							getApp().globalData.equip = this.equipInfo
							// this.autoConnection()
						}
					})
			},
			change(index,opt=0) {
				if(this.isBlockEvent==false){
					return;
				}
				this.isBlockEvent=false;
				var ssid = this.equipInfo.apSN
				var password = this.equipInfo.apPassword
				if (index === 1) {
					uni.showModal({
						 title: this.$getLang('提示'),
						 content:'切换到DVR界面，会自动连接车机设备，WIFI名称为【'+ssid+'】.如果连接失败，请手动到WIFI列表连接：WIFI【'+ssid+'】，密码【'+password+'】连接成功再点击继续,是否继续？',
						 cancelText:this.$getLang('取消'),
						 confirmText:this.$getLang('继续'),
						 success:(res)=>{
							 this.isShowTabbar=false;
							 if(this.current!=index){
							 	this.current = index;
							 }
							if(res.confirm){
								 this.$refs['dvrlist'].loadData();
							}
							setTimeout(()=>{
								this.isBlockEvent=true;
							},2000)
							
						 }
					})
				}else{
					uni.showModal({
						 title: this.$getLang('提示'),
						 content:'离开DVR页面会断开与车机的连接，是否继续？',
						 cancelText:this.$getLang('取消'),
						 confirmText:this.$getLang('继续'),
						 success:(res)=>{
							 if(res.confirm){
								this.isShowTabbar=true;
								if(this.current!=index){
									this.current = index;
								}
								removeWifiBySSID(ssid);
							}
							if(opt==1){
								if(this.current!=index){
									this.current = index;
								}
								this.isShowTabbar=true;
							}
							setTimeout(()=>{
								this.isBlockEvent=true;
							},2000)
						},
					});
					
				}
			},
			changes(index) {
				if (index == 0) {
					uni.navigateTo({
						url:"/pages/home/home",
						animationType:"fade-in"
					})
				} else if (index == 2) {
					uni.navigateTo({
						url:"/pages/my/my",
						animationType:"fade-in"
					})
				}
			},
			carinfo(param) {
				uni.navigateTo({
					url: "/pages/index/carInfo?current=" + param
				})
			},
			upgradation() {
				uni.navigateTo({
					url: `/pages/index/upgradation?mcuProjectSN=${this.mcuProjectSN}&mcuOTCSN=${this.mcuOTCSN}&osAppProjectSN=${this.osAppProjectSN}`
				})
			},
			autoConnection() {
				//   ap=JL560397 &password=88888888&server_url=ws://192.168.3.1:7686
				// 这里要加一个逻辑，根据channel来判断是否自动连接
				if (this.localChannel === '1') {
						const ssid = this.equipInfo.apSN
						const password = this.equipInfo.apPassword
						const url = this.equipInfo.apWebsocket
						if (ssid && password && url) {
							connectWifi(ssid,password);
							this.openWebSocket(url)
							getApp().globalData.devSN = ssid
						}
				}
			},
			onPlusDialog(e) {
				if (e.value === 'sanc') {
					uni.scanCode({
						scanType:['qrCode'],
						autoZoom:false,
						success: (res) => {
							const result = res.result.split('&')
							console.log(result)
							// if (result.length !== 8) {
							// 	uni.showToast({
							// 		title:this.$getLang('仪表版本非最新，请检查') ,
							// 		icon: 'none'
							// 	});
							// }
							try {
								let devName="恒勃智联";
								const ssid = result[0].split('=')[1].replace('\n', '')
								const password = result[1].split('=')[1]
								const url = result[2].split('=')[1]
								let channel = result[3] ? result[3].split('=')[1] : ''
								const devsn = result[4] ? result[4].split('=')[1] : ssid
								let osver = result[5] ? result[5].split('=')[1] : 'HB-MK630-HJ-256.03HJ-R2104-0.0-231205.A'
								let mcuver = result[6] ? result[6].split('=')[1] : 'BR160-15-00-231205'
								if(!channel){
									osver='HB-JL318-JL-318.01JL-0.0-231205-10.1';
									mcuver='BR160-15-00-231205';
									devName="金浪318";
									channel = '1'
								}
								const conf = result[7] ? result[7].split('=')[1] : ''
								
								this.localChannel = channel
								// 上报设备信息到云端
								const params = { devSN: devsn, devOSAppVersion: osver, devMCUVersion: mcuver, channel, conf,
									apSN:ssid,apPassword:password,apWebsocket:url,devName:devName
								}
								// console.log('params',params);
								this.$u.api.sendDevInfo(params).then(res => {
									// console.log('sendDevInfo:',res);
									if(res.code!==0){
										uni.showToast({
											title:this.$getLang(res.code) ,
											icon:'none'
										})
									}else{
										getApp().globalData.devSN = ssid;
										this.loadEquipList();
										uni.showModal({
											title: this.$getLang('提示'),
											content:'恭喜您，设备绑定成功，当前设备的设备号为【'+devsn+'】。注意：设备WIFI名称跟设备号是同一个【'+devsn+'】',
											showCancel:false,
											confirmText:this.$getLang('确定'),
											success:(res)=> {
												
											}
										})
										// if(channel!='0'){
										// 	connectWifi(ssid,password);
										// 	this.openWebSocket(url);
										// }
										uni.setStorageSync('devsn', devsn)
									}
								})
							} catch(e) {
								console.error(e)
							}
						}
					})
				}
			},
			openWebSocket(url) {
				this.socketStatus = this.$getLang('连接中');
			  const ws = uni.connectSocket({
			    url: url,
					protocols: ['dvr-server'],
					success: res => {
						// getApp().globalData.socketTask = ws
					},
					fail: err => {
						this.socketStatus = this.$getLang('连接失败'); 
						console.error(err)
						uni.showToast({
							title: 'socket'+this.$getLang('连接失败') + err,
							icon: 'none'
						});
					},
			  });
			  ws.onOpen(() => {
					this.socketStatus = this.$getLang('已连接'); 
					getApp().globalData.socketTask = ws
			  });
				ws.onClose(() => {
					getApp().globalData.socketTask = null
				})
			  // ws.onMessage((res) => {
			  //   console.log('收到服务器内容：' + res.data);
			  //   // this.msg = res.data;
			  // });
			  ws.onError((err) => {
					this.socketStatus = this.$getLang('未连接');
					// uni.showToast({
					// 	title:this.$getLang('连接失败'),
					// 	icon: 'none'
					// });
					console.log('WebSocket连接打开失败，请检查！');
			  });
			},
			// 获取是否需要升级
			upgradeInfo() {
				this.$u.api.getLastPackage({ appsoftsn: 'App-20240422153752' })
					.then(res => {
						console.log(res)
						if (res.code === 0 ) {
							var data=res.data;
							var vercode=data.vercode;
							// console.log(vercode)
							plus.runtime.getProperty(plus.runtime.appid,(inf) => {
								var curVersion=inf.version;
								// console.log(curVersion)
								//如果当前版本小于服务器版本返回-1;
								//如果当前版本等于服务器版本返回0;
								var val = this.compareVersions(curVersion,vercode);
								console.log(curVersion,vercode);
								if(val==-1){
									uni.setStorageSync('appAPK',res.data);
									// console.log('app版本发生变化');
									uni.navigateTo({
									    url: '/uni_modules/rt-uni-update/components/rt-uni-update/rt-uni-update'
									})
									
								}
							})
							
							
						}
					})
			},
			compareVersions(version1,version2){
				const v1Parts = version1.split('.').map(Number);
				const v2Parts = version2.split('.').map(Number);
			
				for (let i = 0; i < Math.max(v1Parts.length, v2Parts.length); i++) {
					const v1Part = v1Parts[i] || 0;
					const v2Part = v2Parts[i] || 0;
			
					if (v1Part > v2Part) {
						return 1;
					} else if (v1Part < v2Part) {
						return -1;
					}
				}
				return 0; // 如果所有部分都相等，则认为版本号相同
			},
			// 设备列表选择
			toEquipList() {
				uni.navigateTo({
					url: "/pages/index/myEquipList"
				})
			}
		},
	}
</script>

<style lang="scss">
	body,
	html {
		background-color: #F3F3F5;
	}

	.wrap {
		&__head {
			position: relative;
			.item-popover {
				position: absolute;
				top: 0rpx;
				right: 30rpx;
			}
			&__plus {
				// position: absolute;
				// top: 20rpx;
				// right: 30rpx;
			}
		}

		.device {
			background-color: white;
			margin: 30rpx;
			border-radius: 14rpx;
			padding: 30rpx;

			&__title {
				font-size: 30rpx;
				font-weight: bold;
			}
		}

		&__bottom {
			&__view {
				display: flex;
				flex-direction: column;
				align-items: center;
				width: 30%;
				background-color: white;
				border-radius: 14rpx;
				padding: 30rpx 0;

				view {
					margin-top: 10rpx;
				}
			}
		}

		.bg {
			background: url("../../static/index/bg.png") no-repeat;
			height: 618rpx;
			background-size: 100%;

			&__name {
				font-size: 36rpx;
				font-weight: 500;
				color: #222222;
				margin-bottom: 8rpx;
			}

			&__status {
				background-color: white;
				text-align: center;
				border-radius: 30rpx;
				padding: 14rpx 22rpx;
				font-size: 24rpx;
				font-weight: 400;
				color: #7D818C;
			}
		}

		.map {
			position: relative;

			&__btn {
				position: absolute;
				top: 46rpx;
				right: 40rpx;
				z-index: 99;
				background-color: #087DFF;
				font-size: 24rpx;
				color: white;
				padding: 12rpx 20rpx;
				border-radius: 30rpx;
			}
		}
	}
</style>
<style>
	.tabs{
		background-color: #EBF5FF;width: 100%;height: 60rpx;
	}
	.tabs-body{
		width: 300rpx;height:50rpx; margin: auto;display: flex;flex-direction:row;
	}
	.tabs-item{
		width: 100rpx;text-align: center;position: relative;line-height: 50rpx;font-size: 32rpx;
	}
	.tabs-active{
		color: #1F252A;font-weight: bold;
		
	}
	.tabs-bar{
		position: absolute;bottom: -6rpxrpx;left: 23rpx; width:54rpx;height: 6rpx;background-color: #1F252A;border-radius: 2rpx;
	}
</style>