<template>
	<view class="wrap">
		<u-image src="/static/tabbar/menu_my_active.png" width="120" height="120"></u-image>
		<view class="u-m-t-40">{{$getLang('当前版本')}}：v{{version}}</view>
		<view class="u-m-t-700 u-flex-col u-col-center">
			<view class="newVersion">
				<!-- <view class="newVersion__new">new</view> -->
				{{$getLang('新版本')}}：v{{version}}
			</view>
			<view>
				{{$getLang('当前已是最新版本')}}
			</view>
		</view>
	</view>
</template>

<script>

	export default {
		data() {
			return {
				version:'1.0.0'
			}
		},
		onLoad:function(){
			uni.setNavigationBarTitle({title:this.$getLang('关于')});
			plus.runtime.getProperty(plus.runtime.appid,(inf) => {
				this.version = inf.version;
			})
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
		background-color: white;
		margin: 40rpx;
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 100rpx 0 150rpx 0;
		border-radius: 14rpx;
	}

	.newVersion {
		position: relative;
		background-color: #2979ff;
		color: white;
		padding: 20rpx 30rpx;
		margin-bottom: 60rpx;

		// &__new {
		// 	position: absolute;
		// 	top: -40rpx;
		// 	right: -15rpx;
		// 	color: red;
		// 	font-weight: bold;
		// }
	}
</style>