import iconv from 'iconv-lite'

export function socketLogin() {
	// 发送登录信息
	let buffer = new ArrayBuffer(165);  // 头加体的总字节数
	let dataView = new DataView(buffer);
	let int8Array = new Uint8Array(buffer);
	getApp().globalData.user
	let userIdgbkBytes = iconv.encode(getApp().globalData.user.userName, 'GBK');    // 用户名字节数组
	let passwordgbkBytes = iconv.encode(getApp().globalData.user.password, 'GBK');    // 用户名字节数组
	let flaggbkBytes = iconv.encode('1', 'GBK');    // 用户名字节数组
	let appversiongbkBytes = iconv.encode('v1.1', 'GBK');    // 用户名字节数组
	let appsystemgbkBytes = iconv.encode('安卓一号', 'GBK');    // 用户名字节数组
	
	// 注意强制使用小端模式
	dataView.setUint16(0, 257, true)      // 协议版本号
	dataView.setUint16(2, 2000, true)     // 登录消息号
	dataView.setUint16(4, 159, true)      // 包体长度
	
	dataView.setInt32(6, 0, true)         // 请求ID， 根据实际情况自增
	
	int8Array.set(userIdgbkBytes.slice(0, 25), 10);
	
	int8Array.set(passwordgbkBytes.slice(0, 48), 35);
	dataView.setUint8(83, flaggbkBytes[0]);
	
	int8Array.set(appversiongbkBytes.slice(0, 25), 84);
	int8Array.set(appsystemgbkBytes.slice(0, 56), 109);
	return buffer
}

/*
 登陆响应协议2001
*/
export function socket2001(dataView, messageEvent) {
	var requestId = dataView.getInt32(6, true)       // 请求号
	var code  = dataView.getInt32(10, true)           // 错误码
	
	var message = iconv.decode(Buffer.from(messageEvent.data.slice(14, 70)), 'GBK')
	console.log('收到消息登录响应消息：requestId:'+requestId+"  code:"+code)
	if (code == 0) {
		// 发送请求文件信息
		let buffer = new ArrayBuffer(198);  // 头加体的总字节数
		let dataView = new DataView(buffer);
		let int8Array = new Uint8Array(buffer);
					
		let devsnBytes = iconv.encode(getApp().globalData.devSN, 'GBK');    // 设备号字节数组
		let videoNameBytes = iconv.encode('沿路风景', 'GBK');    // 视频名称字节数组
		let videoDateBytes = iconv.encode('2023-01-01 00:00:00', 'GBK');    // 视频日期字节数组
		let videoFileNameBytes = iconv.encode('kjkk.mp4', 'GBK');    // 视频文件名名字节数组
		let videoTotalTimeBytes = iconv.encode('00:00:00', 'GBK');    // 视频时长字节数组
		let videoCameraTypeBytes = iconv.encode('0', 'GBK');    // 摄像头类型字节数组
		
		// 注意强制使用小端模式
		dataView.setUint16(0, 257, true)      // 协议版本号
		dataView.setUint16(2, 2002, true)     // 登录消息号
		dataView.setUint16(4, 192, true)      // 包体长度
					
		dataView.setInt32(6, 0, true)         // 请求ID， 根据实际情况自增
					
		int8Array.set(devsnBytes.slice(0, 36), 10);
		int8Array.set(videoNameBytes.slice(0, 56), 46);
		int8Array.set(videoDateBytes.slice(0, 20), 102);
		int8Array.set(videoFileNameBytes.slice(0, 56), 122);
		int8Array.set(videoTotalTimeBytes.slice(0, 11), 178);
		
		dataView.setUint8(189, videoCameraTypeBytes[0]);
					
		let bytes = []
		let uint64 = BigInt(1002)
		for(var i = 0; i<8;i++) {
			bytes[i] = Number((uint64 >> BigInt(i * 8))& BigInt(0xff))
		}
		
		int8Array.set(bytes, 190);
		return buffer
	}
	return ''
}


