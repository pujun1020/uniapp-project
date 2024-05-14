<template>
	<view class="wrap">
		<u-gap height="88" bg-color="#EBF5FF"></u-gap>
		<view class="wrap__head">
			<u-tabs v-if="localChannel == '1'" :list="list" :is-scroll="false" :current="current" @change="change" bg-color="#EBF5FF"
				font-size="32" active-color="#1F252A" bar-width="67"></u-tabs>
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
		<view v-show="current === 0">
			<view class="bg">
				<view class="u-flex-col u-col-center u-p-t-38">
					<u-image @click="toEquipList" src="/static/index/car.png" width="602rpx" height="448rpx" mode="aspectFit"></u-image>
					<view class="u-flex-col u-col-center">
						<view class="bg__name" v-show="localChannel == '1'">金浪318</view>
						<view class="bg__name" v-show="localChannel == '0'">恒勃智联</view>
						<!-- <view class="bg__status" :style="{ color: socketStatus === '已连接' ? 'green' : '#7D818C' }">{{ socketStatus }} | BT</view> -->
					</view>
				</view>
			</view>
			<view class="u-flex u-row-center u-m-l-30 u-m-r-30 map">
				<u-image src="/static/index/map.png" width="100%" height="140rpx" mode="aspectFit"></u-image>
				<view class="map__btn">{{$getLang('导航寻车')}}</view>
			</view>
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
			<view class="u-m-l-30 u-m-r-30 u-flex wrap__bottom u-row-between">
				<!-- <view  v-show="localChannel == '1'" class="wrap__bottom__view" @click="carinfo(0)">
					<u-icon name="/static/index/menu-1.png" size="64"></u-icon>
					<view class="u-font-26 u-type-info">{{$getLang('车辆信息')}}</view>
				</view>
				<view  v-show="localChannel == '1'" class="wrap__bottom__view" @click="carinfo(1)">
					<u-icon name="/static/index/menu-2.png" size="64"></u-icon>
					<view class="u-font-26 u-type-info">{{$getLang('仪表设置')}}</view>
				</view> -->
				<view v-show="localChannel == '0'" class="wrap__bottom__view" @click="upgradation">
					<u-icon name="/static/index/menu-3.png" size="64"></u-icon>
					<view class="u-font-26 u-type-info">OTA</view>
				</view>
			</view>
		</view>
		<view v-show="current === 1">
			<DvrList ref="dvrlist" />
		</view>
		<u-tabbar v-model="tabCurrent" :list="tablist" :mid-button="true" :border-top="false" active-color="#087DFF"
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
				mcuOTCSN: ''
			}
		},
		onLoad() {
			this.loadData()
		},
		methods: {
			loadData() {
				const token = uni.getStorageSync('apitoken')
				const user = uni.getStorageSync('user')
				if (token && user) {
					getApp().globalData.apitoken = token
					getApp().globalData.user = user
				}
				if (getApp().globalData.apitoken == '') {
					uni.navigateTo({
						url:"/pages/login/login"
					})
					return
				}
				this.$u.api.getUser({ userId: getApp().globalData.user.id })
					.then(res => {
						console.log(res)
					}).catch(e => {
						uni.navigateTo({
							url:"/pages/login/login"
						})
					})
				this.loadEquipList()
				this.upgradeInfo()
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
							this.autoConnection()
						}
					})
			},
			change(index) {
				this.current = index;
				if (this.current === 1) {
					this.$refs['dvrlist'].loadData()
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
							if (result.length !== 8) {
								uni.showToast({
									title:this.$getLang('仪表版本非最新，请检查') ,
									icon: 'none'
								});
							}
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
								console.log('params',params);
								this.$u.api.sendDevInfo(params).then(res => {
									console.log('sendDevInfo:',res);
									if(res.code!==0){
										uni.showToast({
											title:this.$getLang(res.code) ,
											icon:'none'
										})
									}else{
										getApp().globalData.devSN = ssid;
										this.loadEquipList();
										if(channel!='0'){
											connectWifi(ssid,password);
											this.openWebSocket(url);
										}
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
				console.log('正在打开socket', url)
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
				top: 20rpx;
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