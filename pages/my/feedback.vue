<template>
	<view class="wrap">
		<u-input v-model="value" type="textarea" placeholder="请在此处输入反馈信息" height="400" :custom-style="customStyle" />
		<view class="u-m-t-180">
			<u-button @click="submit" type="primary">提交反馈</u-button>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				value: '',
				customStyle: {
					background: '#fff',
					borderRadius: '14rpx',
					padding: '30rpx'
				}
			}
		},
		methods: {
			submit() {
				this.$u.api.feedback({ content: this.value })
					.then(res => {
						if (res.code === 0) {
							uni.showToast({
								title: '提交用户反馈成功！',
								icon: 'none'
							})
							uni.navigateTo({
								url: "/pages/my/my",
								animationType: "fade-in"
							})
						} else {
							uni.showToast({
								title: res.message,
								icon: 'none'
							})
						}
					})
			}
		}
	}
</script>

<style lang="scss">
	body,
	html {
		background-color: #F3F3F5;
	}

	.wrap {
		margin: 40rpx;
	}
</style>