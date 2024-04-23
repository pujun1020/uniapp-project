module.exports  = {
	getLangContent:function(str,langIndex){
		if(!langIndex||langIndex==undefined){
			var index=uni.getStorageSync('language');
			if(index){
				langIndex=Number(index);
			}else{
				langIndex=0;
			}
		}
		if(this.$lang&&this.$lang[str]){
			try{
				return this.$lang[str][langIndex];
			}catch(e){
				console.log('未找到：',str)
				return str;
			}
		}else{
			return str;
		}
	},
	lang:
	{
		/**************************** 【设置界面】 **************************************/
		'必须wifi环境上传':['必须wifi环境上传','Must be uploaded in wifi environment'],
		'上传成功提示窗':['上传成功提示窗','Upload success prompt'],
		'下载成功提示窗':['下载成功提示窗','Download success prompt'],
		'地区':['地区','Area'],
		'语言':['语言','Language'],
		'关于我们':['关于我们','About us'],
		'确认':['确认','Ok'],
		'取消':['取消','Cancel'],
		
		'中国':['中国','China'],
		'美国':['美国','America'],
		
		'中文':['中文','Chinese'],
		'英文':['英文','English'],
	}
}
