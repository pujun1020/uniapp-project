import { connectWifi, getConnectedSSID } from './cx-wifi/cx-wifi.js'

export function connectStartWifi() {
	return new Promise((resolve, reject) => {
		const ssid = getApp().globalData.equip.apSN
		const password = getApp().globalData.equip.apPassword
		
		var platform=uni.getStorageSync('platform');
		if(platform&&platform=='ios'){
			resolve(false)
		}else{
			connectWifi(ssid, password);
			
			let index = 0
			const interval = setInterval(() => {
				const curSSID = getConnectedSSID()
				if (index > 10) {
					console.log('wifi连接失败')
					clearInterval(interval)
					resolve(false)
				}
				if(`"${ssid}"`== curSSID) {
					console.log('wifi连接成功')
					clearInterval(interval)
					resolve(true)
				} else {
					index++
				}
			}, 1000)
		}
		
	})
}

export function openWebSocket() {
	return new Promise((resolve, reject) => {
		const ws = uni.connectSocket({
			url: getApp().globalData.equip.apWebsocket,
			protocols: ['dvr-server'],
			fail: err => {
				console.error(err)
				getApp().globalData.socketTask = null
				uni.showToast({
					title: '设备连接断开！',
					icon: 'none'
				})
				resolve(false)
			},
		})
		ws.onOpen(() => {
			getApp().globalData.socketTask = ws
			resolve(ws)
		})
		ws.onClose(() => {
			getApp().globalData.socketTask = null
		})
		ws.onError((err) => {
			getApp().globalData.socketTask = null
			uni.showToast({
				title: '设备连接断开！',
				icon: 'none'
			})
			resolve(false)
		})
	})
}