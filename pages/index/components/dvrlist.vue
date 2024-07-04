<template>
	<view class="wrap" style="background-color: #EBF5FF;height: 100%;">
		<view style="width: 100%;height: 20rpx;background-color: #EBF5FF;"></view>
		<view v-if="wifiConnectionState&&equip" 
		style="display: flex;flex-direction: column;text-align: center;background-color: #EBF5FF;line-height:50rpx;">
			<text style="color: green;font-size: 28rpx;">当前已连接设备：【{{equip.apSN}}】</text>
			<!-- <text style="color: #ccc;">您可以点击查看视频，或长按更多操作~</text> -->
		</view>

		<view >
			<!-- <view style="display: flex;flex-direction: row;"> -->
			<view style="width: 100%;background-color: #fff;display: flex;">
				<view style="width:67%;">
					<u-tabs :list="datelist" :is-scroll="true" :current="current" @change="change" bar-height="6" bar-width="80"></u-tabs>
				</view>
				<view v-if="datelist.length>0" class="u-flex">
					<view  style="width:300rpx;">
						<u-dropdown ref="uDropdown">
							<u-dropdown-item v-model="cameraType" :title="dropValTitle2" @change="selectTranslate" :options="translate"></u-dropdown-item>
						</u-dropdown>
					</view>
				</view>
			</view>
			
				
				
				
			<!-- </view> -->
			
			<view class="u-m-l-30 u-m-r-30">
				<!-- <u-collapse ref="collapse" :arrow="false" style="background-color: #EBF5FF;"> -->
					<view :title="video.date" v-for="(video, inx) in vieoListNew" :key="inx">
						<view class="list_item">
							<view v-for="(item,index) in video.vieoList" :key="index">
								<view class="player" style="position: relative;" @click="videoDetail(item,index,inx)"   @touchstart="touchstart(item)" @touchend="touchend(item)">
									<view v-show="item.locDownLoad" style="position: absolute;top:20rpx;left: 0; width:150rpx;height: 50rpx;line-height: 50rpx;background:green;text-align: center;
									font-size:24rpx;padding:2rpx 8rpx;z-index: 1;color: #fff;">
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
										<!-- <view class="name">{{item.name}}</view> -->
										<view class="timelong">{{item.title}}</view>
									</view>
								</view>
							</view>
			
						</view>
			
					</view>
				<!-- </u-collapse> -->
			</view>
			
			<view v-if="wifiConnectionState" style="width: 100%;margin:50rpx auto;text-align: center;"><text style="color: #ccc;">您可以点击查看视频，或长按更多操作~</text></view>
			<view style="width: 100%;height: 100rpx;background-color: #EBF5FF;"></view>
			
		</view>
		
		<view style="margin-top: 300rpx"  v-if="!wifiConnectionState">
			<u-empty text="未连接设备WIFI" mode="wifi"></u-empty>
			<button @tap="loadData()"
			style="background-color:#087DFF;color: #fff;margin-top: 30rpx;width: 310rpx;font-size: 30rpx;">点击连接设备</button>
		</view>
		
		
		
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
		<view v-if="isBachtStatus" style="position: fixed !important;bottom: 20px;left: 0;width: 100%;z-index: 9999;">
			<u-grid :col="3">
				
				<u-grid-item bg-color="#fff" @tap="delCancel()">
					<view class="grid-text">{{$getLang('取消')}}</view>
				</u-grid-item>
				<u-grid-item bg-color="#fff" @tap="delBacht(0)">
					<view class="grid-text" style="color: red;">{{$getLang('删除选中')}}</view>
				</u-grid-item>
				<u-grid-item bg-color="#fff" @tap="delBacht(1)">
					<view class="grid-text" style="color: red;">{{$getLang('删除当日')}}</view>
				</u-grid-item>
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
			
			<view style="font-size:26rpx;text-align: center;line-height:40rpx;width: 90%;margin: auto;">
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
		<view class="float-button bounce-enter-active" style="bottom: 170rpx;" v-if="vieoListNew&&vieoListNew.length>0" @tap="reloadList">
			<text style="padding-top: 4rpx;"><u-icon name="reload"></u-icon></text>
			<text style="font-size: 24rpx;">刷新</text>
		</view>
		<view class="float-button bounce-enter-active" style="background-color: red;padding-top:6rpx;" v-if="vieoListNew&&vieoListNew.length>0" @tap="delAllDvrList">
			<text style="padding-top:10rpx;font-size: 24rpx;">全部</text>
			<text style="font-size: 24rpx;">清空</text>
		</view>
	</view>
