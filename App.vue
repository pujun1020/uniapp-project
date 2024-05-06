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
				this.$u.api.setRequestUrl(`${res.cloudPlatformHost}:${res.cloudPlatformPort}`)
				getApp().globalData.uploadUrl = `http://${res.uploadHost}:${res.uploadPort}`
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
</style>