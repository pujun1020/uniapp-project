/**
 * 用于wifi连接基于html5 plus开发
 * 
 * by cx 2021-05-17
 */


// 获取wifi 管理
function getWifiManager() {
	// 主窗体
	var MainActivity = plus.android.runtimeMainActivity()
	// 上下文 
	var Context = plus.android.importClass('android.content.Context');

	// 导入WIFI管理 和 WIFI 信息 的class  
	plus.android.importClass("android.net.wifi.WifiManager")
	plus.android.importClass("android.net.wifi.WifiInfo")
	plus.android.importClass("java.util.ArrayList")

	// 获取 WIFI 管理实例  
	return MainActivity.getSystemService(Context.WIFI_SERVICE)
}

/**
 * 设置wifi (可以根据返回status验证是否切换成功)
 * @param {String} ssid
 * @param {String} pwd 密码
 * @return {status:"状态",networkId:"网络id"}
 */
function setWifi(ssid,pwd) {


	// 获取 WIFI 管理实例  
	var wifiManager = getWifiManager();
	var cfg = createWifiConfig(wifiManager, ssid,pwd);
	var i = wifiManager.addNetwork(cfg);
	var b = wifiManager.enableNetwork(i, true);
	
	// 回收类
	plus.android.autoCollection(cfg);
	plus.android.autoCollection(wifiManager);
	
	return {status:b,networkId:i};
}

/**
 * 创建wifi配置
 * @param {Object} wifiManager
 * @param {Object} ssid
 * @param {String} pwd 密码
 */
function createWifiConfig(wifiManager, ssid, pwd) {
	plus.android.importClass("java.util.BitSet");
	var WifiConfiguration = plus.android.importClass("android.net.wifi.WifiConfiguration");
	var config = new WifiConfiguration();
	
	plus.android.getAttribute(config, "allowedAuthAlgorithms").clear();
	plus.android.getAttribute(config, "allowedGroupCiphers").clear();
	plus.android.getAttribute(config, "allowedKeyManagement").clear();
	plus.android.getAttribute(config, "allowedPairwiseCiphers").clear();
	plus.android.getAttribute(config, "allowedProtocols").clear();
	plus.android.setAttribute(config, "SSID", `"${ssid}"`);

	var tempConfig = isExsits(wifiManager,ssid);
	if (tempConfig != null) {
		wifiManager.removeNetwork(plus.android.getAttribute(tempConfig, "networkId"));
		plus.android.autoCollection(tempConfig);
	}
	plus.android.setAttribute( config, "preSharedKey", `"${pwd}"`);
	plus.android.setAttribute( config, "hiddenSSID", true);	

	plus.android.getAttribute(config, "allowedAuthAlgorithms").set(WifiConfiguration.AuthAlgorithm.OPEN);
	plus.android.getAttribute(config, "allowedGroupCiphers").set(WifiConfiguration.GroupCipher.TKIP);
	plus.android.getAttribute(config, "allowedKeyManagement").set(WifiConfiguration.KeyMgmt.WPA_PSK);
	plus.android.getAttribute(config, "allowedPairwiseCiphers").set(WifiConfiguration.PairwiseCipher.TKIP);
	plus.android.getAttribute(config, "allowedGroupCiphers").set(WifiConfiguration.GroupCipher.CCMP);
	plus.android.getAttribute(config, "allowedPairwiseCiphers").set(WifiConfiguration.PairwiseCipher.CCMP);
	plus.android.setAttribute( config, "status", WifiConfiguration.Status.ENABLED);	
	return config;
}

/**
 * 检测ssid是否已经在配置好的网络信息里面
 * @param {Object} wifiManager
 * @param {Object} ssid
 */
function isExsits(wifiManager, ssid) {
	var rawssid = `"${ssid}"`,
		list = wifiManager.getConfiguredNetworks(),
		size = list.size(),
		wifiConfiguration;
	console.log(list);
	for (var i = 0; i < size; i++) {
		var wifiConfiguration = list.get(i);
		if (plus.android.getAttribute(wifiConfiguration, "SSID") === rawssid) {
			plus.android.autoCollection(list);
			return wifiConfiguration;
		}
	}
	plus.android.autoCollection(list);
	return null;
}

