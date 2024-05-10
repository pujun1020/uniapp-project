<template>
	<view class="wrap">
		<!-- 搜索框 start -->
		<!-- <view class="u-m-l-30 u-m-r-30 u-p-t-30 u-flex bgb">
			<u-search placeholder="视频名称" :show-action='false' bg-color="#fff"></u-search>
			<u-icon name="/static/index/bg-screen.png" size='40' class="u-m-l-30" @click="screen"></u-icon>
		</view> -->
		<!-- 搜索框 end -->

		<view>
			<view class="local-list">
				<!-- 模拟数据 start -->
				<view class="player" v-for="item in vieoList" :key="item.id" @longpress="longpress(item)"
					@click="videoDetail(item)">
					<u-image class="video" :src="item.thumbUrl" width="100%" height="250"></u-image>
					<view class="tips">
						<view class="name">{{ item.name }}</view>
						<view class="timelong">{{ item.title }}</view>
					</view>
				</view>
				<!-- 模拟数据 end -->
			</view>
		</view>

		<!-- 筛选弹出层 start -->
		<u-popup v-model="screenShow" mode="right" width="600">
			<view class="screenWrap">
				<!-- 标题 start -->
				<view class="u-font-34 u-font-weight">筛选内容</view>
				<!-- 标题 end -->
				<u-divider>设备筛选</u-divider>
				<view>
					<u-radio-group v-model="selectEquip" @change="radioGroupChange" wrap size="40">
						<u-radio @change="radioChange" v-for="(item, index) in filterEquipList" :key="index" :name="item.name"
							:disabled="item.disabled" class="u-m-t-40" label-size="36">
							<view class="u-m-l-30">{{item.name}}</view>
						</u-radio>
					</u-radio-group>
				</view>
				<u-divider>录制方向</u-divider>
				<!-- 分类 start -->
				<view>
					<u-radio-group v-model="value" @change="radioGroupChange" wrap size="40">
						<u-radio @change="radioChange" v-for="(item, index) in translate" :key="index" :name="item.name"
							:disabled="item.disabled" class="u-m-t-40" label-size="36">
							<view class="u-m-l-30">{{item.name}}</view>
						</u-radio>
					</u-radio-group>
				</view>
				<!-- 分类 end -->
				<!-- 日历筛选 start -->
				<view class="u-m-t-40">
					<u-input placeholder="请选择时间段" disabled border @click="calendarShow = true"
						v-model="calendarValue" />
				</view>
				<!-- 日历筛选 end -->
				<view class="u-flex screenWrap__btn">
					<u-button shape="circle" @click="resetting">重置</u-button>
					<u-button type="primary" shape="circle">确定</u-button>
				</view>
			</view>
		</u-popup>
		<!-- 筛选弹出层 end -->
		<!-- 日历筛选组件 -->
		<u-calendar v-model="calendarShow" mode="range" @change="calendarChange"></u-calendar>
		<!-- 上传进度弹出层 start -->
		<u-popup v-model="uploadShow" mode="center" width="500" height="500" border-radius="14" :mask-close-able="false" closeable>
			<view class="u-m-l-30 u-m-r-30 u-m-t-25 u-m-b-30">
				<view class="u-text-center">
					<view class="u-font-34 u-font-weight">视频名称</view>
					<view class="u-type-info u-font-24 u-m-t-10">2024-3-22 17:15:00</view>
				</view>
				
				<view style="margin-top: 30%;">
					<u-line-progress active-color="#2979ff" :percent="70"></u-line-progress>
				</view>
			</view>
		</u-popup>
		<!-- 上传进度弹出层 end -->
	</view>
</template>

