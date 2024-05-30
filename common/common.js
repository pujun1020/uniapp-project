

//按照小时进行排序
export function sortByTime(objArray){
	 // 使用time属性进行排序
	    return objArray.sort((a, b) => {
	        const [hoursA, minutesA] = a.time.split(':').map(Number);
	        const [hoursB, minutesB] = b.time.split(':').map(Number);
	        
	        // 计算每个小时和分钟组合的总分钟数
	        const totalMinutesA = hoursA * 60 + minutesA;
	        const totalMinutesB = hoursB * 60 + minutesB;
	        
	        return totalMinutesA - totalMinutesB;
	    });
}


//时间格式化
export function extractYearMonthDay(dateTimeStr,opt){
		// 创建一个Date对象
	    const date = new Date(dateTimeStr);
	    
	    // 从Date对象中提取年、月、日
	    const year = date.getFullYear();
	    const month = ("0" + (date.getMonth() + 1)).slice(-2); // getMonth返回的月份是从0开始的，所以需要+1
	    const day = ("0" + date.getDate()).slice(-2); // 保证日期始终为两位数，不足前面补0
	    
		// 新增：提取小时和分钟
		const hour = ("0" + date.getHours()).slice(-2); // 保证小时始终为两位数
		const minute = ("0" + date.getMinutes()).slice(-2); // 保证分钟始终为两位数
	
		if (opt === 1) {
			return year + '-' + month + '-' + day;
		} else if (opt === 2) {
			// 当opt为2时，返回小时和分钟的字符串
			return hour + ':' + minute;
		}

	    return dateTimeStr;
}


//从视频标题中提取视频对应的时间
export function extractAndFormatDateTime(filename,opt){
	 // 使用正则表达式更精确地匹配并捕获所需部分
	    const regex = /(\d{4})_(\d{2})_(\d{2})-(\d{2})_(\d{2})_(\d{2})/;
	    const match = filename.match(regex);
	    
	    if (match) {
	        // 直接使用捕获组的索引进行解构赋值
	        const [_, year, month, day, hour, minute, second] = match;
	        
	        // 格式化为新的日期时间格式
			var formattedDateTime='';
			if(opt==1){
				formattedDateTime = `${year}-${month}-${day}`;
			}else{
				formattedDateTime = `${year}-${month}-${day} ${hour}:${minute}:${second}`;
			}
	        
	        return formattedDateTime;
	    } else {
	        console.warn("未在文件名中找到匹配的日期时间格式");
	        return '';
	    }
}

export function getImgToBase64(filePath){
	return new Promise((resolve, reject) => {
		plus.io.resolveLocalFileSystemURL(filePath, (entry) => {
			entry.file(function(file) {
				var reader = new plus.io.FileReader();
				reader.onload = function(e) {
					var dataUrl = e.target.result;
					resolve(dataUrl)
				};
				reader.onerror = function(e) {
					resolve('')
				};
				reader.onloadstart = (e) => {
					resolve('')
				};
				// 如果状态为EMPTY（0），手动调用一次readAsArrayBuffer
				if (reader.readyState === 0) { 
					reader.readAsDataURL(file);
				}
			});
		});
	});
}

//dvr视频下载到相册方法
export function dvrDownLoadToPhotosAlbum(_this,params,opt) {
	return new Promise((resolve, reject) => {
		if(params.playUrl.includes('http://')||params.playUrl.includes('https://')){
			opt=1;
			_this.uploadOrDownload ='正在下载保存到相册'
			_this.uploadShow = true;
		}
		if(opt==1){//先下载，再保存到相册
			var downloadTask =uni.downloadFile({
			  url: params.playUrl, // 网络视频URL
			  success: (downloadRes) => {
			    if (downloadRes.statusCode === 200) {
			      uni.saveVideoToPhotosAlbum({
			        filePath: downloadRes.tempFilePath, // 使用下载成功的临时文件路径
			        success: () => {
			          uni.showToast({
			            title: '已保存相册！'
			          });
					   _this.uploadShow = false
			        },
			        fail: (err) => {
			          uni.showToast({
			            title: '已保存相册失败，检查是否权限已打开？',
						icon:'none'
			          });
					   _this.uploadShow = false
			        }
			      });
			    } else {
					 _this.uploadShow = false
			      console.error('视频下载失败，状态码：', downloadRes.statusCode);
				  uni.showToast({
				    title: '已保存相册失败，检查是否权限已打开？',
				  						icon:'none'
				  });
			    }
			  },
			  fail: (err) => {
				  _this.uploadShow = false
			    console.error('下载视频失败', err);
				uni.showToast({
				  title: '已保存相册失败，检查是否权限已打开？',
				   icon:'none'
				});
			  }
			});
			downloadTask.onProgressUpdate(res => {
				_this.progressVal = res.progress
				_this.progressTxt = `${res.totalBytesWritten}/${res.totalBytesExpectedToWrite}`
			})
		}else{
			uni.saveVideoToPhotosAlbum({
			  filePath: params.playUrl, // 使用下载成功的临时文件路径
			  success: () => {
			    uni.showToast({
			      title: '已保存相册！'
			    });
			  },
			  fail: (err) => {
			    uni.showToast({
			      title: '已保存相册失败，检查是否权限已打开？',
				   icon:'none'
			    });
			  }
			});
		}
		
	
	})
}


//判断当前视频是否已经下载到本地
export function verfyDownLoad(_this,id,opt) {
	return new Promise((resolve, reject) => {
		var flag=true;
		var locVieoList = uni.getStorageInfoSync().keys.filter(k => k.includes('/uniapp_save/')).map(k => {
			return { ...uni.getStorageSync(k), playUrl: k }
		})
		for(var i=0;i<locVieoList.length;i++){
			var loc=locVieoList[i];
			if(loc.id==id){
				flag=false;
			}
		}
		if(flag==false){
			if(opt==1){
				resolve(true);
			}else{
				uni.showModal({
					title:_this.$getLang('提示'),
					content:'当前视频已保存在本地，是否需要重新下载？',
					cancelText:_this.$getLang('取消'),
					confirmText:_this.$getLang('确认'),
					success:(res)=>{
						if(res.confirm){
							resolve(true);
						}else{
							resolve(false);
						}
					}
				})
			}
			
		}else{
			if(opt==1){
				resolve(false);
			}else{
				resolve(true);
			}
			
		}
	});
}

//判断当前本地视频是否已经上传到云端
export function verfyUploadToCloud(_this,id,opt) {
	return new Promise((resolve, reject) => {
		var flag=true;
		var locVieoList = uni.getStorageInfoSync().keys.filter(k => k.includes('/uniapp_save/')).map(k => {
			return { ...uni.getStorageSync(k), playUrl: k }
		})
		for(var i=0;i<locVieoList.length;i++){
			var loc=locVieoList[i];
			if(loc.id==id && loc.is_upload==true){
				flag=false;
			}
		}
		if(flag==false){
			if(opt==1){
				resolve(false);
			}else{
				uni.showModal({
					title:_this.$getLang('提示'),
					content:_this.$getLang('90041'),
					showCancel:false,
					confirmText:_this.$getLang('确定'),
					success:()=>{
						resolve(false);
					}
				})
			}
		}else{
			if(opt==1){
				resolve(true);
			}else{
				resolve(true);
			}
		}
	});
}