/**
 * 通过网络id删除wifi
 * @param {Object} wifiManager
 * @param {Object} paramInt
 */
function removeWifi(wifiManager, paramInt) {
	wifiManager.disableNetwork(paramInt);
	wifiManager.disconnect();
	wifiManager.removeNetwork(paramInt);
	wifiManager.saveConfiguration();
}


// 获取当前连接ssidss
function getConnectedSSID() {
	var wifiManager = getWifiManager();
	var ssid = wifiManager.getConnectionInfo().getSSID();
	plus.android.autoCollection(wifiManager);
	console.log('getConnectedSSID',ssid)
	setTimeout(()=>{
		console.log('getConnectedSSID',ssid)
	},2000)
	return ssid;
}

function getConnectedSSIDNew(){
	 return new Promise((resolve, reject) => {
		// 获取 WIFI 管理实例
		var platform = uni.getStorageSync('platform');
		var sand = uni.requireNativePlugin("sand-plugin-wifi");
		 //触发一次位置获取，否则iphone设置中没有定位服务
		// if(getApp().globalData.longitude&&getApp().globalData.latitude){
			uni.getLocation({
				type: 'wgs84',
				success: function (res) {
					// console.log('当前位置的经度：' + res.longitude);
					// console.log('当前位置的纬度：' + res.latitude);
				},
				fail() {
					// console.log('获取定位授权失败！')
					if(platform=="android"){
						var context = plus.android.importClass('android.content.Context');
						var locationManager = plus.android.importClass('android.location.LocationManager');
						var main = plus.android.runtimeMainActivity();
						var mainSvr = main.getSystemService(context.LOCATION_SERVICE);
						if (!mainSvr.isProviderEnabled(locationManager.GPS_PROVIDER)) {
							if (!mainSvr.isProviderEnabled(locationManager.GPS_PROVIDER)) {
								var Intent = plus.android.importClass('android.content.Intent');
								var Settings = plus.android.importClass('android.provider.Settings');
								var intent = new Intent(Settings.ACTION_LOCATION_SOURCE_SETTINGS);
								main.startActivity(intent); // 打开系统设置定位服务功能页面
							} else {
								console.log('定位服务功能已开启');
							}
						}
					
					}
					resolve(''); // 如果需要，可以在这里处理错误情况
				}
			});
		// }
		setTimeout(()=>{
			// 调用异步方法
			sand.getWIFIInfo({}, (ret) => {
				// console.log('获取wifi信息', ret);
				if (ret.ssid) {
					// console.log(ret.ssid);
					var ssid = ret.ssid;
					resolve(`"${ssid}"`); // 异步操作成功，通过resolve传递结果
				} else {
					resolve(''); // 如果需要，可以在这里处理错误情况
				}
			});
		},1000)
		
		
		// } else {
		// 	var wifiManager = getWifiManager();
		// 	console.log('wifiManager',wifiManager)
		// 	var ssid = wifiManager.getConnectionInfo().getSSID();
		// 	plus.android.autoCollection(wifiManager);
		// 	console.log('安卓获取ssid',ssid)
		// 	resolve(ssid); // Android部分直接返回结果
		// }
	});
}



module.exports = {
	connectWifi: setWifi, //连接wifi
	getConnectedSSID: getConnectedSSID, //获取当前wifi ssid
	getConnectedSSIDNew:getConnectedSSIDNew,
	removeWifi(i){ // 通过网络id删除wifi
		var wifiManager = getWifiManager();
		removeWifi(wifiManager,i);
		plus.android.autoCollection(wifiManager);
	},
	removeWifiBySSID(ssid){ // 通过ssid删除wifi
		if(ssid==null||ssid==""||ssid.length<1){
			return;
		}
		plus.android.importClass("android.net.wifi.WifiConfiguration");
		var wifiManager = getWifiManager();
		// console.log('wifiManager',wifiManager)
		var tempConfig = isExsits(wifiManager,ssid);
		console.log('tempConfig',tempConfig)
		if(tempConfig!=null){
			removeWifi(wifiManager,plus.android.getAttribute(tempConfig, "networkId"));
		}
		plus.android.autoCollection(wifiManager);
	},
	
}
