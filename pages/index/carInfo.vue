<template>
	<view class="wrap">
		<u-gap height="88" bg-color="#EEF6FF"></u-gap>
		<view class="wrap__head">
			<u-icon name="arrow-left" color="#000" size="40" class="wrap__head__plus" @click="backs"></u-icon>
			<u-tabs :list="list" :is-scroll="false" :current="current" @change="change" bg-color="#EEF6FF"
				font-size="32" active-color="#222" bar-width="65"></u-tabs>
		</view>
		<view v-if="current == 0">
			<view class="bg">
				<view class="u-flex-col u-col-center" style="position: relative;">
					<u-image src="/static/index/info/w.png" width="360rpx" height="314.75rpx"
						style="position: absolute;top:70rpx;left: 0;right: 0;margin: 0 auto;"></u-image>
					<u-image src="/static/index/info/n.png" width="360rpx" height="314.75rpx" class="m-image"></u-image>
				</view>
				<view class="number">
					<text class="u-font-60 u-font-weight">{{ electric }}</text><text class="u-font-30">%</text>
				</view>
				<view class="u-flex u-row-center">
					<u-image src="/static/index/info/menu-3.png" width="28rpx" height="28rpx"></u-image>
					<text class="u-font-24 u-type-info">剩余电量</text>
				</view>
				<view class="u-font-34 u-font-weight u-text-center u-m-t-370">金浪318</view>
			</view>
			<u-grid :col="2" :border="false">
				<u-grid-item :custom-style="customStyle">
					<view class="grid-title">{{ odoMileage }}</view>
					<view class="grid-con">ODO (km)</view>
				</u-grid-item>
				<u-grid-item :custom-style="customStyle">
					<view class="grid-title">{{ tripMileage }}</view>
					<view class="grid-con">TRIP (km)</view>
				</u-grid-item>
			</u-grid>
			<view class="cell">
				<u-cell-group :border="false">
					<u-cell-item icon-size="40" icon="/static/index/info/menu-1.png" title="电压（V）" :value="voltage + 'V'"
						:arrow="false" :title-style="titleStyle" :value-style="valueStyle"></u-cell-item>
					<u-cell-item icon-size="40" icon="/static/index/info/menu-2.png" title="油量" :value="oilmass + '%'"
						:arrow="false" :title-style="titleStyle" :value-style="valueStyle"></u-cell-item>
				</u-cell-group>
			</view>
		</view>
		<view v-else>
			<view class="bg-box">
				<u-image src="/static/index/set/car.png" width="560rpx" height="360rpx" mode="aspectFit"></u-image>
				<view class="u-font-weight u-font-34 u-m-t-40">金浪318</view>
			</view>
			<view class="cell">
				<u-cell-group :border="false">
					<u-cell-item icon-size="40" icon="/static/index/set/menu-1.png" title="主题" :value="themeText"
						:title-style="titleStyle" :value-style="valueStyle" hover-class="none"
						@click="show1 = true"></u-cell-item>
					<u-cell-item icon-size="40" icon="/static/index/set/menu-2.png" title="背光" :value="backlightText"
						:title-style="titleStyle" :value-style="valueStyle" hover-class="none"
						@click="show2 = true"></u-cell-item>
					<u-cell-item icon-size="40" icon="/static/index/set/menu-3.png" title="语言" :value="languageText"
						:title-style="titleStyle" :value-style="valueStyle" hover-class="none"
						@click="show3 = true"></u-cell-item>
					<u-cell-item icon-size="40" icon="/static/index/set/menu-4.png" title="单位" :value="unitText"
						:title-style="titleStyle" :value-style="valueStyle" hover-class="none"
						@click="show4 = true"></u-cell-item>
				</u-cell-group>
			</view>
			<u-select v-model="show1" :list="list1" @confirm="onConfirm($event, 'theme')"></u-select>
			<u-select v-model="show2" :list="list2" @confirm="onConfirm($event, 'backlight')"></u-select>
			<u-select v-model="show3" :list="list3" @confirm="onConfirm($event, 'language')"></u-select>
			<u-select v-model="show4" :list="list4" @confirm="onConfirm($event, 'unit')"></u-select>
		</view>
	</view>
</template>

