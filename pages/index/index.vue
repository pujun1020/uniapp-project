<template>
	<view class="wrap">
		<u-gap height="88" bg-color="#EBF5FF"></u-gap>
		<view class="wrap__head">
			<u-tabs v-show="localChannel == '1'" :list="list" :is-scroll="false" :current="current" @change="change" bg-color="#EBF5FF"
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
					<u-image src="/static/index/car.png" width="602rpx" height="448rpx" mode="aspectFit"></u-image>
					<view class="u-flex-col u-col-center">
						<view class="bg__name">金浪318</view>
						<view class="bg__status" :style="{ color: socketStatus === '已连接' ? 'green' : '#7D818C' }">{{ socketStatus }} | BT</view>
					</view>
				</view>
			</view>
			<view class="u-flex u-row-center u-m-l-30 u-m-r-30 map">
				<u-image src="/static/index/map.png" width="100%" height="140rpx" mode="aspectFit"></u-image>
				<view class="map__btn">导航寻车</view>
			</view>
			<view class="device">
				<view class="device__title">设备信息</view>
				<view class="u-m-t-10 u-font-26">设备：{{ equipInfo ? equipInfo.osAppProjectName : '' }}</view>
				<view class="u-m-t-10 u-font-26">MCU：{{ equipInfo ? equipInfo.mcuVersion : '' }}</view>
				<view class="u-m-t-10 u-font-26">系统：{{ equipInfo ? equipInfo.osAppProjectSN : '' }}</view>
			</view>
			<view v-show="localChannel == '1'" class="u-m-l-30 u-m-r-30 u-flex wrap__bottom u-row-between">
				<view class="wrap__bottom__view" @click="carinfo(0)">
					<u-icon name="/static/index/menu-1.png" size="64"></u-icon>
					<view class="u-font-26 u-type-info">车辆信息</view>
				</view>
				<view class="wrap__bottom__view" @click="carinfo(1)">
					<u-icon name="/static/index/menu-2.png" size="64"></u-icon>
					<view class="u-font-26 u-type-info">仪表设置</view>
				</view>
				<view class="wrap__bottom__view" @click="upgradation">
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
	export default {
		components: { DvrList },
		data() {
			return {
				tablist: [{
						iconPath: "/static/tabbar/menu_ls.png",
						selectedIconPath: "/static/tabbar/menu_ls_active.png",
						text: '在路上',
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
						text: '我的',
						customIcon: false,
					}
				],
				tabCurrent: 1,
				list: [{
					name: '设备'
				}, {
					name: 'DVR'
				}],
				current: 0,
				actions: [{
					text: '扫一扫',
					value: 'sanc'
				}],
				socketStatus: '未连接',
				equipInfo: {},
				localChannel: '',
				osAppProjectSN: '',
				mcuProjectSN: '',
				mcuOTCSN: ''
			}
		},
		onLoad() {
			this.loadData()
			this.autoConnection()
		},
		methods: {
			loadData() {
				// uni.setStorageSync('channel', '1') // 测试全功能
				const token = uni.getStorageSync('apitoken')
				const user = uni.getStorageSync('user')
				this.localChannel = uni.getStorageSync('channel')
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
				this.$u.api.getEquipList({ userId: getApp().globalData.user.id })
					.then(res => {
						if (res.code === 0) {
							this.equipInfo = res.data[0]
							this.mcuProjectSN = this.equipInfo ? this.equipInfo.mcuVersion : ''
							this.mcuOTCSN = this.equipInfo ? this.equipInfo.mcuOTCSN : ''
							this.osAppProjectSN = this.equipInfo ? this.equipInfo.osAppProjectSN : ''
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
				const ssid = uni.getStorageSync('ssid')
				const password = uni.getStorageSync('wifipwd')
				const url = uni.getStorageSync('socketurl')
				if (ssid && password && url) {
					this.getWifiList(ssid, password)
					this.openWebSocket(url)
					getApp().globalData.devSN = ssid
				}
			},
			onPlusDialog(e) {
				if (e.value === 'sanc') {
					uni.scanCode({
						success: (res) => {
							const result = res.result.split('&')
							console.log(result)
							if (result.length !== 8) {
								uni.showToast({
									title: '仪表版本非最新，请检查',
									icon: 'none'
								});
							}
							try {
								const ssid = result[0].split('=')[1].replace('\n', '')
								const password = result[1].split('=')[1]
								const url = result[2].split('=')[1]
								const channel = result[3] ? result[3].split('=')[1] : '0'
								const devsn = result[4] ? result[4].split('=')[1] : ssid
								const osver = result[5] ? result[6].split('=')[1] : 'HB-MK630-HJ-256.03HJ-R2104-0.0-231205.A'
								const mcuver = result[6] ? result[6].split('=')[1] : 'BR160-15-00-231205'
								const conf = result[7] ? result[7].split('=')[1] : ''
								uni.setStorageSync('ssid', ssid)
								uni.setStorageSync('wifipwd', password)
								uni.setStorageSync('socketurl', url)
								uni.setStorageSync('channel', channel)
								this.localChannel = channel
								// 上报设备信息到云端
								const params = { devSN: devsn, devOSAppVersion: osver, devMCUVersion: mcuver, channel, conf }
								this.$u.api.sendDevInfo(params).then(res => {
									getApp().globalData.devSN = ssid
								})
								this.getWifiList(ssid, password)
								this.openWebSocket(url)
							} catch(e) {
								console.error(e)
							}
						}
					})
				}
			},
			startWifi() {
				return new Promise((resolve, reject) => {
					uni.startWifi({
						success: (res => {
							console.log('启动wifi 成功', res)
							resolve(true)
						}),
						fail: (err) => {
							console.error('启动wifi 失败', err)
							uni.showModal({
								content: err.errMsg,
								showCancel: false
							})
							reject(new Error(err))
						},
					})
				})
			},
			async getWifiList(ssid, password) {
				const hasStart = await this.startWifi()
				console.log(hasStart)
				if (hasStart !== true) return
				uni.getWifiList({
					success: (res1) => {
						console.log('获取wifi列表命令发送 成功', res1)
						this.getLianjie(ssid, password)
					},
					fail: (err) => {
						console.error('获取wifi列表 失败', err)
						uni.showModal({
							content: err.errMsg,
							showCancel: false
						})
					},
				})
			},
			getLianjie(ssid, password) {
				uni.connectWifi({
					SSID: ssid,
					password: password,
					forceNewApi:true,
					success: (res) => {
						console.log('wifi 成功:', res)
						this.$uni.gettitle(res.errMsg)
					},
					fail: (err) => {
						console.error('wifi连接 失败:', err)
						uni.showModal({
							content: err.errMsg,
							showCancel: false
						})
					},
				})
			},
			openWebSocket(url) {
				this.socketStatus = '连接中'
			  const ws = uni.connectSocket({
			    url: url,
					protocols: ['dvr-server'],
					success: res => {
						// getApp().globalData.socketTask = ws
					},
					fail: err => {
						this.socketStatus = '连接失败'
						console.error(err)
						uni.showToast({
							title: 'socket连接失败' + err,
							icon: 'none'
						});
					},
			  });
			  ws.onOpen(() => {
					this.socketStatus = '已连接'
					getApp().globalData.socketTask = ws
			  });
			  // ws.onMessage((res) => {
			  //   console.log('收到服务器内容：' + res.data);
			  //   // this.msg = res.data;
			  // });
			  ws.onError((err) => {
					this.socketStatus = '未连接'
					uni.showToast({
						title: '连接失败',
						icon: 'none'
					});
			    console.log('WebSocket连接打开失败，请检查！');
			  });
			},
			// 获取是否需要升级
			upgradeInfo() {
				this.$u.api.getLastPackage({ appsoftsn: 'App-20240422153752' })
					.then(res => {
						console.log(res)
						if (res.code === 0 && res.data.length === 1) {
							uni.navigateTo({
							    url: '/uni_modules/rt-uni-update/components/rt-uni-update/rt-uni-update'
							})
						}
					})
			},
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