/*
	文件上传信息响应协议体2003
*/
export async function socket2003(dataView, messageEvent, filePaths, socketTask) {
	var requestId = dataView.getInt32(6, true)       // 请求号
	var code = dataView.getInt32(10, true)           // 错误码
	
	var message = iconv.decode(Buffer.from(messageEvent.data.slice(14, 70)), 'GBK')

	let fileKey = 0n;
	for(let i = 77; i >= 70; i--){
		fileKey = fileKey << 8n;//左移8位
		fileKey = fileKey | BigInt(dataView.getUint8(i));
		// fileKey += BigInt(dataView.getUint8(i)) << BigInt(8 * (70 - i));
	}
	
	// var fileKey  = dataView.getBigUint64(70, true)           // 文件key
	// var position  = dataView.getBigUint64(78, true)           // position
	let position = BigInt(0);
	for(let i = 85; i >= 78; i--){
		position = position << 8n;//左移8位
		position = position | BigInt(dataView.getUint8(i));
	}
	console.log('收到请求文件信息响应消息：requestId:' + requestId+"  code:"+code + " fileKey:" + fileKey + " position:"+ position)
	console.log(message)
	if (code == 0) {
		console.log('开始分包')
		const bytes = await uploadChunk(filePaths)
		console.log('读取文件包长度：' + bytes.length)
		var needupload = bytes.length - Number(position) // 需要上传的字节数
		var packages = Math.ceil(needupload / 10240);  //需要上传的包数
		console.log('需要上传的字节数' + needupload)
		console.log('需要上传的包数' + packages)
		// 分包
		var packageBytes = []
		console.log(socketTask.maxPayload)
		for (var i = 0; i < 1; i++) {
			if(i == (packages - 1)) {
				packageBytes = bytes.slice(Number(position)+i*10240, bytes.length)
			}	else{
				packageBytes = bytes.slice(Number(position)+i*10240, Number(position)+i*10240+10240)
			}
			const pnum = Number(position) + i * 10240
			// await sleep3s()
			sendPackage(socketTask, packageBytes, fileKey, pnum, i)
		}
		
	}
}

function sleep3s() {
	return new Promise((revose, reject) => {
		setTimeout(() => {
			revose(true)
		}, 3000)
	})
}

function sendPackage(socketTask, packageBytes, fileKeyNum, pnum, requestID) {
	// 发送文件包
	// let data = new ArrayBuffer(10240)
	let buffer = new ArrayBuffer(10270);  // 头加体的总字节数
	let dataView = new DataView(buffer);
	let int8Array = new Uint8Array(buffer);
	
	// 注意强制使用小端模式
	dataView.setUint16(0, 257, true)      // 协议版本号
	dataView.setUint16(2, 2004, true)     // 登录消息号
	dataView.setUint16(4, 10264, true)      // 包体长度
					
	int8Array.set(packageBytes, 6);             // 拷贝数据包
	dataView.setInt32(10246, requestID, true)         // 请求ID， 根据实际情况自增
	dataView.setInt32(10250, packageBytes.length, true)         // 本包数据实际长度，只有在最后一包数据的情况下才不是10240
					
	let filekeyBytes = []
	let filekey = BigInt(fileKeyNum)
	for(var i = 0; i<8;i++) {
		filekeyBytes[i] = Number((filekey >> BigInt(i * 8))& BigInt(0xff))
	}
					
	int8Array.set(filekeyBytes, 10254); // 文件标识
	
	let positionBytes = []
	let position = BigInt(pnum)
	for(var i = 0; i<8;i++) {
		positionBytes[i] = Number((position >> BigInt(i * 8))& BigInt(0xff))
	}
					
	int8Array.set(positionBytes, 10262); // 文件标识
	socketTask.send({ data: buffer, success: (res) => { console.log('发送成功', res) }, fail: (err) => { console.log('发送失败', err) } })
	console.log('发送文件包位置：' + position)
}

