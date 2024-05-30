<template>
	<view class="jm-tabs" :style="{
		'position':absolute?'absolute':'relative'
	}">
		<text :style="{
			'flex':scroll?'inherit':1,
			'flex-shrink':scroll?0:'inherit',
			'width':width+'rpx',
			'padding-bottom':paddingBottom+'rpx',
			'color':index==defaultIndex?activeColor:'inherit',
			'border-bottom':index==defaultIndex?'2px solid '+activeColor:'inherit'
		}" v-for="(item,index) in Data" @click="onItem(item.id,index)">{{item.name}}</text>
	</view>
</template>

<script>
	export default {
		props: {
			Index:{
				type:Number,
				default:0
			},
			Data:{
				type:Array,
				default:null
			},
			scroll:{
				type:Boolean,
				default:true
			},
			width:{
				type:Number,
				default:150
			},
			absolute:{
				type:Boolean,
				default:true
			},
			activeColor:{
				type:String,
				default:'#087DFF'
			},
			paddingBottom:{
				type:String,
				default:'10'
			}
		},
		data() {
			return {
				defaultIndex:this.Index
			};
		},
		methods:{
			onItem(id,index){
				this.defaultIndex = index
				this.$emit("onItem",index)
			}
		}
	}
</script>

<style lang="scss" scoped>
	::-webkit-scrollbar{
		display: none!important;
	}
	.jm-tabs{
		font-size: 30rpx;
		display: flex;
		text-align: center;
		overflow-x:auto;
		top:var(--status-bar-height);
		left: 0;
		right: 0;
		z-index: 1;
	}
	.active{
		border-bottom:2px solid red;
		color: red;
	}
</style>