</template>

<script>
	import { connectStartWifi, openWebSocket } from '../../../common/wifi-tcp.js'
	import {connectWifi,getConnectedSSID,getConnectedSSIDNew,removeWifi,removeWifiBySSID} from '../../../common/cx-wifi/cx-wifi.js'
	
	import { verfyDownLoad } from '../../../common/common.js'
	
	export default {
		components: {

		},
		data() {
			return {
				//连接wifi参数
				wifiManager: null,
				WifiConfiguration: null,
				wifis: null,
				nowWifiInfo: null,
				wifiArray: [],
				ArrayList: null,
				
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
				colors: '#087DFF',
				
				selectEquip: '',
				// 分类
				translate: [
					{
						value: '',
						label:this.$getLang('全部'),
						checked: false
					},
					{
						value: '0',
						label: this.$getLang('前录'),
						checked: false
					},
					{
						value: '1',
						label:  this.$getLang('后录'),
						checked: false
					}
				],
				cameraType: '',
				dropValTitle2:this.$getLang("录制方向"),
				
				value: '',
				
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
				
				//是否长按事件
				islongPress:false,
				timer:null,//长按计时器
			}
		},
		onReachBottom() {
		
			console.log('下拉刷新')
		},
	     created() {
			// console.log('加载组件页面');
			//判断当前wifi是否连接状态并且是否视频列表为空，如果为空重新加载一次
			setTimeout(async()=>{
				var getCurSSID=await getConnectedSSIDNew();//当前的网络wifi
				const ssid = getApp().globalData.equip.apSN;//设备绑定的wifi
				const password = getApp().globalData.equip.apPassword
				//表示当前连接的WIFI是设备指定的WIFI
				this.wifiConnectionState=false;
				this.$emit('updateWifiConnectionState',false);
				this.vieoListNew==[];
				getApp().globalData.vieoListNew=[];
				
				// this.connectWifiNew(ssid,password);
			},10)
			
		},

		methods: {
			selectTranslate(e){
				console.log(e)
				if(e==''){
					this.dropValTitle2=this.$getLang("录制方向") ;
				}else if(e==0){
					this.dropValTitle2=this.$getLang("前录") ;
				}else if(e==1){
					this.dropValTitle2=this.$getLang("后录") ;
				}
				this.cameraType=e;
				var date=this.datelist[this.current].name;
				this.loadVideo(date);
				// this.getVideoNew();
			},
			//刷新
			reloadList(){
				var date=this.datelist[this.current].name;
				console.log(date);
				uni.showLoading({
					title:this.$getLang('加载中')
				})
				this.loadVideo(date);
				setTimeout(()=>{
					uni.hideLoading();
				},1500);
			},
			change(e){
				var item=e
				this.current=e;
				var date=this.datelist[e].name;
				var list=this.vieoListNew.filter((item,i)=>{
					return item.date==date;
				});
				// console.log('点击了日期',date)
				this.loadVideo(date);
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
							content:'您当前连接的WIFI不正确，请切换为设备WIFI【'+ssid+'】,密码：【'+password+'】，提示：密码已复制，可直接粘贴密码',
							showCancel:false,
							confirmText:'确定',
							success:(res)=>{
								if(res.confirm){
									
								}
							}
							
						})
						
						uni.setClipboardData({
							data:password,
							success() {
								
							}
						})
					}
				}
				if(index==3){
					
					this.showWIFIConnOpt=false;
				}
			},
			//手指触摸动作开始
			touchstart(item){
				this.timer = setTimeout(()=>{
					this.longpress(item);
				},800)
			},
			//手指触摸动作结束
			touchend(){
				//延时执行为了防止 click() 还未判断 islongPress 的值就被置为 fasle
				clearTimeout(this.timer);
				setTimeout(() => {
					this.islongPress = false
				}, 200)
			},
			// 长按事件 start
			longpress(item) {
				uni.showActionSheet({
					itemList: [this.$getLang('下载当前视频'), this.$getLang('删除此视频'), this.$getLang('批量删除视频'), this.$getLang('删除所有DVR视频')],
					success: async(res) => {
						// console.log(item)
						if (res.tapIndex == 0) {
							var verfyDown=await verfyDownLoad(this,item.id);
							if(verfyDown){
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
								
							}
							
						} else if(res.tapIndex==1){
							let socketTask = getApp().globalData.socketTask;
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
										}
									}
								})
							}
						}else if(res.tapIndex==2){
							uni.showToast({
								title:this.$getLang('请选择要删除的视频文件'),
								icon:'none'
							});
							this.isBachtStatus=true;
						}else if(res.tapIndex==3){
							this.delAllDvrList();
						}
					},
					fail: function(res) {
						console.log(res.errMsg);
					}
				});
			},
			delAllDvrList(){
				let socketTask = getApp().globalData.socketTask;
				if(socketTask){
					uni.showModal({
						title: this.$getLang('提示'),
						content:this.$getLang("是否确认一键删除设备所有视频，一旦删除将无法恢复哦"),
						cancelText:this.$getLang('取消'),
						confirmText:this.$getLang('确定'),
						success: (res) => {
							if(res.confirm){
								socketTask.send({
									data: '{ "METHOD":"VIDEO.DELETE.ALL", "exigency":true}'
								})
							}
						},
					});
				}
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
				
				let socketTask = getApp().globalData.socketTask;
				uni.showLoading({
					title:this.$getLang('连接中...'),
					mask:true
				})
				if (!socketTask) {
					if(`"${this.ssid}"`==getCurSSID){
						 socketTask = await openWebSocket()
						 if(socketTask){
						 	this.loadVideoFun(socketTask);
						 }
						 uni.hideLoading();
					}else{
						setTimeout(async()=>{
							var platform = uni.getStorageSync('platform');
							// console.log(platform)
							if(platform=="android"){
								if (await this.connectWifiNew()) {
									this.equip=getApp().globalData.equip
									uni.showToast({
										title:this.$getLang('WIFI已连接'),
										icon:'success'
									})
								
									setTimeout(async()=>{
										socketTask = await openWebSocket()
										if(socketTask){
											 getApp().globalData.socketTask=socketTask;
											this.loadVideoFun(socketTask);
										}
									},2000)
								}else{
									//如果连接失败，弹出指引如何连接设备
									uni.hideLoading();
									this.showWIFIConnOpt=true;
								}
							}else{
								if (await connectStartWifi()) {
									this.equip=getApp().globalData.equip
									uni.showToast({
										title:this.$getLang('WIFI已连接'),
										icon:'success'
									})
								
									setTimeout(async()=>{
										socketTask = await openWebSocket()
										if(socketTask){
											 getApp().globalData.socketTask=socketTask;
											this.loadVideoFun(socketTask);
										}
									},3000)
								}else{
									//如果连接失败，弹出指引如何连接设备
									uni.hideLoading();
									// uni.showToast({
									// 	title:'WIFI自动连接失败！',
									// 	icon:'none'
									// });
									this.showWIFIConnOpt=true;
								}
							}
						},50)
					}
				}else{
					this.loadVideoFun(socketTask);
				}
				
			},
			loadVideoFun(socketTask){
				uni.showLoading({
					title:this.$getLang('加载中'),
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
				this.vieoList=[];
				socketTask.send({
					data: '{ "METHOD": "VIDEO.DATE", "previewType": "all" }'
				})
				socketTask.onMessage((res) => {
					const data = JSON.parse(res.data)
					// console.log('回传数据',data)
					if (data.METHOD === 'VIDEO.DATE' && data.code === 0) {
						this.datelist=[];
						const allDate = data.dateList
						this.allDate = allDate
						for(var i=0;i<allDate.length;i++){
							var date=allDate[i];
							this.datelist.push({'name':date});
						}
						
						getApp().globalData.datelist=this.datelist;
						this.loadVideo(allDate[0])
						
					} else if(data.METHOD === 'VIDEO.INFO.LIST' && data.code === 0) {
						console.log('videoBeanList',data.videoBeanList)
						var videoBeanList=data.videoBeanList;
						var date='';
						if(videoBeanList.length>0){
							var temps=[];
							for(var i=0;i<videoBeanList.length;i++){
								var item=videoBeanList[i];
								if(i==0){
									date=item.playUrl.split('-')[1].replace(/_/g, "-");
								}
								item.checked=false; 
								item.locDownLoad=false;
								if(locVieoList.length>0){
									for(var k=0;k<locVieoList.length;k++){
										var loc=locVieoList[k];
										if(loc.id==item.id){
											item.locDownLoad=true;
										}
									}
								}
								// console.log('cameraType',this.cameraType)
								if(this.cameraType){
									if(this.cameraType==0&&item.angle=="front"){
										temps.push(item)
									}
									if(this.cameraType==1&&item.angle!="front"){
										temps.push(item)
									}
								}else{
									temps.push(item)
								}
							}
							videoBeanList=temps;

							var objVideo={date:date,vieoList:videoBeanList};
							this.vieoListNew=[objVideo];
							this.vieoList=[objVideo];
							uni.hideLoading();
							getApp().globalData.vieoListNew=this.vieoListNew;
						}
						
					} else if(data.METHOD === 'FILE.DELETE' && data.code === 0){
						var date=this.datelist[this.current].name;
						this.loadVideo(date);
						this.isBachtStatus=false;
						uni.showToast({
							title:this.$getLang('删除成功')
						})
					} else if(data.METHOD === 'VIDEO.DELETE' && data.code === 0 ){
						this.current=0;
						this.getVideoNew();
						this.isBachtStatus=false;
						uni.showToast({
							title:this.$getLang('删除成功')
						})
					} else if(data.METHOD==='VIDEO.DELETE.ALL'&& data.code === 0){
						uni.showToast({
							title:this.$getLang('删除成功')
						})
						this.current=0;
						this.isBachtStatus=false;
						getApp().globalData.datelist=[];
						this.datelist=[];
						this.vieoListNew=[];
						this.vieoList=[];
						uni.hideLoading();
					}
					else if(data.METHOD==='CONNECT'&& data.code === 0){
						// uni.showToast({
						// 	title:'已连接！'
						// })
						console.log('METHOD CONNECT')
					}else{
						console.error('加载视频对象socketTask返回待处理',data)
					}
				})
				
			},
			async loadVideo(date,opt) {
				// console.log(date)
				const socketTask = getApp().globalData.socketTask;
				// console.log(socketTask);
				socketTask.send({
					data: `{ "METHOD": "VIDEO.INFO.LIST", "previewType": "all", "date": "${date}", "index": 0, "num": 99, "sort": "des", "time": "0-24" }`
				})
			},
			// 视频详情
			videoDetail(item,index,inx) {
				if(this.isBachtStatus==true){
					this.$set(this.vieoListNew[inx].vieoList[index], 'checked', !item.checked);
				}else{
					var obj={time:this.vieoListNew[0].date,body:this.vieoListNew[0].vieoList};

					getApp().globalData.curVideoGroup=obj;//把这个集合保存到全局变量
					uni.navigateTo({
						url: `/pages/home/home-videodetail?type=0&angle=${item.angle}&duration=${item.duration}&exigency=${item.exigency}&id=${item.id}&name=${item.name}&playUrl=${item.playUrl}&recordTime=${item.recordTime}&size=${item.size}&title=${item.title}&thumbUrl=${item.thumbUrl}`,
						events:{
							//获取下级页面传递回来的参数
							sonPageData:data=>{
								this.reloadList();
							}
						}

					})
				}
				
			},
			async delBacht(opt){
				//按照日期批量删除
				var list=this.vieoListNew;
				var temps=[];
				var ids=[];
				var newList=[];
				for(var i=0;i<list.length;i++){
					var item1=list[i];
					for(var k=0;k<item1.vieoList.length;k++){
						var item2=item1.vieoList[k];
						if(opt==1){
							item2.checked=true;
						}
						if(item2.checked){
							temps.push(item2.playUrl);
							ids.push(item2.id);
						}
					}
				}
				
				var socketTask =getApp().globalData.socketTask
				if(opt==1){
					var date = this.datelist[this.current].name;
					var temps=[];
					temps.push(date);
					if (socketTask) {
						uni.showModal({
							title: this.$getLang('提示'),
							content: this.$getLang('是否确认')+"【"+date+"】"+this.$getLang('视频全部删除，一旦删除将无法恢复哦'),
							cancelText:this.$getLang('取消'),
							confirmText:this.$getLang('确定'),
							success: (res) => {
								if(res.confirm){
									socketTask.send({
										data: '{ "METHOD":"VIDEO.DELETE", "exigency":true, "dateList":'+JSON.stringify(temps)+'}'
									})
								}
							},
						})
					}
					return;
				}
				
				if(ids.length==0){
					uni.showToast({
						title:this.$getLang('请选择视频'),
						icon:'none'
					})
					return;
				}
				uni.showModal({
					title: this.$getLang('提示'),
					content: this.$getLang('是否确认把选中的视频批量删除，一旦删除将无法恢复哦'),
					cancelText:this.$getLang('取消'),
					confirmText:this.$getLang('确定'),
					success: (res) => {
						if (res.confirm) {
							// console.log(temps)
							socketTask.send({
								data: '{ "METHOD":"FILE.DELETE", "exigency":true, "playUrlList":'+JSON.stringify(temps)+'}'
							})
						}
					}
				})
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
			},
			connectWifiNew(){
				return new Promise((resolve, reject) => {
					var ssid = getApp().globalData.equip.apSN;//设备绑定的wifi
					var pwd = getApp().globalData.equip.apPassword;
					
					const MainActivity = plus.android.runtimeMainActivity()
					const Context = plus.android.importClass("android.content.Context");
					plus.android.importClass("android.net.wifi.WifiManager");
					plus.android.importClass("java.util.List");
					this.ArrayList = plus.android.importClass("java.util.ArrayList");
					plus.android.importClass("android.net.wifi.ScanResult");
					plus.android.importClass("android.net.wifi.WifiInfo");
					plus.android.importClass("java.util.BitSet");
					this.WifiConfiguration = plus.android.importClass("android.net.wifi.WifiConfiguration");
					this.wifiManager = MainActivity.getSystemService(Context.WIFI_SERVICE)
					
					setTimeout(async()=>{
						var openWifiStatus = await this.androidOpenWifi();
						if(openWifiStatus){
							//搜索当前wifi
							var wifiInfo=await this.getWifiList(ssid);
							if(wifiInfo){
								this.connectNew(wifiInfo.name,pwd,wifiInfo.bssid,wifiInfo.sindex);
								let index = 0
								const interval = setInterval(async() => {
									const curSSID =await getConnectedSSIDNew()
									if (index > 10) {
										// console.log('wifi连接失败')
										clearInterval(interval)
										resolve(false);
									}
									if(`"${ssid}"`== curSSID) {
										// console.log('wifi连接成功')
										clearInterval(interval)
										resolve(true);
									} else {
										index++
									}
								}, 1000)
							}else{
								resolve(false);
							}
						}else{
							resolve(false);
						}
					},10)
				});
			},
			androidOpenWifi() {
				return new Promise((resolve, reject) => {
				  let bRet = false;
				  const wifiManager = this.wifiManager
				  if (!wifiManager.isWifiEnabled()) {
					bRet = wifiManager.setWifiEnabled(true); //返回自动打开的结果
					// console.log("打开wifi的返回结果是" + bRet)
				  } else {
					bRet = true;
					// console.log("wifi原本已经打开")
				  }
				  resolve(bRet);
			  });
			},
			getWifiList(ssid){
				return new Promise((resolve, reject) => {
					const resultList = this.wifiManager.getScanResults()
					this.wifis = resultList
					const len = resultList.size()
					let wifiArray = []
					for (let i = 0; i < len; i++) {
					  // console.log(resultList.get(i).toString())
					  const oneWiFi = {
					    sindex: i,
					    name: resultList.get(i).plusGetAttribute('SSID'),
					    bssid: resultList.get(i).plusGetAttribute('BSSID'),
					    signal: resultList.get(i).plusGetAttribute('level')
					  }
					  if(oneWiFi.name==ssid){
						  resolve(oneWiFi);
					  }
					  wifiArray.push(oneWiFi);
					}
					this.wifiArray = wifiArray;
					 resolve(null);
					// console.log('获取wifi列表',this.wifiArray)
					
				});
			},
			// 连接新的WiFi
			connectNew(ssid, pwd, BSSID, index) {
			  // uni.onNetworkStatusChange(function (res) {
			  //   console.log(res.isConnected);
			  //   console.log(res.networkType);
			  // });
			  // console.log('wifi账号密码：',{ssid, pwd})
			  const wifiManager = this.wifiManager
			  var wifiConfig = this.androidCreateWifiInfo(ssid, pwd, 'wpa', BSSID);
			  if (wifiConfig == null) {
			    // console.log("wifiConfig is null!")
			    return;
			  }
			  //WifiConfiguration
			  const tempConfig = this.isExsitsAndroid(ssid)
			  if (tempConfig != null) {
			    console.log("删除原来连接的wifi" + tempConfig);
			    wifiManager.removeNetwork(tempConfig.plusGetAttribute('networkId'));
			  }
			  // console.log("要连接的新的wifi配置：" + wifiConfig)
			  // console.log("要连接的新的wifi配置：", wifiConfig)
			  const netID = wifiManager.addNetwork(wifiConfig);
			  // console.log(netID);
			  //boolean
			  const enabled = wifiManager.enableNetwork(netID, true);
			  // console.log("enableNetwork status enable=" + enabled)
			  // boolean
			  const connected = wifiManager.reconnect();
			  // console.log("enableNetwork connected=" + connected)
			
			},
			// 创建新的WiFi信息
			androidCreateWifiInfo(SSID, Password, Type, BSSID) {
			  // console.log(SSID, Password, Type)
			  const WifiConfiguration = this.WifiConfiguration;
			  let config = new WifiConfiguration();
			  config.plusGetAttribute('allowedAuthAlgorithms').clear();
			  config.plusGetAttribute('allowedGroupCiphers').clear();
			  config.plusGetAttribute('allowedKeyManagement').clear();
			  config.plusGetAttribute('allowedPairwiseCiphers').clear();
			  config.plusGetAttribute('allowedProtocols').clear();
			  config.plusSetAttribute('SSID', '"' + SSID + '"');
			  // config.plusSetAttribute('BSSID', '"' + BSSID + '"');
			  // nopass
			  if (Type === "nopass") {
			    config.plusSetAttribute('preSharedKey', "");
			    config.plusGetAttribute('allowedKeyManagement').set(WifiConfiguration.KeyMgmt.NONE);
			    config.plusSetAttribute('wepTxKeyIndex', 0);
			  }
			  // wep
			  if (Type === "wep") {
			    if (!Password !== "") {
			      if (isHexWepKey(Password)) {
			        config.plusSetAttribute('preSharedKey', Password);
			      } else {
			        config.plusSetAttribute('preSharedKey', "\"" + Password + "\"");
			      }
			    }
			    config.allowedAuthAlgorithms.set(AuthAlgorithm.OPEN);
			    config.allowedAuthAlgorithms.set(AuthAlgorithm.SHARED);
			    config.allowedKeyManagement.set(KeyMgmt.NONE);
			    config.plusSetAttribute('wepTxKeyIndex', 0);
			  }
			  // wpa
			  if (Type === "wpa") {
			    // config.plusSetAttribute('preSharedKey', "\"" + Password + "\"");
			    config.plusSetAttribute('preSharedKey', '"' + Password + '"');
			    config.plusSetAttribute('hiddenSSID', true);
			    config.plusGetAttribute('allowedAuthAlgorithms').set(WifiConfiguration.AuthAlgorithm.OPEN);
			    config.plusGetAttribute('allowedGroupCiphers').set(WifiConfiguration.GroupCipher.TKIP);
			    config.plusGetAttribute('allowedKeyManagement').set(WifiConfiguration.KeyMgmt.WPA_PSK);
			    config.plusGetAttribute('allowedPairwiseCiphers').set(WifiConfiguration.PairwiseCipher.TKIP);
			    // 此处需要修改否则不能自动重联
			    //config.plusGetAttribute('allowedProtocols').set(WifiConfiguration.Protocol.WPA);
			    config.plusGetAttribute('allowedGroupCiphers').set(WifiConfiguration.GroupCipher.CCMP);
			    config.plusGetAttribute('allowedPairwiseCiphers').set(WifiConfiguration.PairwiseCipher.CCMP);
			    config.plusSetAttribute('status', WifiConfiguration.Status.ENABLED);
			  }
			  return config;
			},
			// 查看以前是否也配置过这个网络
			isExsitsAndroid(sSID) {
			  // console.log("查看以前是否也配置过这个网络" + sSID);    //WifiConfiguration
			  const ArrayList = this.ArrayList
			  const wifiManager = this.wifiManager
			  let existingConfigs = new ArrayList();
			  existingConfigs = wifiManager.getConfiguredNetworks();
			  if (existingConfigs.size() != 0) {
			    for (var i = 0; i < existingConfigs.size(); i++) {
			      if (existingConfigs.get(i).plusGetAttribute('SSID') == ("\"" + sSID + "\"")) {
			        // console.log("该制定的ssid存在于配置中:" + sSID);
			        return existingConfigs.get(i);
			      }
			    }
			  }
			  // console.log("该ssid没有配置过")
			  return null;
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
	
	.float-button{
		position: fixed;bottom: 50rpx;right: 15rpx; width: 100rpx;height: 100rpx;background-color: #087DFF;border-radius: 50%;z-index: 999;
			display: flex;flex-direction: column; text-align: center;color: #fff;
	}
	
	@keyframes bounceIn {
	  0% {
	    transform: translateY(100%);
	    opacity: 0;
	  }
	  50% {
	    transform: translateY(-10%);
	    opacity: 1;
	  }
	  80% {
	    transform: translateY(5%);
	  }
	  100% {
	    transform: translateY(0%);
	  }
	}
	
	.bounce-enter-active {
	  animation: bounceIn 0.5s ease-out both;
	}
	
	@keyframes scaleUp {
	  0% {
	    transform: scale(1);
	  }
	  50% {
	    transform: scale(1.1);
	  }
	  100% {
	    transform: scale(1);
	  }
	}
	
	.scale-up {
	  animation: scaleUp 0.3s ease-in-out;
	}
</style>