function uploadChunk(filePath) {
	return new Promise((resolve, reject) => {
		plus.io.resolveLocalFileSystemURL(filePath, (entry) => {
			entry.file(function(file) {
				console.log(file)
				var reader = new plus.io.FileReader();
				
				reader.onload = function(e) {
					console.log('读取文件成功：');
					var dataUrl = e.target.result;
					 var base64Index = dataUrl.indexOf('base64,') + 'base64,'.length;
					 var binaryData = atob(dataUrl.substring(base64Index));
					 var bytes = new Uint8Array(binaryData.length);
					 for (var i = 0; i < binaryData.length; i++) {
						bytes[i] = binaryData.charCodeAt(i);
					 }
					 console.log('读取文件成功=',bytes.length);
					 resolve(bytes)
				};
				reader.onerror = function(e) {
					console.log('读取文件失败：');
					console.log(e);
				};
				reader.onloadstart = (e) => {
					console.log('开始读取文件');
					// reader.readAsText(file);
				};
				// 添加输出reader.readyState的语句 
				console.log('reader.readyState:', reader.readyState);
				// 如果状态为EMPTY（0），手动调用一次readAsArrayBuffer
				if (reader.readyState === 0) { 
					console.log('手动调用readAsArrayBuffer');
					reader.readAsDataURL(file);
				}
			});
		});
	});
}	

/*
	读取文件并分包
*/
export async function readFileUpload(filePaths, fileSize, chunkSize) {
	let currentChunk = 0;
	const totalChunks = Math.ceil(fileSize / chunkSize); // 总分包数
	const buffArr = []
	// 分包上传函数
	function uploadChunk(filePath, chunkIndex) {
		
		return new Promise((resolve, reject) => {
			console.log(filePath)

			plus.io.resolveLocalFileSystemURL(filePath, (entry) => {
				entry.file(function(file) {
					console.log(file)
					var reader = new plus.io.FileReader();
					
					reader.onload = function(e) {
						console.log('读取文件成功：');
						var dataUrl = e.target.result;
					   var base64Index = dataUrl.indexOf('base64,') + 'base64,'.length;
					   var binaryData = atob(dataUrl.substring(base64Index));
					   var bytes = new Uint8Array(binaryData.length);
					   for (var i = 0; i < binaryData.length; i++) {
							bytes[i] = binaryData.charCodeAt(i);
					   }
					   console.log('读取文件成功=',bytes.length);
						 resolve(bytes)
					};
					reader.onerror = function(e) {
						console.log('读取文件失败：');
						console.log(e);
					};
					reader.onloadstart = (e) => {
						console.log('开始读取文件');
						// reader.readAsText(file);
					};
					// 添加输出reader.readyState的语句 
					console.log('reader.readyState:', reader.readyState);
					// 如果状态为EMPTY（0），手动调用一次readAsArrayBuffer
					if (reader.readyState === 0) { 
						console.log('手动调用readAsArrayBuffer');
						reader.readAsDataURL(file);
					}
				});
			});

			// plus.io.requestFileSystem(plus.io.PRIVATE_DOC, (fs) => {
			// 	console.log(fs.root)
			// 	fs.root.getFile(filePath, { create: false }, (fileEntry) => {
			// 		fileEntry.file(file => {
			// 			 var reader = new plus.io.FileReader();
			// 				reader.onloadend = function(e) {
			// 						// e.target.result 包含了文件的二进制数据
			// 						var binaryData = e.target.result;
			// 						// 处理二进制数据
			// 						console.log('文件读取成功: ', binaryData);
			// 				};
			// 				// 以二进制方式读取文件
			// 				reader.readAsArrayBuffer(file);
			// 		}, (e) => { console.log('读取文件失败：' + e.message) })
			// 	}, (e) => { console.log('——：' + e.message) })
			// }, (e) => { console.log('请求文件系统失败：' + e.message) })
			// 读取文件指定分包内容
			// const fileReader = uni.getFileSystemManager().createFileReader();
			// fileReader.readAsArrayBuffer({ filePath: filePath, start: currentChunk * chunkSize, length: chunkSize }, (e) => {
			// 		const chunkData = e.result; // 获取当前分包的数据流
			// 		// 使用uni.uploadFile上传当前分包数据...
			// 		// ... 上传成功后调用 resolve，失败调用 reject ...
			// 		buffArr.push(chunkData)
			// 		currentChunk++; // 更新当前分包索引，准备上传下一个分包
			// 		if (currentChunk < totalChunks) { // 如果还有剩余分包，则继续上传下一个分包
			// 				uploadChunk(filePath, currentChunk); // 递归调用自身进行下一分包的上传
			// 		} else { // 所有分包上传完毕，可以进行一些后续操作...
			// 				// ... 后续操作 ...
			// 				resolve(buffArr)
			// 		}
			// });
		});
	}
	 
	// 开始上传第一个分包
	return await uploadChunk(filePaths, currentChunk);
}