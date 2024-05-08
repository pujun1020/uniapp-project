import { connectWifi, getConnectedSSID } from './cx-wifi/cx-wifi.js'

export function connectStartWifi() {
	return new Promise((resolve, reject) => {
		const ssid = getApp().globalData.equip.apSN
		const password = getApp().globalData.equip.apPassword
		console.log(ssid, password)
		connectWifi(ssid, password)
		let index = 0
		const interval = setInterval(() => {
			const curSSID = getConnectedSSID()
			if (index > 20) {
				clearInterval(interval)
				resolve(false)
			}
			if(`"${ssid}"`== curSSID){
				clearInterval(interval)
				resolve(true)
			} else {
				index++
			}
		}, 1000)
	})
}

export function openWebSocket() {
	return new Promise((resolve, reject) => {
		const ws = uni.connectSocket({
			url: getApp().globalData.equip.apWebsocket,
			protocols: ['dvr-server'],
			fail: err => {
				console.error(err)
				uni.showToast({
					title: 'socket连接失败' + err,
					icon: 'none'
				})
				resolve(false)
			},
		})
		ws.onOpen(() => {
			getApp().globalData.socketTask = ws
			resolve(true)
		})
		ws.onError((err) => {
			uni.showToast({
				title: '连接失败',
				icon: 'none'
			})
			resolve(false)
		})
	})
}