<template>
  <view class="container">
    <view class="header">
      <text>3M IATD 案例中心</text>
    </view>
    <scroll-view scroll-y="true" class="content">
      <view class="case" v-for="(item, index) in caseList" :key="index">
        <view class="case-content">
          <image :src="item.image" class="case-image"></image>
          <view class="case-details">
            <text class="industry">{{ item.industry }}</text>
            <text class="product">最终产品: {{ item.finalProduct }}</text>
            <text class="appliedProduct">应用产品: {{ item.appliedProduct }}</text>
            <view class="tags">
              <view class="tag" v-for="tag in item.tags" :key="tag">{{ tag }}</view>
            </view>
          </view>
        </view>
        <view class="footer">
          <text class="date">{{ item.date }}</text>
          <view class="divider"></view>
          <text class="view-details" @click="viewDetails(index)">浏览详情</text>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      caseList: [
        {
          image: '/static/image1.jpg',
          industry: '一般工业/通讯设备和元器件',
          finalProduct: 'FPC',
          appliedProduct: '3764-Q',
          tags: ['视频', '精华', '置顶'],
          date: '2022-02-10',
        },
        {
          image: '/static/image2.jpg',
          industry: '一般工业/五金',
          finalProduct: '窗帘盒',
          appliedProduct: 'CIP66',
          tags: ['精华', '置顶'],
          date: '2024-02-29',
        },
        {
          image: '/static/image3.jpg',
          industry: '一般工业/运动器材',
          finalProduct: '碳纤维自行车',
          appliedProduct: '2214C',
          tags: ['精华', '置顶'],
          date: '2021-09-17',
        },
      ],
    };
  },
  methods: {
    viewDetails(index) {
      // 根据索引处理点击事件，例如跳转到详情页面
      console.log('查看详情:', this.caseList[index]);
      // 这里可以使用uni.navigateTo方法跳转到详情页面，假设详情页面为detail
      uni.navigateTo({
        url: `/pages/detail/detail?index=${index}`,
      });
    },
  },
};
</script>

<style scoped>
.container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #f8f8f8;
}
.header {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 50px;
  background-color: #fff;
  border-bottom: 1px solid #ddd;
}
.header text {
  font-size: 18px;
  font-weight: bold;
}
.content {
  flex: 1;
  padding: 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.case {
  width: 90%;
  display: flex;
  flex-direction: column;
  padding: 15px;
  background-color: #fff;
  margin-bottom: 10px;
  border-radius: 5px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}
.case-content {
  display: flex;
  flex-direction: row;
  align-items: center;
}
.case-image {
  width: 30%;
  height: 150px;
  background-color: #e0e0e0;
  border-radius: 5px;
  margin-right: 10px;
}
.case-details {
  flex: 1;
  display: flex;
  flex-direction: column;
}
.industry, .product, .appliedProduct {
  margin-bottom: 5px;
  font-size: 14px;
  color: #333;
}
.tags {
  display: flex;
  flex-direction: row;
  margin-top: 5px;
}
.tag {
  margin-right: 5px;
  padding: 2px 5px;
  background-color: #ff4d4f;
  color: #fff;
  font-size: 12px;
  border-radius: 3px;
}
.footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 10px;
  border-top: 1px solid #eee;
  margin-top: 10px;
}
.date, .view-details {
  font-size: 12px;
  color: #999;
  text-align: center;
  flex: 1;
}
.divider {
  width: 1px;
  height: 12px;
  background-color: #ddd;
  margin: 0 10px;
}
</style>
