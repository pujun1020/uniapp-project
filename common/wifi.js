function startWifi() {
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
	}
}

function async getWifiList() {
	const hasStart = await this.startWifi()
	if (hasStart !== true) return
	uni.getWifiList({
		success: (res1) => {
			console.log('获取wifi列表命令发送 成功', res1)
			getLianjie()
		},
		fail: (err) => {
			console.error('获取wifi列表 失败', err)
			uni.showModal({
				content: err.errMsg,
				showCancel: false
			})
		},
	})
}

export default {
	
}