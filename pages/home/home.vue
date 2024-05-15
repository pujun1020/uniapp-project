<template>
	<view class="wrap">
		<!-- <u-navbar :is-back="false" :background="background" :border-bottom="false"></u-navbar> -->
		<u-gap height="88" bg-color="#EBF5FF"></u-gap>

		<view v-show="localChannel == '1'" class="wrap__head">
		<!-- 	<u-tabs :list="list" :is-scroll="false" :current="current" @change="tabsChange" bg-color="#EBF5FF"
				font-size="32" active-color="#1F252A" bar-width="67"></u-tabs> -->
			<view class="tabs">
					<view class="tabs-body">
						<view @tap="tabsChange(0)" class="tabs-item " :class="current==0?'tabs-active':''" style="margin-right:100rpx;">
							{{this.$getLang('云端')}}
							<view v-if="current==0" class="tabs-bar"></view>
						</view>
						<view @tap="tabsChange(1)" class="tabs-item " :class="current==1?'tabs-active':''">
							{{this.$getLang('本地')}}
							<view v-if="current==1" class="tabs-bar"></view>
						</view>
					</view>
			</view>
		</view>
		
		<!-- 搜索框 start -->
		<view class="u-m-l-30 u-m-r-30 u-m-t-30 u-flex">
			<u-search :placeholder="$getLang('视频名称')" :show-action='false' v-model="videoName" @search="loadCloundVideo()" @clear="loadCloundVideo()" bg-color="#fff"></u-search>
			<u-icon name="/static/index/bg-screen.png" size='40' class="u-m-l-30" @click="screen"></u-icon>
		</view>
		<!-- 搜索框 end -->

		<swiper :current="current" @change="swiperChange"  :style="{'height':winHeight+'px'}">
			<swiper-item class="swiper-item">
				<scroll-view scroll-y style="width: 100%;" :style="{'height':winHeight+'px'}">
					<view v-show="current === 0">
						<view v-show="cloundFirst.id" class="clound-swiper" @click="videoDetailClound(cloundFirst)">
							<u-image class="video" src="/static/cover_video.png" width="100%" height="400"></u-image>
							<view class="tips">
								<view class="name">{{ cloundFirst.name }}</view>
								<view class="timelong">{{ cloundFirst.totalTime }}</view>
								<view class="size">{{ byteToMb(cloundFirst.size) }}</view>
								<view class="date">{{ cloundFirst.date }}</view>
							</view>
						</view>
					
						<view class="u-m-l-30 u-m-r-30">
							<u-collapse :arrow="false">
								<u-collapse-item :title="item.time" v-for="(item, index) in cloudList" :key="index"
									:open="index == 0 ? true : false">
									<!-- <view class="clound-list"> -->
									<view class="list_item">
										<view v-for="(e,i) in cloudList[index].body" :key="i" @longpress="longpress">
											<!-- <view class="title">
												<view class="left">2024-02-27</view>
												<view class="right">展开</view>
											</view> -->
											<view class="player" @click="videoDetailClound(e)">
												<u-image class="video" src="/static/cover_video.png" width="100%" height="250"></u-image>
												<view class="tips">
													<view class="name">{{e.name}}</view>
													<view class="timelong">{{e.totalTime}}</view>
												</view>
											</view>
										</view>
										
										<view v-for="(e,i) in cloudList[index].body" :key="i" @longpress="longpress">

											<view class="player" @click="videoDetailClound(e)">
												<u-image class="video" src="/static/cover_video.png" width="100%" height="250"></u-image>
												<view class="tips">
													<view class="name">{{e.name}}</view>
													<view class="timelong">{{e.totalTime}}</view>
												</view>
											</view>
										</view>
										
									</view>
									<!-- </view> -->
								</u-collapse-item>
							</u-collapse>
						</view>
						<!-- <u-loadmore bg-color="rgb(240, 240, 240)" :status="loadStatus" @loadmore="addRandomData"></u-loadmore> -->
						<u-empty
							style="margin-top: 50px"
							v-if="localChannel != '1' || (!cloundFirst.id)"
							mode="data"
							:text="$getLang('无数据')"
						>
						</u-empty>
					</view>
					
				</scroll-view>
			</swiper-item>
			<swiper-item class="swiper-item">
				<scroll-view scroll-y style="width: 100%;" :style="{'height':winHeight+'px'}">
					<view v-if="vieoList.length>0" style="margin-top: 30rpx; display: flex;flex-direction: column;text-align: center;background-color: #EBF5FF;line-height:50rpx;">
						<text style="color: #ccc;">您可以点击查看视频，或长按更多操作~</text>
						<button @tap="delAllVideoList()"
						style="background-color:#087DFF;color: #fff;margin-top: 30rpx;width: 310rpx;font-size: 28rpx;">{{$getLang('一键清空缓存')}}</button>
					</view>
					<view v-show="current === 1">
						<view class="local-list">
							<!-- 模拟数据 start -->
							<view class="player" v-for="(item,index) in vieoList" :key="index" @longpress="longpress(item)"
								@click="videoDetail(item)">
								<u-image class="video" :src="item.thumbUrl" width="100%" height="250"></u-image>
								<view class="tips">
									<view class="name">{{ item.name }}</view>
									<!-- <view class="timelong">{{ item.date }}</view> -->
								</view>
							</view>
							<!-- 模拟数据 end -->
						</view>
					</view>
					<u-empty
						v-if="vieoList.length==0"
						mode="data"
						:text="$getLang('无本地视频')"
					>
					</u-empty>
				</scroll-view>
			</swiper-item>
		</swiper>

		
		
		<u-tabbar v-model="tabCurrent" :list="tablist" :mid-button="true" :border-top="false" active-color="#087DFF"
			@change="changes" mid-button-size="140" icon-size="50"></u-tabbar>

		<!-- 筛选弹出层 start -->
		<u-popup v-model="screenShow" mode="right" width="600">
			<view class="screenWrap">
				<!-- 标题 start -->
				<view class="u-font-34 u-font-weight">{{$getLang('筛选内容')}}</view>
				<!-- 标题 end -->
				<u-divider>{{$getLang('设备筛选')}}</u-divider>
				<view>
					<u-radio-group v-model="selectEquip" wrap size="40">
						<u-radio v-for="(item, index) in filterEquipList" :key="index" :name="item.value"
							:disabled="item.disabled" class="u-m-t-40" label-size="36">
							<view class="u-m-l-30">{{item.name}}({{item.value}})</view>
						</u-radio>
					</u-radio-group>
				</view>
				<u-divider>{{$getLang('录制方向')}}</u-divider>
				<!-- 分类 start -->
				<view>
					<u-radio-group v-model="cameraType" wrap size="40">
						<u-radio v-for="(item, index) in translate" :key="index" :name="item.value"
							:disabled="item.disabled" class="u-m-t-40" label-size="36">
							<view class="u-m-l-30">{{item.name}}</view>
						</u-radio>
					</u-radio-group>
				</view>
				<!-- 分类 end -->
				<u-divider>{{$getLang('录制日期')}}</u-divider>
				<!-- 日历筛选 start -->
				<view class="u-m-t-40">
					<u-input :placeholder="$getLang('请选择时间段')" disabled border @click="calendarShow = true"
						v-model="calendarValue" :closeable="true" />
				</view>
				<!-- 日历筛选 end -->
				<view class="u-flex screenWrap__btn">
					<u-button shape="circle" @click="resetting">{{$getLang('重置')}}</u-button>
					<u-button type="primary" @click="loadCloundVideo()" shape="circle">{{$getLang('确定')}}</u-button>
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
					<view class="u-font-34 u-font-weight">{{$getLang('视频名称')}}</view>
					<!-- <view class="u-type-info u-font-24 u-m-t-10">2024-3-22 17:15:00</view> -->
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
	import { byteToMb } from '@/common/unit.js'
	
	export default {
		data() {
			return {
				background: {
					background: "#F3F3F5"
				},
				tablist: [{
						iconPath: "/static/tabbar/menu_ls.png",
						selectedIconPath: "/static/tabbar/menu_ls_active.png",
						text: this.$getLang('在路上'),
						customIcon: false
					},
					{
						iconPath: "/static/tabbar/car_un.png",
						selectedIconPath: "/static/tabbar/car.png",
						text: '',
						midButton: true,
						customIcon: false,
					},
					{
						iconPath: "/static/tabbar/menu_my.png",
						selectedIconPath: "/static/tabbar/menu_my_active.png",
						text: this.$getLang('我的'),
						customIcon: false,
					}
				],
				tabCurrent: 0,
				keyword: '',
				loadStatus: 'loadmore',
				pageIndex: 1,
				pageSize: 5,
				allDate: [],
				dateList: [],
				cloudList: [],
				cloundFirst: {},
				vieoList: [],
				list: [{
					name: this.$getLang('云端')
				}, {
					name: this.$getLang('本地')
				}],
				current: 0,
				swiperCurrent: 0,
				current2: 0,
				// 视频名称搜索
				videoName: '',
				// 筛选弹出层
				screenShow: false,
				// 设备
				filterEquipList: [],
				selectEquip: '',
				// 分类
				translate: [{
						value: '',
						name:this.$getLang('全部'),
						disabled: false
					},
					{
						value: '0',
						name: this.$getLang('前录'),
						disabled: false
					},
					{
						value: '1',
						name:  this.$getLang('后录'),
						disabled: false
					}
				],
				cameraType: '',
				// 日历筛选
				calendarShow: false,
				calendarValue: '',
				startDate: '',
				endDate: '',
				// 上传进度条
				uploadShow: false,
				localChannel: '',
				
				winHeight:860,
			}
		},
		onLoad() {
			uni.getSystemInfo({
			  success: function(res) {
			    console.log('屏幕高度:', res.screenHeight);
			    console.log('窗口高度:', res.windowHeight);
				this.winHeight=res.windowHeight-300;
				console.log(this.winHeight)
			  }
			});
			
			this.loadEquipList();
			this.addRandomData();
			
			if(getApp().globalData.equip){
				console.log(getApp().globalData.equip)
				this.localChannel = getApp().globalData.equip.channel
				this.selectEquip=getApp().globalData.equip.sn
				this.loadData();
			}
			
			
			uni.getSavedFileList({
			  success: function(res) {
			    const videoFiles = res.fileList.filter(file => {
			      // 假设视频文件以.mp4结尾，根据实际情况调整
			      return file.filePath.endsWith('.mp4');
			    });
				console.log('videoFiles',videoFiles);
				
			    // 接下来可以遍历videoFiles进行删除操作
			  }
			});
			
		},
		onReachBottom() {
			// this.loadStatus = 'loading';
			// 模拟数据加载
			// this.dateList = this.allDate().slice(0, this.pageIndex * this.pageSize)
			// if (this.pageIndex * this.pageSize > this.allDate.length) {
			// 	this.pageIndex++
			// 	this.loadStatus = 'nomore'
			// } else {
			// 	this.loadStatus = 'loadmore'
			// }
		},
		methods: {
			swiperChange(e){
				this.tabsChange(e.target.current);
			},
			delAllVideoList:function(){
				uni.showModal({
					title:  this.$getLang('提示'),
					content:  this.$getLang('确认要删除当前视频吗？一旦删除将无法找回，请谨慎操作~'),
					cancelText:'取消',
					confirmText:'确定删除',
					success: (res) => {
						if (res.confirm) {
							uni.getSavedFileList({
							  success:(res)=> {
							    const videoFiles = res.fileList.filter(file => {
							      // 假设视频文件以.mp4结尾，根据实际情况调整
							      return file.filePath.endsWith('.mp4');
							    });
								videoFiles.filter((item)=>{
									uni.removeStorageSync(item.filePath);
									return true;
								})
								console.log('videoFiles',videoFiles);
								this.vieoList =[];
								uni.showToast({
									title:'清理完成！'
								})
							  }
							});
						}
					}
				});
			},
			// 长按事件 start
			longpress(item) {
				uni.showActionSheet({
					itemList: [this.$getLang('上传') , this.$getLang('删除')],
					success: (res) => {
						if (res.tapIndex == 0) {
							this.uploadShow = true;
						} else {
							uni.showModal({
								title:  this.$getLang('提示'),
								content:  this.$getLang('确认要删除当前视频吗'),
								success: (res) => {
									if (res.confirm) {
										var fileUrl=item.playUrl;
										uni.removeSavedFile({
											filePath: fileUrl,
											success: ()=> {
											  uni.showToast({
											  	title:'删除成功！'
											  })
											  this.vieoList =this.vieoList.filter((vieo)=>{
												  return vieo.id!=item.id;
											  });
											  uni.removeStorageSync(fileUrl);
											},
											fail:()=> {
												uni.showToast({
													title:'删除失败！',
													icon:'none'
												})
											}
										});
										
										uni.showToast({
											title:  this.$getLang('删除成功'),
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
				this.startDate = param.startDate
				this.endDate = param.endDate
			},
			// 日历选择触发 end
			// 重置 start
			resetting() {
				this.selectEquip = '';
				this.cameraType = '';
				this.calendarValue = '';
				this.startDate = '';
				this.endDate = '';
				this.loadCloundVideo();
				this.screenShow = false;
			},
			tabsChange(index) {
				this.current = index;
				this.loadData()
			},
			// swiper-item左右移动，通知tabs的滑块跟随移动
			transition(e) {
				let dx = e.detail.dx;
				this.$refs.uTabs.setDx(dx);
			},
			// 由于swiper的内部机制问题，快速切换swiper不会触发dx的连续变化，需要在结束时重置状态
			// swiper滑动结束，分别设置tabs和swiper的状态
			animationfinish(e) {
				let current = e.detail.current;
				this.$refs.uTabs.setFinishCurrent(current);
				this.swiperCurrent = current;
				this.current = current;
			},
			sectionChange(index) {
				this.current2 = index;
			},
			loadEquipList() {
				this.$u.api.getEquipList({ userId: getApp().globalData.user.id })
					.then(res => {
						if (res.code === 0) {
							console.log('filterEquipList',res.data)
							this.filterEquipList = res.data.map(d => {
								return { value: d.sn, name: d.abbreviation, disabled: false }
							})
						}
					})
			},
			loadData() {
				if (this.current === 1) {
					// 本地视频
					this.vieoList = uni.getStorageInfoSync().keys.filter(k => k.includes('/uniapp_save/')).map(k => {
						return { ...uni.getStorageSync(k), playUrl: k }
					})
					console.log('本地视频列表',this.vieoList)
				} else {
					// 云端视频
					this.loadCloundVideo()
				}
			},
			loadCloundVideo() {
				this.screenShow = false;
				this.$u.api.getCloundVideoList({ page: 1, size: 999, name: this.videoName, devSN: this.selectEquip, cameraType: this.cameraType, sdate: this.startDate, edate: this.endDate })
					.then(res => {
						if (res.code === 0) {
							if (res.data.length > 0) {
								console.log('getCloundVideoList',res.data)
								this.cloundFirst = res.data[0]
								const data = res.data.slice(1)
								this.cloudList = data.reduce((result, curren) => {
									const datekey = curren.date.substr(0, 10) // 2024-xx-xx
									const findItem = result.find(d => d.time === datekey)
									if (findItem) {
										findItem.body.push(curren)
									} else {
										result.push({ time: datekey, body: [curren] })
									}
									return result
								}, [])
							}
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
			addRandomData() {
				for (let i = 0; i < 10; i++) {
					let index = this.$u.random(0, this.list.length - 1);
					// 先转成字符串再转成对象，避免数组对象引用导致数据混乱
					let item = JSON.parse(JSON.stringify(this.list[index]))
					item.id = this.$u.guid();
					this.dateList.push(item);
				}
			},
			changes(index) {
				if (index == 1) {
					uni.navigateTo({
						url: "/pages/index/index",
						animationType: "fade-in"
					})
				} else if (index == 1) {
					uni.navigateTo({
						url: "/pages/theroad/videolist",
						animationType: "fade-in"
					})
				} else if (index == 2) {
					uni.navigateTo({
						url: "/pages/my/my",
						animationType: "fade-in"
					})
				}
			},
			byteToMb(size) {
				return byteToMb(size)
			},
			// onUpload() {
			// 	console.log('点击了上传')
			// },
			// 视频详情
			videoDetail(item) {
				uni.navigateTo({
					url: `/pages/home/home-videodetail?type=1&angle=${item.angle}&duration=${item.duration}&exigency=${item.exigency}&id=${item.id}&name=${item.name}&playUrl=${item.playUrl}&recordTime=${item.recordTime}&size=${item.size}&title=${item.title}&thumbUrl=${item.thumbUrl}`,
					events:{
						//获取下级页面传递回来的参数
						sonPageData:data=>{
							this.vieoList =this.vieoList.filter((vieo)=>{
								return vieo.id!=data.id;
							});
						}
					}
				})
			},
			videoDetailClound(item) {
				uni.navigateTo({
					url: `/pages/home/home-videodetail?type=2&id=${item.id}&name=${item.name}&playUrl=${item.path}&size=${byteToMb(item.size)}&duration=${item.totalTime}&devSN=${item.devSN}`,
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
<style>
	.tabs{
		background-color: #EBF5FF;width: 100%;height: 60rpx;
	}
	.tabs-body{
		width: 300rpx;height:50rpx; margin: auto;display: flex;flex-direction:row;
	}
	.tabs-item{
		width: 100rpx;text-align: center;position: relative;line-height: 50rpx;font-size: 32rpx;
	}
	.tabs-active{
		color: #1F252A;font-weight: bold;
		
	}
	.tabs-bar{
		position: absolute;bottom: -6rpxrpx;left: 23rpx; width:54rpx;height: 6rpx;background-color: #1F252A;border-radius: 2rpx;
	}
</style>