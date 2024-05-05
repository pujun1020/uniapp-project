const socket = {
	/**
	 * 回调信息
	 */
	TCPSocket: null,
	receivedStatus: () => {},
	receivedMsgCallBack: () => {},
	receivedHexMsgCallBack: () => {},

	/**
	 * 初始化连接TCP服务器
	 * @param {Object} channel 通道值
	 * @param {Object} ip	TCP服务器IP
	 * @param {Object} port TCP服务器端口
	 * @param {Object} charsetname 字符集格式 //可不传,默认'UFT-8',可选'GBK'
	 */
	init(channel, ip, port, charsetname) {
		socket.TCPSocket = uni.requireNativePlugin('Aimer-TCPPlugin');
		socket.connect(channel, ip, port, charsetname);
	},

	connect(channel, ip, port, charsetname) {
		socket.TCPSocket.connect({
				channel: channel,
				charsetname: charsetname, //可不选,默认UTF-8,可选'GBK'
				ip: ip,
				port: port
			},
			result => {
				/**
				 * status : 0 连接成功
				 * status : 1 断开连接
				 * receivedMsg : 服务器返回信息
				 * receivedHexMsg : 服务器返回字节数组(单片机、智能家居等硬件数据交互)
				 */
				if (result.status) {
					//连接状态
					socket.receivedStatus(channel, result.status);
				}
				if (result.receivedMsg) {
					//服务器返回信息
					socket.receivedMsgCallBack(channel, result.receivedMsg);
				}
				if (result.receivedHexMsg) {
					//Hex服务器返回信息
					socket.receivedHexMsgCallBack(channel, result.receivedHexMsg);
				}
			}
		);
	},

	/**
	 * 客户端 发送字符串消息
	 * @param {Object} channel 通道值
	 * @param {Object} message 发送内容
	 * @param {Object} charsetname 字符集格式
	 */
	send(channel, message, charsetname) {
		socket.TCPSocket.send({
			channel: channel, //可选 1~20
			charsetname: charsetname,//可不选,默认UTF-8,可选'GBK'
			message: message
		});
	},

	/**
	 * 客户端 发送字节数组(发送控制单片机、智能家具等硬件的指令)
	 * @param {Object} channel
	 * @param {Object} bytesMessage
	 */
	sendBytes(channel, bytesMessage) {
		socket.TCPSocket.sendBytes({
			channel: channel, //可选 1~20
			bytesMessage: bytesMessage
		});
	},

	/**
	 * 断开连接
	 * @param {Object} channel
	 */
	disconnect(channel) {
		socket.TCPSocket.disconnect({
			channel: channel //可选 1~20
		});
	}
}

export default socket;