<script>
	import { connectStartWifi, openWebSocket } from '../../common/wifi-tcp.js'
	
	export default {
		data() {
			return {
				odoMileage: 0, // 总里程
				tripMileage: 0, // 单次里程
				voltage: 0, // 电压
				electric: 0, // 电量
				oilmass: 0, // 油量
				
				theme: 0, // 主题
				themeText: '', // 主题name
				unit: 0, // 单位
				unitText: '', // 单位name
				language: 0, // 语言
				languageText: '', // 语言name
				backlight: 0, // 背光
				backlightText: '', // 背光name
				
				show1: false,
				list1: [{
						value: 0,
						label: '自动'
					}, {
						value: 1,
						label: '白天'
					}, {
						value: 2,
						label: '黑夜'
					}
				],
				show2: false,
				list2: [{
						value: '0',
						label: '自动'
					}
				],
				show3: false,
				list3: [{
						value: 0,
						label: '中文'
					},
					{
						value: 1,
						label: '英文'
					}
				],
				show4: false,
				list4: [{
						value: 0,
						label: '公里'
					},
					{
						value: 1,
						label: '英里'
					}
				],
				list: [{
					name: '车辆信息'
				}, {
					name: '仪表设置'
				}],
				current: 0,
				customStyle: {
					backgroundColor: '#F5F6F8',
					border: "40rpx solid #fff",
					padding: '44rpx 0'
				},
				titleStyle: {
					fontSize: '28rpx',
					fontWeight: '400',
					color: '#222'
				},
				valueStyle: {
					fontSize: '28rpx',
					fontWeight: '400',
					color: '#63656D'
				}
			}
		},
		onLoad(param) {
			this.current = param.current
			if (this.current == 0) {
				this.onLoadCarInfo()
			} else {
				
			}
		},
		methods: {
			change(index) {
				this.current = index;
			},
			async onLoadCarInfo() {
				let socketTask = getApp().globalData.socketTask
				if (!socketTask) {
					if (await connectStartWifi()) {
						socketTask = await openWebSocket()
					}
					socketTask = await openWebSocket()
				}
				socketTask.send({
					data: '{ "METHOD": "CAR.INFO" }'
				})
				socketTask.onMessage((res) => {
					console.log('收到服务器内容：' + res.data)
					const data = JSON.parse(res.data)
					if (data.code !== 0) {
						uni.showToast({
							title: res.errMsg,
							icon:'none'
						})
						return
					}
					if (data.METHOD === 'CAR.INFO' && data.code === 0) {
						this.odoMileage = data.odoMileage
						this.tripMileage = data.tripMileage
						this.voltage = data.voltage
						this.electric = data.electric
						this.oilmass = data.odoMileage
					}
				})
			},
			async onLoadCarConfig() {
				let socketTask = getApp().globalData.socketTask
				if (!socketTask) {
					if (await connectStartWifi()) {
						socketTask = await openWebSocket()
					}
					socketTask = await openWebSocket()
				}
				socketTask.send({
					data: '{ "METHOD": "DEVICE.CONF" }'
				})
				socketTask.onMessage((res) => {
					console.log('收到服务器内容：' + res.data)
					const data = JSON.parse(res.data)
					if (data.code !== 0) {
						uni.showToast({
							title: res.errMsg,
							icon:'none'
						})
						return
					}
					if (data.METHOD === 'DEVICE.CONF.INFO' && data.code === 0) {
						this.theme = data.theme
						this.unit = data.unit
						this.language = data.language
						this.backlight = data.backlight
						this.themeText = this.theme === 0 ? '自动' : (this.theme === 1 ? '黑夜' : '白天')
						this.unitText = this.unit === 0 ? '公里' : '英里'
						this.languageText = this.language === 0 ? '中文' : '英文'
						this.backlightText = '自动'
					}
				})
			},
			onConfirm(item, key) {
				console.log(item)
				if (key === 'theme') {
					this.theme = item[0].value
					this.themeText = item[0].label
				} else if (key === 'unit') {
					this.unit = item[0].value
					this.unitText = item[0].label
				} else if (key === 'language') {
					this.language = item[0].value
					this.languageText = item[0].label
				} else if (key === 'backlight') {
					this.backlight = item[0].value
					this.backlightText = item[0].label
				}
				this.setDeviceConf(key, item[0].value)
			},
			async setDeviceConf(key, value) {
				let socketTask = getApp().globalData.socketTask
				if (!socketTask) {
					if (await connectStartWifi()) {
						socketTask = await openWebSocket()
					}
					socketTask = await openWebSocket()
				}
				socketTask.send({
					data: `{ "METHOD": "DEVICE.CONF.SET", "itemName": "${key}", "itemVlaue": "${value}" }`
				})
			},
			carinfo() {
				uni.navigateTo({
					url: "/pages/index/carInfo"
				})
			},
			backs() {
				uni.navigateBack()
			}
		}
	}
</script>

<style lang="scss">
	.wrap {
		&__head {
			position: relative;

			&__plus {
				position: absolute;
				top: 20rpx;
				left: 30rpx;
				z-index: 9999;
			}
		}
	}

	.bg {
		background: url("../../static/index/info/bg.png") no-repeat;
		height: 750rpx;
		background-size: 100% 100%;
		background-position: center;
	}

	.bg-box {
		background: url("../../static/index/bg.png") no-repeat;
		height: 620rpx;
		display: flex;
		background-size: 100%;
		flex-direction: column;
		justify-content: center;
		align-items: center;
	}

	.m-image {
		position: absolute;
		top: 70rpx;
		left: 0;
		right: 0;
		margin: 0 auto;
	}

	.number {
		text-align: center;
		margin-top: -140rpx;

		text {
			color: #222;
		}
	}

	.cell {
		margin: 0 40rpx;
	}

	.grid-title {
		font-size: 34rpx;
		font-weight: 500;
		color: #222;
		border-bottom: 1px solid #222;
		padding-bottom: 12rpx;
	}

	.grid-con {
		font-size: 28rpx;
		font-weight: 400;
		color: #222;
		padding-top: 12rpx;
	}
</style>