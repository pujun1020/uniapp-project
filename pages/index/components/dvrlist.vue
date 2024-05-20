<template>
	<view class="wrap" style="background-color: #EBF5FF;height: 100%;">
		<view style="width: 100%;height: 20rpx;background-color: #EBF5FF;"></view>
		<view v-if="wifiConnectionState&&equip" 
		style="display: flex;flex-direction: column;text-align: center;background-color: #EBF5FF;line-height:50rpx;">
			<text style="color: green;font-size: 28rpx;">当前已连接设备：【{{equip.apSN}}】</text>
			<text style="color: #ccc;">您可以点击查看视频，或长按更多操作~</text>
		</view>

		<view >
			<u-tabs :list="datelist" :is-scroll="true" :current="current" @change="change" bar-height="6" bar-width="80"></u-tabs>
			<view class="u-m-l-30 u-m-r-30">
				<!-- <u-collapse ref="collapse" :arrow="false" style="background-color: #EBF5FF;"> -->
					<view :title="video.date" v-for="(video, inx) in vieoListNew" :key="inx">
						<view class="list_item">
							<view v-for="(item,index) in video.vieoList" :key="index">
								<view class="player" style="position: relative;"  @longpress="longpress(item)" @click="videoDetail(item,index,inx)">
									<view v-show="item.locDownLoad" style="position: absolute;top:20rpx;left: 0; width:150rpx;height: 50rpx;line-height: 50rpx;background:green;text-align: center;
									font-size:24rpx;padding:2rpx 8rpx;z-index: 99;color: #fff;">
									本地已下载
									</view>
									<view  v-show="isBachtStatus" style="position: absolute;top: 20rpx;right: 0;width: 46rpx;height: 46rpx;z-index: 99;">
										<view style="border-radius: 50%;width: 46rpx;height: 46rpx;
										border:1px #087DFF solid;background-color: #fff;">
											<view v-show="item.checked" style="width: 40rpx;height: 40rpx;background-color: #087DFF;margin:3rpx auto;border-radius: 50%;"></view>
										</view>
									</view>
									
									<u-image class="video" :src="item.thumbUrl" width="100%" height="250"></u-image>
									<view class="tips">
										<view class="name">{{item.name}}</view>
										<view class="timelong">{{item.title}}</view>
									</view>
								</view>
							</view>
			
						</view>
			
					</view>
				<!-- </u-collapse> -->
			</view>
			<view style="width: 100%;height: 100rpx;background-color: #EBF5FF;"></view>
			
		</view>
		
		<view style="margin-top: 300rpx"  v-if="!wifiConnectionState">
			<u-empty text="未连接设备WIFI" mode="wifi"></u-empty>
			<button @tap="loadData()"
			style="background-color:#087DFF;color: #fff;margin-top: 30rpx;width: 310rpx;font-size: 30rpx;">点击连接设备</button>
		</view>
		
		<!-- 筛选弹出层 start -->
		<u-popup v-model="screenShow" mode="right" width="600">
			<view class="screenWrap">
				<!-- 标题 start -->
				<view class="u-font-34 u-font-weight">{{$getLang('筛选内容')}}</view>
				<!-- 标题 end -->
				<u-divider>{{$getLang('设备筛选')}}</u-divider>
				<view>
					<u-radio-group v-model="selectEquip" @change="radioGroupChange" wrap size="40">
						<u-radio @change="radioChange" v-for="(item, index) in filterEquipList" :key="index" :name="item.name"
							:disabled="item.disabled" class="u-m-t-40" label-size="36">
							<view class="u-m-l-30">{{item.name}}</view>
						</u-radio>
					</u-radio-group>
				</view>
				<u-divider>{{$getLang('录制方向')}}</u-divider>
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
					<u-input :placeholder="$getLang('请选择时间段')" disabled border @click="calendarShow = true"
						v-model="calendarValue" />
				</view>
				<!-- 日历筛选 end -->
				<view class="u-flex screenWrap__btn">
					<u-button shape="circle" @click="resetting">{{$getLang('重置')}}</u-button>
					<u-button type="primary" shape="circle">{{$getLang('确定')}}</u-button>
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
		
		<!-- 批量删除弹层 start -->
		<view v-if="isBachtStatus" style="position: fixed !important;top: 0px;left: 0;width: 100%;z-index: 9999;">
			<u-grid :col="2">
				
				<u-grid-item bg-color="#fff" @tap="delCancel()">
					<view class="grid-text">{{$getLang('取消')}}</view>
				</u-grid-item>
				<u-grid-item bg-color="#fff" @tap="delBacht()">
					<view class="grid-text" style="color: red;">{{$getLang('批量删除')}}</view>
				</u-grid-item>
				<!-- <u-grid-item bg-color="#fff" @tap="delBacht()">
					<view class="grid-text" style="color: #ccc;">{{$getLang('全部删除')}}</view>
				</u-grid-item> -->
			</u-grid>
		</view>
		<!-- button end -->
		
		<!-- 下载进度弹出层 start -->
		<u-popup v-model="uploadShow" mode="center" width="500" height="500" border-radius="14" :mask-close-able="false">
			<view class="u-m-l-30 u-m-r-30 u-m-t-25 u-m-b-30">
				<view class="u-text-center">
					<view class="u-font-34 u-font-weight">{{ uploadOrDownload }}</view>
					<view class="u-type-info u-font-24 u-m-t-10">{{ payUrlName }}</view>
					<view class="u-type-info u-font-24 u-m-t-30">{{ progressTxt }}</view>
				</view>
				
				<view style="margin-top: 30%;">
					<u-line-progress active-color="#2979ff" :percent="progressVal"></u-line-progress>
				</view>
			</view>
		</u-popup>
		<!-- button end -->
		
		<u-popup v-model="showWIFIConnOpt" mode="bottom" height="980" border-radius="14" :mask-close-able="false" zIndex="999">
			<view style="font-size: 30rpx;font-weight: bold;text-align: center;line-height: 80rpx;">
				设备连接步骤
			</view>
			
			<view style="font-size:26rpx;text-align: center;line-height: 80rpx;width: 90%;margin: auto;">
				如果您是首次连接或自动连接失败，请根据以下步骤操作！
			</view>
			<view v-show="showStep==1" style="width: 90%;margin:15rpx auto;min-height:300rpx;overflow:auto">
				<view>
					<view style="line-height: 44rpx;">第一步、打开仪表设备，将设备调节到以下苹果手机投屏界面</view>
					<image src="../../../static/yindao-1.png" mode="widthFix" style="width: 80%;margin: 20rpx 10%;"></image>
				</view>
			</view>
			<view v-show="showStep==2" style="width: 90%;margin:15rpx auto;min-height:300rpx;overflow:auto">
				<view>
					<view style="line-height: 44rpx;">第二步、进入手机WIFI列表界面，找到：<br>
					WIFI【{{ssid}}】  密码：【{{password}}】<br>
					进行手动连接。连接成功以后回到当前页面，点击下一步。如下图：</view>
					<image src="../../../static/yindao-2.png" mode="widthFix" style="width: 90%;margin-left: 5%;margin-top: 15rpx;"></image>
				</view>
			</view>
			<view style="width: 90%;margin: auto;text-align: center;" v-show="showStep==1">
				<u-button style="width: 310rpx;background-color:#087DFF;color: #fff;" @tap="showStepFun(1)">下一步</u-button>
			</view>
			<view style="width: 90%;margin: auto;text-align: center;" v-show="showStep==2">
				<u-button v-if="showStepNotUse" style="width: 310rpx;background-color:#087DFF;color: #fff;" @tap="showStepFun(2)">下一步</u-button>
			</view>
			
			<view style="width: 90%;margin:40rpx auto;text-align: center;">
				<u-button v-if="showStepNotUse" style="width: 310rpx;" @tap="showStepFun(3)">取消</u-button>
			</view>
		</u-popup>
	</view>
