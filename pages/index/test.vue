<template>  
  <view class="container">  
    <view class="header">  
      <text class="back-button" @click="goBack">返回</text>  
      <text class="title">3M IATD 案例中心</text>  
    </view>  
    <scroll-view class="card-list" scroll-y="true">  
      <view v-for="(card, index) in cards" :key="index" class="card">  
        <view class="card-content">  
          <text class="card-title">{{ card.title }}</text>  
          <text class="card-info">{{ card.info }}</text>  
        </view>  
        <view v-for="(tag, tagIndex) in card.tags" :key="tagIndex" class="tag" :style="{ backgroundColor: tag.color }">  
          <text class="tag-text">{{ tag.text }}</text>  
        </view>  
      </view>  
    </scroll-view>  
  </view>  
</template>  
  
<script>  
export default {  
  data() {  
    return {  
      cards: [  
        {  
          title: 'FPC 案例',  
          info: '一般工业/通讯设备和元器件 - FPC - 3764-Q - 2022-02-10',  
          tags: [  
            { text: '视频', color: 'red' },  
            { text: '精华', color: 'red' },  
            { text: '置顶', color: 'red' }  
          ]  
        },  
        // 添加更多卡片数据...  
      ]  
    };  
  },  
  methods: {  
    goBack() {  
      uni.navigateBack();  
    }  
  }  
};  
</script>  
  
<style scoped>  
.container {  
  display: flex;  
  flex-direction: column;  
  height: 100%;  
}  
  
.header {  
  display: flex;  
  align-items: center;  
  justify-content: space-between;  
  padding: 10px;  
  background-color: white;  
}  
  
.back-button {  
  color: black;  
  font-size: 16px;  
}  
  
.title {  
  font-size: 20px;  
  font-weight: bold;  
  color: black;  
}  
  
.card-list {  
  flex: 1;  
  padding: 10px;  
}  
  
.card { 
  display: flex;  
  flex-direction: column;  
  margin-bottom: 10px;  
  background-color: white;  
  padding: 10px;  
}  
  
.card-content {  
  margin-bottom: 10px;  
}  
  
.card-title {  
  font-size: 18px;  
  color: black;  
}  
  
.card-info {  
  font-size: 14px;  
  color: black;  
}  
  
.tag {  
  display: inline-block;  
  padding: 5px 10px;  
  margin-right: 5px;  
  border-radius: 5px;  
}  
  
.tag-text {  
  font-size: 12px;  
  color: white;  
}  
</style>ss