<script>
	import { connectStartWifi, openWebSocket } from '../../../common/wifi-tcp.js'
	
	export default {
		data() {
			return {
				background: {
					background: "#F3F3F5"
				},
				keyword: '',
				loadStatus: 'loadmore',
				pageIndex: 1,
				pageSize: 5,
				allDate: [],
				dateList: [],
				vieoList: [],
				
				// 筛选弹出层
				screenShow: false,
				// 设备
				filterEquipList: [{
						name: '全部',
						disabled: false
					},
					{
						name: '设备1',
						disabled: false
					},
					{
						name: '设备2',
						disabled: false
					},
					{
						name: '设备3',
						disabled: false
					}
				],
				selectEquip: '',
				// 分类
				translate: [{
						name: '全部',
						disabled: false
					},
					{
						name: '前录',
						disabled: false
					},
					{
						name: '后录',
						disabled: false
					}
				],
				value: '',
				// 日历筛选
				calendarShow: false,
				calendarValue: '',
				// 上传进度条
				uploadShow: false
			}
		},
		onReachBottom() {
			this.loadStatus = 'loading';
			// 模拟数据加载
			this.dateList = this.allDate().slice(0, this.pageIndex * this.pageSize)
			if (this.pageIndex * this.pageSize > this.allDate.length) {
				this.pageIndex++
				this.loadStatus = 'nomore'
			} else {
				this.loadStatus = 'loadmore'
			}
		},
		onLoad() {
			this.loadData()
		},
		methods: {
			// 长按事件 start
			longpress(item) {
				uni.showActionSheet({
					itemList: ['上传', '删除'],
					success: (res) => {
						console.log(item)
						if (res.tapIndex == 0) {
							this.uploadShow = true;
						} else {
							uni.showModal({
								title: '删除提示',
								content: '确认要删除当前视频吗？',
								success: (res) => {
									if (res.confirm) {
										uni.showToast({
											title: '删除成功',
											icon: 'none'
										})
									}
								}
							})
						}
					},
					fail: function(res) {
						console.log(res.errMsg);
					}
				});
			},
			// 长按事件 end
			// 筛选事件触发 start
			screen() {
				this.screenShow = true;
			},
			// 筛选事件触发 end
			// 筛选分类 start
			// 选中某个单选框时，由radio时触发
			radioChange(e) {
				console.log(e);
			},
			// 选中任一radio时，由radio-group触发
			radioGroupChange(e) {
				console.log(e);
			},
			// 筛选分类end
			// 日历选择触发 start
			calendarChange(param) {
				this.calendarValue = param.startDate + ' - ' + param.endDate
			},
			// 日历选择触发 end
			// 重置 start
			resetting() {
				this.value = '';
				this.calendarValue = '';
			},
			async loadData() {
				let socketTask = getApp().globalData.socketTask
				if (!socketTask) {
					if (await connectStartWifi()) {
						socketTask = await openWebSocket()
					}
				}
				socketTask.send({
					data: '{ "METHOD": "VIDEO.DATE", "previewType": "all" }'
				})
				socketTask.onMessage((res) => {
					// console.log('收到服务器内容：' + res.data)
					const data = JSON.parse(res.data)
					if (data.METHOD === 'VIDEO.DATE' && data.code === 0) {
						const allDate = data.dateList
						this.allDate = allDate
						this.pageIndex = 1
						this.dateList = allDate.slice(0, this.pageIndex * this.pageSize)
						this.loadVideo()
					} else if (data.METHOD === 'VIDEO.INFO.LIST' && data.code === 0) {
						data.videoBeanList.forEach(video => {
							this.vieoList.push(video)
						})
					} else {
						console.error(data)
					}
				})
			},
			loadVideo() {
				const socketTask = getApp().globalData.socketTask
				this.dateList.forEach(d => {
					socketTask.send({
						data: `{ "METHOD": "VIDEO.INFO.LIST", "previewType": "all", "date": "${d}", "index": 0, "num": 99, "sort": "des", "time": "0-24" }`
					})
				})
			},
			// onUpload() {
			// 	console.log('点击了上传')
			// },
			// 视频详情
			videoDetail(item) {
				uni.navigateTo({
					url: `/pages/home/home-videodetail?type=0&angle=${item.angle}&duration=${item.duration}&exigency=${item.exigency}&id=${item.id}&name=${item.name}&playUrl=${item.playUrl}&recordTime=${item.recordTime}&size=${item.size}&title=${item.title}&thumbUrl=${item.thumbUrl}`,
				})
			}
		}
	}
