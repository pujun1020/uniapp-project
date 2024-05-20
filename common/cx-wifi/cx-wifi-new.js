/**
 * 用于wifi连接基于html5 plus开发
 * 
 * by cx 2021-05-17
 */

// 导入所需的类
plus.android.importClass("android.net.wifi.WifiConfiguration");

// 获取wifi管理器
function getWifiManager() {
    // 获取当前activity的上下文
    var Context = plus.android.importClass('android.content.Context');
    var mainActivity = plus.android.runtimeMainActivity();
    // 获取WifiManager实例
    return mainActivity.getSystemService(Context.WIFI_SERVICE);
}

/**
 * 设置WiFi连接（根据返回的状态验证连接是否成功）
 * @param {String} ssid
 * @param {String} pwd 密码
 * @return {status:"状态", networkId:"网络id"}
 */
function setWifi(ssid, pwd) {
    // 请求定位权限以获取WiFi的SSID
    plus.android.requestPermissions(['android.permission.ACCESS_COARSE_LOCATION'], (e) => {
        if (e.granted.length > 0) { // 权限被允许
            // 获取WiFi管理器
            let wifiManager = getWifiManager();
            // 检查连接状态
            let connectedSSID = getConnectedSSID();
            if (connectedSSID && connectedSSID !== ssid) {
                // 断开当前连接
                wifiManager.disconnect();
            }
            // 创建WiFi配置
            let cfg = createWifiConfig(ssid, pwd);
            if (!cfg) {
                console.error('Failed to create WiFi configuration');
                return;
            }
            // 添加网络并启用
            let networkId = wifiManager.addNetwork(cfg);
            if (networkId === -1) {
                console.error('Failed to add network');
                return;
            }
            let status = wifiManager.enableNetwork(networkId, true);
            // 回收资源
            plus.android.autoCollection(cfg);
            plus.android.autoCollection(wifiManager);
            return { status: status, networkId: networkId };
        }
    }, (e) => {
        console.log('Request Permissions error:' + JSON.stringify(e));
    });
}

/**
 * 创建WiFi配置
 * @param {Object} ssid
 * @param {String} pwd 密码
 */
function createWifiConfig(ssid, pwd) {
    let wifiConfig = new plus.android.newObject("android.net.wifi.WifiConfiguration");
    if (!wifiConfig) {
        return null;
    }
    // 设置SSID和密码
    wifiConfig.SSID = '"' + ssid + '"';
    wifiConfig.preSharedKey = '"' + pwd + '"';
    // 设置加密类型
    wifiConfig.allowedKeyManagement.set(4); // WPA2_PSK
    return wifiConfig;
}

// 获取当前连接的WiFi的SSID
function getConnectedSSID() {
    // 获取WiFi管理器
    let wifiManager = getWifiManager();
    // 获取连接信息
    let wifiInfo = wifiManager.getConnectionInfo();
    // 获取SSID
    let ssid = wifiInfo.getSSID();
    // 回收资源
    plus.android.autoCollection(wifiManager);
    return ssid;
}

module.exports = {
    connectWifi: setWifi, // 连接WiFi
    getConnectedSSID: getConnectedSSID, // 获取当前连接的WiFi的SSID
};
