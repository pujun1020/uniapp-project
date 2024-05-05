* 调用示例
```
import {connectWifi,getConnectedSSID,removeWifi,removeWifiBySSID} from './cx-wifi/cx-wifi.js'

// 连接
connectWifi("ssid","pwd")
// 获取当前wifi ssid
getConnectedSSID()
// 通过网络id删除wifi
removeWifi("networkId")
// 通过ssid删除wifi
removeWifiBySSID("ssid")
```