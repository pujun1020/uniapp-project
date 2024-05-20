
<template>
  <view style="margin-top: 100rpx;">
    <button @click="getWifiList">扫描WiFi</button>
    <view>
      <view class="wifi-item" @click="connectNew(item.name,'secnet-cd',item.bssid,item.sindex)"
            v-for="(item,index) in wifiArray"
            :key="index">
        {{ item.name }}
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      wifiManager: null,
      WifiConfiguration: null,
      wifis: null,
      nowWifiInfo: null,
      wifiArray: [],
      ArrayList: null
    };
  },
  // #ifdef APP-PLUS
  methods: {
    // 初始化WiFi
    initWifi() {
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
      console.log('wifi初始化成功')

      //引入过滤器
      //const IntentFilter = plus.android.importClass('android.content.IntentFilter');
      //const Intent = plus.android.importClass('android.content.Intent');
      // 注册广播
      //let receiver = plus.android.implements('io.dcloud.feature.internal.reflect.BroadcastReceiver', {
      //   onReceive: function (context, intent) {
      //    console.log('*********************************************************');
      //     console.log(intent.getAction());
      //      console.log(context.toString())
      //      console.log(intent.toString())
      //    console.log('*********************************************************');
      // } //实现onReceiver回调函数
      //});
      //let filter = new IntentFilter();
      // filter.addAction('android.net.wifi.STATE_CHANGE');
      // filter.addAction('android.net.wifi.WIFI_STATE_CHANGED');
      // filter.addAction('android.net.wifi.LINK_CONFIGURATION_CHANGED');
      // filter.addAction('android.permission.ACCESS_WIFI_STATE');
      // filter.addAction('android.net.wifi.WifiManager.NETWORK_STATE_CHANGED_ACTION');
      //filter.addAction('android.net.wifi.STATE_CHANGE');
      //MainActivity.registerReceiver(receiver, filter); //监听广播

      this.androidOpenWifi()
    },
    // getReceive(context,intent){
    //   console.log(context,intent)
    // },
    // 打开安卓的wifi
    androidOpenWifi() {
      let bRet = false;
      const wifiManager = this.wifiManager
      if (!wifiManager.isWifiEnabled()) {
        bRet = wifiManager.setWifiEnabled(true); //返回自动打开的结果
        console.log("打开wifi的返回结果是" + bRet)
      } else {
        bRet = true;
        console.log("wifi原本已经打开")
      }
      return bRet;
    },
    // 获取WiFi列表
    getWifiList() {
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
        wifiArray.push(oneWiFi);
      }
      this.wifiArray = wifiArray
      console.log(wifiArray)
      this.getNowWifi()
    },
    // 获取当前连接的wifi
    getNowWifi() {
      const info = this.wifiManager.getConnectionInfo();
      console.log(info.toString())
      let ssid = info.getSSID()
      let rssi = info.getRssi()
      console.log(rssi)
      ssid = ssid.replace(/(^\"*)|(\"*$)/g, "")
      console.log(ssid)
    },
    // 连接新的WiFi
    connectNew(ssid, pwd, BSSID, index) {
		if(ssid.indexOf('JL0C22BA')>-1){
			pwd='88888888';
		}
      // uni.onNetworkStatusChange(function (res) {
      //   console.log(res.isConnected);
      //   console.log(res.networkType);
      // });
      console.log('wifi账号密码：',{ssid, pwd})
      const wifiManager = this.wifiManager
      var wifiConfig = this.androidCreateWifiInfo(ssid, pwd, 'wpa', BSSID);
      if (wifiConfig == null) {
        console.log("wifiConfig is null!")
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
      console.log("enableNetwork status enable=" + enabled)
      // boolean
      const connected = wifiManager.reconnect();
      console.log("enableNetwork connected=" + connected)


      // const timer = setInterval(() => {
      //   const wifiState = wifiManager.getWifiState()
      //   const wifiStateNetworks = wifiManager.getConfiguredNetworks()
      //   console.log(wifiState)
      //   console.log(wifiStateNetworks.toString())
      // }, 500)
      // setTimeout(()=>{
      //   clearInterval(timer)
      // },10000)
      // const existingConfigs = wifiManager.getConfiguredNetworks()
      // console.log(existingConfigs)
      // wifiManager.enableNetwork(this.wifis.get(index).plusGetAttribute('networkId'), true);
      // setTimeout(()=>{
      //   this.getNowWifi()
      // },3000)
    },
    // 创建新的WiFi信息
    androidCreateWifiInfo(SSID, Password, Type, BSSID) {
      console.log(SSID, Password, Type)
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
      console.log("查看以前是否也配置过这个网络" + sSID);    //WifiConfiguration
      const ArrayList = this.ArrayList
      const wifiManager = this.wifiManager
      let existingConfigs = new ArrayList();
      existingConfigs = wifiManager.getConfiguredNetworks();
      if (existingConfigs.size() != 0) {
        for (var i = 0; i < existingConfigs.size(); i++) {
          if (existingConfigs.get(i).plusGetAttribute('SSID') == ("\"" + sSID + "\"")) {
            console.log("该制定的ssid存在于配置中:" + sSID);
            return existingConfigs.get(i);
          }
        }
      }
      console.log("该ssid没有配置过")
      return null;
    }
  },
  onLoad() {
    this.initWifi()
  }
  //  #endif
}
</script>

<style>
.wifi-item {
  padding: 10px;
  box-sizing: border-box;
  border: 1px solid #eee;
}
</style>

​
