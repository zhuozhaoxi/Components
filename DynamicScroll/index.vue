<template>
  <div class="t-scroll"
       ref="$scroll"
       :style="{ height: this.scrollViewHeight + 'px' }"
       @scroll.passive="onScroll">
    <div class="t-scroll-padding-top" :style="{height: scrollData.paddingTop + 'px'}"></div>

    <div ref="$cell" v-for="item in scrollData.displayCells">
      <slot name="cell" :cell="item"></slot>
    </div>

    <div class="t-scroll-padding-bottom" :style="{height: scrollData.paddingBottom + 'px'}"></div>
  </div>
</template>

<script>
  import ScrollManager from './ScrollManager'

  let manager
  let lastScrollTop
  let heightFixed = true
  let t
  let lastRunTime

  export default {
    name: 'DynamicScroll',
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
      }
    },

    methods: {
      initScrollManager () {
        manager = new ScrollManager({
          list: this.list,
          scrollViewHeight: this.scrollViewHeight,
          cellHeight: this.cellHeight,
          cellCacheNumber: this.cellCacheNumber,
          firstRenderNumber: 10
        })
      },

      updateScrollRender (updateScrollHeight = false) {
        this.scrollData = manager.getRenderInfo()
        this.$forceUpdate()
        // 更新完成后矫正滚动条位置
        this.$nextTick(() => {
          this.$refs.$scroll.scrollTop = lastScrollTop;
          if (!heightFixed) {
            manager.updateCellHeight(
              this.$refs.$cell.map(item => item.getBoundingClientRect().height)
            )
            // 动态高度时， 初次初始化时计算滑动的总高度
            if(updateScrollHeight){
              manager.updateScrollHeight()
              this.scrollData = manager.getRenderInfo()
            }
          }
        })
      },

      onScroll () {
        clearTimeout(t)
        t = setTimeout(()=>{
          this.handleScroll(this.$refs.$scroll.scrollTop, true)
        }, 100)
        let current = new Date().getTime()
        if(lastRunTime === undefined || current - lastRunTime > 100){
          lastRunTime = current
          this.handleScroll(this.$refs.$scroll.scrollTop)
        }
      },

      // 处理滚动，重新渲染列表
      // updateScrollHeight 是否需要更新scrollHeight， 整个滚动窗口的大小
      handleScroll(scrollTop, updateScrollHeight = false){
        lastScrollTop = scrollTop;
        manager.updateScroll(lastScrollTop);
        this.updateScrollRender(updateScrollHeight)
      },
    },
    watch: {
      list (nList) {
        manager.updateList(nList)
        this.handleScroll(this.$refs.$scroll.scrollTop, true)
      },
      scrollViewHeight (n){
        manager.updateScrollViewHeight(n)
        this.handleScroll(this.$refs.$scroll.scrollTop, true)
      }
    },
    mounted () {
      if (!this.cellHeight) heightFixed = false
      this.initScrollManager()
      this.updateScrollRender(true)
    }
  }
</script>

<style scoped>
  .t-scroll  {
    overflow-y: scroll;
  }
</style>
