<template>
	<view class="wrap">
		<view>{{$getLang('此处显示隐私说明文本')}}</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {

			}
		},
		onLoad:function(){
			uni.setNavigationBarTitle({title:this.$getLang('隐私协议')});
		},
		methods: {

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
		background-color: white;
		padding: 30rpx;
		border-radius: 14rpx;
		color: #909399;
		height: 1200rpx;
	}
</style>