</template>

<script>
	import { connectStartWifi, openWebSocket } from '../../../common/wifi-tcp.js'
	import {connectWifi,getConnectedSSID,getConnectedSSIDNew,removeWifi,removeWifiBySSID} from '../../../common/cx-wifi/cx-wifi.js'
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
				vieoListNew:[],//按照时间排序分组
				
				
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
						name: this.$getLang('全部'),
						disabled: false
					},
					{
						name: this.$getLang('前录'),
						disabled: false
					},
					{
						name: this.$getLang('后录'),
						disabled: false
					}
				],
				value: '',
				// 日历筛选
				calendarShow: false,
				calendarValue: '',
				// 上传进度条
				uploadShow: false,
				uploadOrDownload: '',
				progressVal: 0,
				progressTxt: '',
				payUrlName:'',
				
				equip:null,
				isBachtStatus:false,
				
				showWIFIConnOpt:false,
				showStep:1,
				showStepNotUse:true,
				ssid:'',
				password:'',
				
				wifiConnectionState:false,
				
				datelist:[],
				
				current:0,
				showCollapseIndex:0,
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
	     created() {
			console.log('加载组件页面');
			//判断当前wifi是否连接状态并且是否视频列表为空，如果为空重新加载一次
			setTimeout(async()=>{
				var getCurSSID=await getConnectedSSIDNew();//当前的网络wifi
				const ssid = getApp().globalData.equip.apSN;//设备绑定的wifi
				const password = getApp().globalData.equip.apPassword
				//表示当前连接的WIFI是设备指定的WIFI
				if(`"${ssid}"`==getCurSSID&&this.vieoListNew.length==0&&getApp().globalData.equip&&Object.keys(getApp().globalData.equip).length!=0){
					// if(getApp().globalData.vieoListNew&&getApp().globalData.vieoListNew.length>0){
					// 	this.wifiConnectionState=true;
					// 	this.$emit('updateWifiConnectionState',true);
					// 	setTimeout(()=>{
					// 		this.vieoListNew=getApp().globalData.vieoListNew;
					// 		console.log('全局',getApp().globalData.datelist);
					// 		this.datelist=getApp().globalData.datelist;
					// 	},1000)
					// }else{
						setTimeout(()=>{
							this.getVideoNew();
						},1000);
					// }
				}else{
					this.wifiConnectionState=false;
					this.$emit('updateWifiConnectionState',false);
					this.vieoListNew==[];
					getApp().globalData.vieoListNew=[];
				}
			},10)
			
		},

		methods: {
			change(e){
				console.log(e)
				this.current=e;
				var date=this.datelist[e].name;
				var list=this.vieoListNew.filter((item,i)=>{
					return item.date==date;
				});
				if(list.length==0||list==null){
					this.loadVideo(date);
					
					this.showCollapseIndex=e;

				}
				
			},
			async getVideoNew(){
				this.equip= getApp().globalData.equip;
				let socketTask = getApp().globalData.socketTask
				if (!socketTask) {
					socketTask = await openWebSocket()
				}
				if(socketTask){
					// uni.showLoading({
					// 	title:'加载视频中...',
					// 	mask:true
					// })
					if(this.dateList.length==0){
						this.loadVideoFun(socketTask);
						this.showWIFIConnOpt=false;
					}
				}else{
					uni.showModal({
						title:'提示',
						content:'与设备服务连接时失败，检查是否将设备调节到以下苹果手机投屏界面',
						showCancel:false,
						confirmText:'确定',
						success:(res)=>{
							if(res.confirm){
								
							}
						}
						
					})
				}
			},
			
			async showStepFun(index){
				if(index==1){
					this.showStep=2;
				}
				if(index==2){
					var getCurSSID=await getConnectedSSIDNew();//当前的网络wifi
					const ssid = getApp().globalData.equip.apSN;//设备绑定的wifi
					const password = getApp().globalData.equip.apPassword
					// console.log('getCurSSID',getCurSSID)
					// console.log('ssid',ssid)
					//表示当前连接的WIFI是设备指定的WIFI
					if(`"${ssid}"`==getCurSSID){
						this.equip= getApp().globalData.equip;
						
						this.getVideoNew();
					}else{
						uni.showModal({
							title:'提示',
							content:'您当前连接的WIFI不正确，请切换为设备WIFI【'+ssid+'】,密码：【'+password+'】',
							showCancel:false,
							confirmText:'确定',
							success:(res)=>{
								if(res.confirm){
									
								}
							}
							
						})
					}
				}
				if(index==3){
					
					this.showWIFIConnOpt=false;
				}
			},
			// 长按事件 start
			longpress(item) {
				uni.showActionSheet({
					itemList: [this.$getLang('下载'), this.$getLang('删除'), this.$getLang('批量删除')],
					success: (res) => {
						console.log(item)
						if (res.tapIndex == 0) {
							this.uploadShow = true;
							this.uploadOrDownload =this.$getLang('正在下载')
							this.payUrlName=item.name;
							const downloadTask = uni.downloadFile({
								url: item.playUrl,
								success: (res) => {
									uni.saveFile({
										tempFilePath: res.tempFilePath,
										success: (fileRes) => {
											item.devSN=getApp().globalData.equip.sn;
											item.date=new Date();
											uni.setStorageSync(fileRes.savedFilePath, item)
											uni.showToast({
												title:this.$getLang('下载完成！') 
											})
											this.refreshVideoList(2,item.id);
											this.uploadShow = false
											
										},
										fail: (err) => {
											console.log('保存失败', err)
										}
									})
								}
							})
							downloadTask.onProgressUpdate(res => {
								this.progressVal = res.progress
								this.progressTxt = `${res.totalBytesWritten}/${res.totalBytesExpectedToWrite}`
							})
							
						} else if(res.tapIndex==1){
							let socketTask = getApp().globalData.socketTask
							if (socketTask) {
								uni.showModal({
									title: this.$getLang('提示'),
									content: this.$getLang('确认要删除当前视频吗'),
									cancelText:this.$getLang('取消'),
									confirmText:this.$getLang('确定'),
									success: (res) => {
										if (res.confirm) {
											var playUrlList=[item.playUrl];
											socketTask.send({
												data: '{ "METHOD":"FILE.DELETE", "exigency":true, "playUrlList":'+JSON.stringify(playUrlList)+'}'
											})
											socketTask.onMessage((res) => {
												var list=this.vieoListNew;
												
												var tempsList=[];
												for(var i=0;i<list.length;i++){
													var item1=list[i];
													var temp1=[];
													for(var k=0;k<item1.vieoList.length;k++){
														var item2=item1.vieoList[k];
														if(item2.id!=item.id){
															temp1.push(item2);
														}
													}
													item1.vieoList=temp1;
													if(item1.vieoList.length>0){
														tempsList.push(item1);
													}
												}
												this.vieoListNew=tempsList;
												uni.showToast({
													title: this.$getLang('删除成功'),
													icon: 'none'
												})
											});
										}
									}
								})
							}
						}else if(res.tapIndex==2){
							uni.showToast({
								title:'请选择要删除的视频文件',
								icon:'none'
							});
							this.isBachtStatus=true;
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
			//批量删除取消
			delCancel(){
				this.isBachtStatus=false;
			},
			async loadData() {
				this.ssid = getApp().globalData.equip.apSN;//设备绑定的wifi
				this.password = getApp().globalData.equip.apPassword;
				var getCurSSID=await getConnectedSSIDNew();//当前的网络wifi
				this.showStep=1;
				this.wifiConnectionState=false;
				uni.showLoading({
					title:'连接中...'
				})
				let socketTask = getApp().globalData.socketTask
				if (!socketTask) {
					if(`"${this.ssid}"`==getCurSSID){
						 socketTask = await openWebSocket()
						 if(socketTask){
						 	this.loadVideoFun(socketTask);
						 }
						 uni.hideLoading();
					}else{
						// getCurSSID=getCurSSID.replace('"','').replace('"','')
						console.log('当前断开的wifi',getCurSSID)
						// removeWifiBySSID(getCurSSID);
						
						setTimeout(async()=>{
							if (await connectStartWifi()) {
								this.equip=getApp().globalData.equip
								uni.showToast({
									title:'WIFI已连接!',
									icon:'success'
								})
							
								setTimeout(async()=>{
									socketTask = await openWebSocket()
									if(socketTask){
										this.loadVideoFun(socketTask);
									}
								},3000)
							}else{
								//如果连接失败，弹出指引如何连接设备
								uni.hideLoading();
								uni.showToast({
									title:'WIFI自动连接失败！',
									icon:'none'
								});
								this.showWIFIConnOpt=true;
							}
						},50)
						
					}
					
					
				}else{
					this.loadVideoFun(socketTask);
				}
				
			},
			loadVideoFun(socketTask){
				uni.showLoading({
					title:'加载视频中...',
					mask:true
				})
				
				this.wifiConnectionState=true;
				this.$emit('updateWifiConnectionState',true);
				
				// 本地视频
				var locVieoList = uni.getStorageInfoSync().keys.filter(k => k.includes('/uniapp_save/')).map(k => {
					return { ...uni.getStorageSync(k), playUrl: k }
				});
				// console.log('本地视频',locVieoList);
				
				this.vieoList=[];//清空数组
				this.vieoListNew=[];//清空数组
				socketTask.send({
					data: '{ "METHOD": "VIDEO.DATE", "previewType": "all" }'
				})
				socketTask.onMessage((res) => {
					const data = JSON.parse(res.data)
					if (data.METHOD === 'VIDEO.DATE' && data.code === 0) {
						if(this.datelist.length==0){
							const allDate = data.dateList
							this.allDate = allDate
							for(var i=0;i<allDate.length;i++){
								var date=allDate[i];
								this.datelist.push({'name':date});
							}
							getApp().globalData.datelist=this.datelist;
							this.loadVideo(allDate[0])
						}
					} else if (data.METHOD === 'VIDEO.INFO.LIST' && data.code === 0) {
						// console.log(data.videoBeanList)
						if(data.videoBeanList.length>0){
							for(var i=0;i<data.videoBeanList.length;i++){
								data.videoBeanList[i].checked=false; 
								data.videoBeanList[i].locDownLoad=false;
								if(locVieoList.length>0){
									for(var k=0;k<locVieoList.length;k++){
										var loc=locVieoList[k];
										if(loc.id==data.videoBeanList[i].id){
											data.videoBeanList[i].locDownLoad=true;
											// console.log('本地视频ID:',loc.id)
										}
									}
								}
							}
							var playUrl=data.videoBeanList[0].playUrl;
							var date=playUrl.split('-')[1].replace(/_/g, "-");
							var objVideo={date:date,vieoList:data.videoBeanList};
							// console.log(objVideo)
							this.vieoListNew=[objVideo];
							uni.hideLoading();
							getApp().globalData.vieoListNew=this.vieoListNew;
						}
						
					} else {
						console.error(data)
					}
					
				})
				
			},
			async loadVideo(date,opt) {
				const socketTask = getApp().globalData.socketTask;

				socketTask.send({
					data: `{ "METHOD": "VIDEO.INFO.LIST", "previewType": "all", "date": "${date}", "index": 0, "num": 99, "sort": "des", "time": "0-24" }`
				})
					// if(flag){
					// 	uni.showLoading({
					// 		title:'加载视频中...',
					// 		mask:true
					// 	})
					// 	this.wifiConnectionState=true;
					// 	this.$emit('updateWifiConnectionState',true);
					// 	var locVieoList = uni.getStorageInfoSync().keys.filter(k => k.includes('/uniapp_save/')).map(k => {
					// 		return { ...uni.getStorageSync(k), playUrl: k }
					// 	});
					// 	this.vieoList=[];//清空数组
					// 	this.vieoListNew=[];//清空数组
					// 	socketTask.onMessage((res) => {
					// 		const data = JSON.parse(res.data)
					// 		if (data.METHOD === 'VIDEO.DATE' && data.code === 0) {
					// 			if(this.datelist.length==0){
					// 				const allDate = data.dateList
					// 				this.allDate = allDate
					// 				for(var i=0;i<allDate.length;i++){
					// 					var date=allDate[i];
					// 					this.datelist.push({'name':date});
					// 				}
					// 				getApp().globalData.datelist=this.datelist;
					// 				this.loadVideo(allDate[0])
					// 			}
					// 		} else if (data.METHOD === 'VIDEO.INFO.LIST' && data.code === 0) {
					// 			// console.log(data.videoBeanList)
					// 			if(data.videoBeanList.length>0){
					// 				for(var i=0;i<data.videoBeanList.length;i++){
					// 					data.videoBeanList[i].checked=false; 
					// 					data.videoBeanList[i].locDownLoad=false;
					// 					if(locVieoList.length>0){
					// 						for(var k=0;k<locVieoList.length;k++){
					// 							var loc=locVieoList[k];
					// 							if(loc.id==data.videoBeanList[i].id){
					// 								data.videoBeanList[i].locDownLoad=true;
					// 								// console.log('本地视频ID:',loc.id)
					// 							}
					// 						}
					// 					}
					// 				}
					// 				var playUrl=data.videoBeanList[0].playUrl;
					// 				var date=playUrl.split('-')[1].replace(/_/g, "-");
					// 				var objVideo={date:date,vieoList:data.videoBeanList};
					// 				// console.log(objVideo)
					// 				this.vieoListNew=[objVideo];
					// 				uni.hideLoading();
					// 				getApp().globalData.vieoListNew=this.vieoListNew;
					// 			}
								
					// 		} else {
					// 			console.error(data)
					// 		}
							
					// 	})
					// }

				
				
			},
			// onUpload() {
			// 	console.log('点击了上传')
			// },
			// 视频详情
			videoDetail(item,index,inx) {
				if(this.isBachtStatus==true){
					this.$set(this.vieoListNew[inx].vieoList[index], 'checked', !item.checked);
				}else{
					
					uni.navigateTo({
						url: `/pages/home/home-videodetail?type=0&angle=${item.angle}&duration=${item.duration}&exigency=${item.exigency}&id=${item.id}&name=${item.name}&playUrl=${item.playUrl}&recordTime=${item.recordTime}&size=${item.size}&title=${item.title}&thumbUrl=${item.thumbUrl}`,
						events:{
							//获取下级页面传递回来的参数
							sonPageData:data=>{
								// console.log('接收返回的数据',data);
								var list=this.vieoListNew;
								var tempsList=[];
								for(var i=0;i<list.length;i++){
									var item1=list[i];
									var temp1=[];
									for(var k=0;k<item1.vieoList.length;k++){
										var item2=item1.vieoList[k];
										if(item2.id!=data.id){
											temp1.push(item2);
										}
									}
									item1.vieoList=temp1;
									if(item1.vieoList.length>0){
										tempsList.push(item1);
									}
								}
								this.vieoListNew=tempsList;
							}
						}

					})
				}
				
			},
			delBacht(){
				var list=this.vieoListNew;
				var temps=[];
				var ids=[];
				var newList=[];
				for(var i=0;i<list.length;i++){
					var item1=list[i];
					for(var k=0;k<item1.vieoList.length;k++){
						var item2=item1.vieoList[k];
						if(item2.checked){
							temps.push(item2.playUrl);
							ids.push(item2.id);
						}
					}
				}
				if(ids.length==0){
					uni.showToast({
						title:'请选择视频！',
						icon:'none'
					})
					return;
				}
				let socketTask = getApp().globalData.socketTask
				if (socketTask) {
					uni.showModal({
						title: this.$getLang('提示'),
						content: "是否确认把选中的视频批量删除，一旦删除将无法恢复哦？",
						cancelText:this.$getLang('取消'),
						confirmText:this.$getLang('确定'),
						success: (res) => {
							if (res.confirm) {
								// var playUrlList=[item.playUrl];
								socketTask.send({
									data: '{ "METHOD":"FILE.DELETE", "exigency":true, "playUrlList":'+JSON.stringify(temps)+'}'
								})
								socketTask.onMessage((res) => {
									for(var i=0;i<list.length;i++){
										var item1=list[i];
										var temp1=[];
										for(var k=0;k<item1.vieoList.length;k++){
											var item2=item1.vieoList[k];
											if(!item2.checked){
												temp1.push(item2);
											}
										}
										item1.vieoList=temp1;
										if(item1.vieoList.length>0){
											newList.push(item1);
										}
									}
									this.vieoListNew=newList;
									uni.showToast({
										title: this.$getLang('删除成功'),
										icon: 'none'
									})
									this.isBachtStatus=false;
								});
							}
						}
					})
				}
			},
			refreshVideoList(type,id){
				var list=this.vieoListNew;
				var newList=[];
				for(var i=0;i<list.length;i++){
					var item1=list[i];
					var temp1=[];
					for(var k=0;k<item1.vieoList.length;k++){
						var item2=item1.vieoList[k];
						//type==2当这两个id相等时，表示需要设置为已下载
						if(type==2 && item2.id==id){
							item2.locDownLoad=true;
						}
						temp1.push(item2);
					}
					item1.vieoList=temp1;
					if(item1.vieoList.length>0){
						newList.push(item1);
					}
				}
				this.vieoListNew=newList;
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
			// position: relative;
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