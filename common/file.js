import langObg from "./language.js"
// 读取json文件
function getJsonData(path) { //path:路径
	console.log("getData");
	return new Promise(resolve => { //文件读写是一个异步请求 用promise包起来方便使用时的async+await
		plus.io.requestFileSystem(plus.io.PUBLIC_DOCUMENTS, fs => { //请求文件系统
				fs.root.getFile(
					path, { //请求地址文件  '/storage/emulated/0/config.txt'为根目录  '/config.txt'为/storage/Android/data/io.dcloud.HBuilder（包名）/documents/config.js
						create: true //当文件不存在时创建
					}, fileEntry => {
						fileEntry.file(function(file) {
							let fileReader = new plus.io
								.FileReader(); //new一个可以用来读取文件的对象fileReader
							fileReader.readAsText(file, "utf-8"); //读文件的格式
							fileReader.onerror = e => { //读文件失败
								console.log("获取文件失败", fileReader.error);
								plus.nativeUI.toast(langObg.getLangContent('获取文件失败,请重启应用'), {
									background: "rgba(255, 255, 255, 0.6)",
								});
								return;
							};
							fileReader.onload = e => { //读文件成功
								console.log(langObg.getLangContent('读取文件成功'));
								let txtData = e.target.result;
								// console.log(txtData);
								resolve(txtData); //回调函数内的值想返回到函数外部  就用promise+resolve来返回出去
							};
						});
					}, error => {
						console.log("2新建获取文件失败", error);
						plus.nativeUI.toast(langObg.getLangContent('获取文件失败,请重启应用'), {
							background: "rgba(255, 255, 255, 0.6)",
						});
						return;
					});
			},
			e => {
				console.log("1请求文件系统失败", e.message);
				plus.nativeUI.toast(langObg.getLangContent('获取文件失败,请重启应用'), {
					background:  "rgba(255, 255, 255, 0.6)",
				});
				return;
			}
		);
	});
};
// 写入josn文件
function changeData(path, seek, writeData) { //参数1：上传路径，参数2：seek方法可设置文件操作指定位置，参数3：写入的json数据
	return new Promise(resolve => {
		// resolveLocalFileSystemURL  requestFileSystem  PUBLIC_DOCUMENTS PRIVATE_DOC
		plus.io.requestFileSystem(plus.io.PRIVATE_DOC, fs => {
			fs.root.getFile(path, {
					create: true
				}, fileEntry => {
					fileEntry.file(file => {
						fileEntry.createWriter(writer => {
							 console.log( fs.root.toURL(),`${langObg.getLangContent('路径')}111`)
								plus.nativeUI.showWaiting(langObg.getLangContent('正在保存信息'));
								writer.seek(seek); //覆盖文件
								const writeDataTemp = JSON.stringify(writeData, null,
									"\r").replace(/[\r]/g, "");
								writer.write(writeDataTemp); // 整个文件重写
								writer.onerror = function() {
									console.log("4写入文件失败", writer.error.message);
									plus.nativeUI.closeWaiting();
									plus.nativeUI.toast(langObg.getLangContent('修改信息失败,请重新操作'), {
										background: "rgba(255, 255, 255, 0.6)",
									});
									return;
								};
								writer.onsuccess = function() { //填写文件成功
								
									plus.nativeUI.closeWaiting();
									plus.nativeUI.toast("保存成功", {
										// background: "rgba(255, 255, 255, 0.6)",
									});
									resolve("1");
								};
							},
							error => {
								console.log("3创建creactWriter失败", error);
								plus.nativeUI.toast(langObg.getLangContent('保存文件失败,请重新操作'), {
									// background: "#ffa38c",
								});
								return;
							});
					});
				},
				error => {
					console.log("2获取文件失败", error);
					plus.nativeUI.toast(langObg.getLangContent('保存文件失败,请重新操作'), {
						// background: "#ffa38c",
					});
					return;
				}
			);
		}, e => {
			console.log("1请求文件系统失败", e.message);
			plus.nativeUI.toast(langObg.getLangContent('请求系统失败,请重新操作'), {
				// background: "#ffa38c",
			});
			return;
		});
	});
}
/**
 * 储存文件到指定的地址:把一个文件移动到另外一个位置 剪切文件 重命名文件
 * @param {String} url				 	新的地址 _doc/ 开头
 * @param {String} file                	原文件地址
 * @param {String} newfilename 			新的文件名
 */
