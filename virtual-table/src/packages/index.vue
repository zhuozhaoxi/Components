<template>
  <div class="zx-virtual-table-list"
       ref="$scroll"
       :style="{ height: this.scrollViewHeight + 'px' }"
       @scroll.passive="onScroll">
    <slot name="before" :data="scrollData"></slot>
    <div class="zx-virtual-table-list-phantom" :style="{height: scrollData.scrollHeight+'px'}"></div>
    <div class="zx-virtual-table-list-content" :style="{transform: `translateY(${scrollData.paddingTop}px)`}">
      <div ref="$cell" v-for="item in scrollData.displayCells">
        <slot name="cell" :cell="item"></slot>
      </div>
    </div>
    <slot name="after" :data="scrollData"></slot>
  </div>
</template>

<script>
  import ScrollManager from './ScrollManager'

  export default {
    name: 'VirtualTable',
    props: {
      scrollViewHeight: {
        type: Number,
        required: true
      },

      list: {
        type: Array,
        required: true
      },
      // cell缓存数量 即不在可视区域内的预加载数量
      cellCacheNumber: {
        type: Number,
        default: 3
      },
      // cell高度值 如果为0或不传则为动态高度 不为0则为固定高度
      cellHeight: {
        type: Number,
        default: 0
      },

    },
    data () {
      return {
        scrollData: {
          scrollHeight: 0,
          paddingTop: 0,
          paddingBottom: 0,

          displayCells: []
        },
        manager: null,
        heightFixed: true,
        t: undefined
      }
    },

    methods: {
      initScrollManager () {
        this.manager = new ScrollManager({
          list: this.list,
          scrollViewHeight: this.scrollViewHeight,
          cellHeight: this.cellHeight,
          cellCacheNumber: this.cellCacheNumber,
          firstRenderNumber: 10
        })
      },

      updateScrollRender (updateScrollHeight = false) {
        this.scrollData = this.manager.getRenderInfo()
        this.$forceUpdate()
        if (!this.heightFixed) {
          this.$nextTick(() => {
            this.manager.updateCellHeight(
              this.$refs.$cell.map(item => item.getBoundingClientRect().height)
            )
            // 动态高度时， 初次初始化和滚动事件结束时计算滑动的总高度
            if(updateScrollHeight){
              this.manager.updateScrollHeight()
              this.scrollData = this.manager.getRenderInfo()
            }
          })
        }
      },

      onScroll () {
        clearTimeout(this.t)
        // 300ms防抖，当作滚动结束，此时更新整体高度
        this.t = setTimeout(()=>{
          this.handleScroll(this.$refs.$scroll.scrollTop, true)
        }, 300)
        this.handleScroll(this.$refs.$scroll.scrollTop)
      },

      // 处理滚动，重新渲染列表
      // updateScrollHeight 是否需要更新scrollHeight， 整个滚动窗口的大小
      handleScroll(scrollTop, updateScrollHeight = false){
        this.manager.updateScroll(scrollTop);
        this.updateScrollRender(updateScrollHeight)
      },
    },
    watch: {
      list (nList) {
        this.manager.updateList(nList)
        this.handleScroll(this.$refs.$scroll.scrollTop, true)
      },
      scrollViewHeight (n){
        this.manager.updateScrollViewHeight(n)
        this.handleScroll(this.$refs.$scroll.scrollTop, true)
      }
    },
    mounted () {
      if (!this.cellHeight) this.heightFixed = false
      this.initScrollManager()
      this.updateScrollRender(true)
    }
  }
</script>

<style scoped>
  .zx-virtual-table-list  {
    position: relative;
    overflow-y: scroll;
  }
  .zx-virtual-table-list-phantom{
    position: absolute;
    left: 0;
    top: 0;
    right: 0;
    z-index: -1;
  }
  .zx-virtual-table-list-content{
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
  }
</style>