</script>

<style lang="scss">
	body,
	html {
		background-color: #EBF5FF;
	}

	.wrap {
		.bgb {
			background-color: #EBF5FF;
		}
		&__head {
			position: relative;

			&__plus {
				position: absolute;
				top: 20rpx;
				right: 30rpx;
			}
		}

		.swiper-item {
			position: relative;
			background-color: #EBF5FF;
		}
	}

	.clound-top {
		padding: 30rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		background-color: #EBF5FF;

		.subsection {
			width: 360rpx;
			margin-right: 36rpx;
		}
	}

	.clound-swiper {
		padding: 30rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-wrap: wrap;
		background-color: #EBF5FF;

		.video {
			width: 650rpx;
		}

		.tips {
			width: 100%;
			display: flex;
			padding: 15rpx 30rpx;
			background-color: #1a1a1a;
			color: #fff;

			.name {
				font-size: 12px;
				margin-right: 20rpx;
			}

			.timelong {
				font-size: 12px;
				margin-right: 20rpx;
			}

			.size {
				font-size: 12px;
				margin-right: 20rpx;
			}

			.date {
				font-size: 12px;
			}
		}
	}

	// .clound-list {
	// display: flex;
	// flex-wrap: wrap;
	// justify-content: center;
	// background-color: #EBF5FF;

	.list_item {
		// width: 700rpx;
		// border: 1px solid #ccc;
		// border-radius: 8px;
		display: flex;
		flex-wrap: wrap;
		justify-content: space-between;

		// .title {
		// 	width: 100%;
		// 	display: flex;
		// 	justify-content: space-between;
		// 	padding: 15rpx 20rpx;
		// 	border-bottom: 1px solid #ccc;

		// 	.left {
		// 		font-weight: bold;
		// 		font-size: 16px;
		// 	}

		// 	.right {
		// 		color: #2979ff;
		// 		font-size: 16px;
		// 	}
		// }

		.player {
			// margin: 20rpx 12rpx 0 12rpx;
			width: 330rpx;
			display: flex;
			flex-wrap: wrap;

			.video {
				z-index: 0;
				margin-top: 20rpx;
				width: 330rpx;
				height: 250rpx;
			}

			.tips {
				width: 330rpx;
				display: flex;
				padding: 10rpx 20rpx;
				background-color: #1a1a1a;
				color: #fff;

				.name {
					font-size: 12px;
					margin-right: 20rpx;
				}

				.timelong {
					font-size: 12px;
				}
			}
		}
	}

	// }

	.local-list {
		display: flex;
		flex-wrap: wrap;
		justify-content: flex-start;
		background-color: #EBF5FF;
		height: 100%;

		.player {
			// margin: 20rpx 12rpx 0 12rpx;
			margin-top: 20rpx;
			margin-left: 30rpx;
			width: 330rpx;
			display: flex;
			flex-wrap: wrap;

			.video {
				z-index: 0;
				margin-top: 20rpx;
				width: 330rpx;
				height: 250rpx;
			}

			.tips {
				width: 330rpx;
				display: flex;
				padding: 10rpx 20rpx;
				background-color: #1a1a1a;
				color: #fff;

				.name {
					font-size: 12px;
					margin-right: 20rpx;
				}

				.timelong {
					font-size: 12px;
				}
			}

			// .action {
			// 	width: 650rpx;
			// 	display: flex;
			// 	justify-content: flex-start;

			// 	.btn {
			// 		width: 50%;
			// 	}
			// }
		}
	}

	// 筛选弹出层
	.screenWrap {
		margin: 100rpx 30rpx 0 30rpx;

		&__btn {
			position: fixed;
			bottom: 70rpx;
			left: 0;
			right: 0;
			width: 100%;
			margin: 0 auto;

			button {
				width: 40%;
			}
		}
	}
</style>