async function saveFile(url, file, newfilename) {
	let c = await creatDirs(url)
	let isokm = moveDirectyOrFile(file, url + "/", newfilename);
	return isokm
}
//循环创建目录 url:"_doc/...."  _doc开头
async function creatDirs(url) {
	let urllist = url.split("/");
	console.log(urllist)
	//创建文件夹
	let u = "";
	for (let i = 0; i < urllist.length - 1; i++) {
		let j = i;
		if (i == 0) {
			u = urllist[i];
		} else {
			u = u + "/" + urllist[i];
		}
		console.log(i + "-------------------")
		console.log(u)
		console.log(urllist[j + 1])
		await CreateNewDir(u, urllist[j + 1]);
	}
}
//重命名目录或文件名
function moveDirectyOrFile(srcUrl, dstUrl, newName) { //srcUrl需要移动的目录或文件，dstUrl要移动到的目标目录（父级）
	plus.io.resolveLocalFileSystemURL(srcUrl, function(srcEntry) {
		//console.log(111)
		plus.io.resolveLocalFileSystemURL(dstUrl, function(dstEntry) {
			//console.log(222)
			if (srcEntry.isDirectory) {
				//console.log(33)
				srcEntry.moveTo(dstEntry, newName, function(entry) {
					//console.log("New Path: " + entry.fullPath);
					return true;
				}, function(e) {
					return e;
					//console.log(e.message);
				});
			} else {
				srcEntry.moveTo(dstEntry, newName, function(entry) {
					//console.log("New Path: " + entry.fullPath);
					return true;
				}, function(e) {
					return e;
					//console.log(e.message);
				});
			}
		}, function(e) {
			uni.showToast({
				title: langObg.getLangContent('获取目标目录失败') + e.message,
				duration: 2000,
				icon: 'none'
			});
		});
	}, function(e) {
		uni.showToast({
			title: langObg.getLangContent('获取目录失败') + e.message,
			duration: 2000,
			icon: 'none'
		});
	});
}

//创建一个新目录
function CreateNewDir(url, dirName) {
	//url值可支持相对路径URL、本地路径URL
	return new Promise((resolver, reject) => {
		plus.io.resolveLocalFileSystemURL(url, function(entry) {
			entry.getDirectory(dirName, {
				create: true,
				exclusive: false
			}, function(dir) {
				resolver(true)
			}, function(error) {
				reject(error.message)
				uni.showToast({
					title: dirName + langObg.getLangContent('目录创建失败') + error.message,
					duration: 2000,
					icon: 'none'
				});
			});
		}, function(e) {
			reject(error.message)
			uni.showToast({
				title: langObg.getLangContent('获取目录失败') + e.message,
				duration: 2000,
				icon: 'none'
			});
		});
	})
}
/**
 * 复制文件
 * @param {String} url        文件地址，文件路径，最好是相对路径 url:"_doc/...."  _doc开头
 * @param {String} newUrl     目标目录，最好是相对路径 url:"_doc/...."  _doc开头
 * @param {String} newName    拷贝后的文件名称，默认为原始文件名称
 */
function copyFileTo(url, newUrl, dirName, newName) {
	if (url.length >= 7 && "file://" == url.substring(0, 7)) {
		url = url.substring(7)
	}
	let tempUrl = url.substring(0, url.lastIndexOf('/'));
	let addUrl = newUrl + '/' + dirName;
	console.log(addUrl, tempUrl)
	if (addUrl == tempUrl) {
		return url;
	}
	console.log(newUrl, dirName, newName)
	return new Promise((resolve, reject) => {
		plus.io.resolveLocalFileSystemURL(url, async (entry) => {
			if (entry.isFile) {
				let c = await CreateNewDir(newUrl, dirName)
				let u = await getDirsys(addUrl)
				entry.copyTo(u, newName, en => {
					resolve(en.fullPath);
				}, e => {
					console.log(e);
					reject(langObg.getLangContent('错误：复制时出现错误'))
					uni.showModal({
						title: langObg.getLangContent('错误'),
						content:langObg.getLangContent('复制时出现错误')
					})
				})
			} else {
				reject(langObg.getLangContent('错误：路径必须是文件'))
				uni.showModal({
					title: langObg.getLangContent('错误'),
					content:langObg.getLangContent('路径必须是文件')
				})
			}
		}, (e) => {
			console.log(e);
			reject(e)
			uni.showModal({
				title: langObg.getLangContent('错误'),
				content: langObg.getLangContent('打开文件系统时出错')
			})
		});
	})
}
//获取目录对象
function getDirsys(url) {
	return new Promise((resolve, reject) => {
		plus.io.resolveLocalFileSystemURL(url, (entry) => {
			resolve(entry)
		}, (e) => {
			reject(e)
			console.log(e);
		});
	})
}
//将这些方法暴露出去
export {
	getJsonData,
	changeData,
	saveFile,
	creatDirs,
	moveDirectyOrFile,
	copyFileTo,
	getDirsys,
};
