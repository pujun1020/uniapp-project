<template>
  <view style="padding: 20px">
		<u-input v-model="url" type="text" border />
    <button @click="openWebSocket">打开连接</button>
		<u-divider height="60"></u-divider>
		<button @click="closeWebSocket">关闭连接</button>
		<u-divider height="60"></u-divider>
		<u-input v-model="dataTxt" type="textarea" border />
    <button @click="sendMessage">发送消息</button>
		<u-divider height="30"></u-divider>
		<button @click="clearMsg">清空日志</button>
    <view style="white-space: pre-wrap; margin-top: 20px">
			<text>{{ msg }}</text>
			<!-- {{ msg }} -->
		</view>
  </view>
</template>
 
<script>
export default {
  data() {
    return {
      socketTask: null,
			url: 'ws://192.168.3.1:7686/',
      msg: '',
			dataTxt: '{ "METHOD": "VIDEO.TIME", "date": "2024-03-02", "previewType": "all" }'
    }
  },
  methods: {
    openWebSocket() {
      this.socketTask = uni.connectSocket({
        url: this.url,
				protocols: ['dvr-server'],
				success: res => {
					this.msg += 'WebSocket连接中...！\n'
					console.log(this.msg)
				},
				fail: err => {
					this.msg += '报错！' + err + '\n'
					console.log("报错", err);
				},
      });
      this.socketTask.onOpen(() => {
				this.msg += 'WebSocket连接已打开！\n'
        console.log('WebSocket连接已打开！');
      });
      this.socketTask.onMessage((res) => {
				this.msg += '收到服务器内容：' + res.data + ' \n'
        console.log('收到服务器内容：' + res.data);
        // this.msg = res.data;
      });
      this.socketTask.onError((err) => {
				this.msg += 'WebSocket连接打开失败，请检查！\n'
        console.log('WebSocket连接打开失败，请检查！');
      });
    },
    sendMessage() {
      if (this.socketTask) {
        this.socketTask.send({
          data: this.dataTxt,
          success: () => {
						this.msg += '发送数据成功 \n'
            console.log('发送数据成功');
          },
          fail: () => {
						this.msg += '发送数据失败 \n'
            console.log('发送数据失败');
          }
        });
      }
    },
    closeWebSocket() {
      if (this.socketTask) {
        this.socketTask.close();
      }
    },
		clearMsg() {
			this.msg = ''
		}
  }
}
</script>