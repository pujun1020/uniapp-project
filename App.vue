<script>
	export default {
		globalData: {
			apitoken: '',
			uploadtoken: '',
			user: {},
			socketTask: null,
			devSN: '',
			uploadUrl: '',
			equip: {}
		},
		onLaunch: function() {
			this.$u.api.getCloud().then(res => {
				// console.log('云端api地址',res)
				this.$u.api.setRequestUrl(`${res.cloudPlatformHost}:${res.cloudPlatformPort}`)
				getApp().globalData.uploadUrl = `http://${res.uploadHost}:${res.uploadPort}`
			}).catch(e=>{
				console.log('云端api地址报错',e)
				uni.hideLoading();
			})
		},
		onShow: function() {
			console.log('App Show')
		},
		onHide: function() {
			console.log('App Hide')
		}
	}
	
</script>

<style lang="scss">
	/*每个页面公共css */
	@import "uview-ui/index.scss";
	
	// .uni-tabbar__item--mid-button { // 尝试匹配中间按钮
	//   .uni-tabbar__icon { // 修改图标大小
	//     width: 120px !important;
	//     height: 120px !important;
	//   }
	  
	//   // .uni-tabbar__text { // 修改文字样式
	//   //   font-size: 20px !important;
	//   // }
	// }
/* 	*{
		text-transform: capitalize !important;
	} */
</style>