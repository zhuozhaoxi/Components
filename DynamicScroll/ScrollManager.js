/**
 * 初始源码来源于：简书， 链接https://www.jianshu.com/p/fc87ab7c52ea
 * 这里对代码中的一些bug和体验不好的地方进行了调整。
 * 1、bug修复，动态高度时，使用鼠标直接拖动滑到进行快速滚动到底部时， 列表显示异常的问题
 * 2、体验优化，动态高度时，连续滑动的情况下，滑块位置会上下移动，
 * 3、功能追加
 *        appendList方法，支持数据追加
 *        updateList，支持数据更新
 *        updateScrollViewHeight，可视窗口高度数据更新
 *
 *  调用步骤
 *  1、实例化 ScrollManager 类
 *    const manager = new ScrollManager({ ... })
 *
 *  2、实例化完成后，通过 getRenderInfo 获取首次渲染的数据
 *    let renderList = manager.getRenderInfo()
 *
 *  3、需要注意的是，当列表重新渲染后可能会引发滚动条位置的改变，所以需要在页面完成渲染后重新将滚动条定位到准确的位置
 *  $scrollElement 为滚动列表容器
 *  lastScrollTop 为上一次滚动后的滚动条高度，初始值为 0
 *  该值需要在每次触发滚动事件时进行更新
 *    $scrollElement.scrollTop = lastScrollTop
 *  注意： 如果渲染结果的容器和滚动条的容器不是同一个，可以不用这一步
 *
 *  4、对于高度不定的列表来说，需要在渲染完成后调用更新cell高度的方法
 *  manager.updateCellHeight([cellHeight1, cellHeight2, ...])
 *  可以通过下面的方式获取到cell的高度值
 *  $cell 为单个cell节点
 *    let height = $cell.getBoundingClientRect().height
 *
 *  5、对于高度不定的列表，初始渲染时是没有预估的整体高度的，需要在渲染完成后更新整个列表预估高度
 *  （这一步是体验优化，滚动条不可见的，可以忽略）
 *    // 这里其实只更新了scrollHeight, paddingBottom
 *    5.1 manager.updateScrollHeight()
 *    // 将预估高度渲染进去
 *    5.2 renderList = manager.getRenderInfo()
 *
 *  6、监听滚动列表容器的滚动事件，调用manager.updateScroll()进行动态列表更新
 *     然后重复执行 2 3 4 步
 *    $scrollElement.onScroll = () => {
 *      lastScrollTop = this.$refs.$scroll.scrollTop
 *      manager.updateScroll(lastScrollTop)
 *      // TODO 2,3,4,(5.1)
 *    }
 *
 *  7、对于高度不定的列表，监听列表滚动结束事件，调用 5 步
 *    滚动结束时再渲染列表高度，可以避免滚动过程中，滚动条滑块上下移动，带来的不好体验。
 *    随之而来的问题是，直接将滑块快速拖动到底部时，并不能渲染到最后的内容
 *    不想这么做的话，可以将第5.1步放到 6 中执行
 *
 *  appendList支持，用于追加数据
 *    manager.appendList([cellInfo1,cellInfo2...]);
 *    manager.getRenderInfo();
 *
 *  updateList支持，用于更新数据， 尽量保留当前滚动位置， 记录当前滚动位置，数据更新完毕后，使用当前scrollTop获取渲染内容，同6
 *  如果整个列表数据都改变的话，建议重新新建一个Manager
 *    manager.updateList(newList);
 *    lastScrollTop = this.$refs.$scroll.scrollTop
 *    manager.updateScroll(lastScrollTop)
 *    // TODO 2,3,4,(5.1)
 *
 *  updateScrollViewHeight支持， 用于更新可视窗口大小
 *    manager.updateScrollViewHeight(height)
 *    lastScrollTop = this.$refs.$scroll.scrollTop
 *    manager.updateScroll(lastScrollTop)
 *    // TODO 2,3,4,(5.1)
}
 */
export default class ScrollManager {
  // 构造器方法
  constructor ( {
                  list, // 待渲染的列表数据 Array
                  scrollViewHeight, // 滚动视图的高度，即滚动区域可见部分的高度
                  cellHeight, // 每个 item 的高度，如果设置了该值则认为是固定高度列表
                  cellCacheNumber, // 上下两方缓冲的item数量
                  firstRenderNumber // 动态高度时单屏初次渲染的列表数量
                } ) {
    // 滚动可视区域与滚动列表高度
    this.scrollViewHeight = this.scrollHeight = scrollViewHeight
    // cell平均高度 等于0则为动态高度
    this.cellHeight = cellHeight
    this.heightFixed = !!cellHeight
    // 预加载的cell数量
    this.cellCacheNumber = cellCacheNumber || 3
    // 单屏渲染数量
    this.renderNumber = firstRenderNumber || 10

    // 滚动区域上下撑开的高度
    this.paddingTop = this.paddingBottom = 0
    // cell的高度数据缓存，只在不固定高度时有效
    this.heightCache = new Array(list ? list.length : 0).fill(this.cellHeight)
    // 渲染列表
    this.list = list
    // 待渲染列表
    this.displayCells = []
    // 当前待渲染列表的第一个元素在全部列表中的位置
    this.passedCells = 0
    // 当前渲染的cells的总高度
    this.currentCellsTotalHeight = 0

    this.initScroll()
  }

  // 初始化滚动列表
  // 计算首屏需要渲染的items和缓冲items
  initScroll () {
    if (this.heightFixed) { // cell高度固定时，校正滑动区域总高度，计算单屏渲染的cell数量及底部支撑高度
      this.scrollHeight = this.list.length * this.cellHeight
      this.renderNumber = Math.ceil(this.scrollViewHeight / this.cellHeight)
      this.displayCells = this.list.slice(0, this.renderNumber + this.cellCacheNumber * 2)
      this.paddingBottom = this.scrollHeight - this.displayCells.length * this.cellHeight
    } else { // cell高度不固定时，渲染初次加载的单屏cell数量
      this.displayCells = this.list.slice(0, this.renderNumber + this.cellCacheNumber * 2)
    }
  }

  // 数据追加
  // 需要更新整个滑动区域的高度，以及下方撑起的高度
  appendList(concatList){
    this.list = this.list.concat(concatList);
    this.heightCache = this.heightCache.concat(new Array(concatList ? concatList.length : 0).fill(this.cellHeight))
    this.updateScrollHeight()
  }

  // 数据源更新
  // 尽量复用之前缓存的高度数据，只考虑不打乱顺序下的高度复用
  updateList(newList){
    if (this.heightFixed) {
      this.list = newList;
      this.heightCache = new Array(newList ? newList.length : 0).fill(this.cellHeight)
      this.scrollHeight = this.list.length * this.cellHeight
    }else{
      let oldList = this.list,oldCache = this.heightCache
      this.heightCache = new Array(newList ? newList.length : 0).fill(this.cellHeight)
      this.list = newList;
      let i = 0,j = 0
      while(i < newList.length && j < oldList.length){
        if(newList[i] === oldList[j]){
          this.heightCache[i] = oldCache[j];
          i++;
          j++;
        }else{
          j++;
        }
      }
    }
  }

  // 滚动时更新数据
  // 根据滚动条高度计算已经划出屏幕并且不再需要渲染的items
  // 更新需要渲染的items和缓冲items
  // 并更新列表上方和下方需要支撑起的高度
  updateScroll (scrollTop) {
    if (this.heightFixed) {
      this.passedCells = Math.floor(scrollTop / this.cellHeight)

      this._adjustCells()

      this.currentCellsTotalHeight = this.displayCells.length * this.cellHeight
      this.paddingTop = this.passedCells * this.cellHeight;
    } else {
      let passedCellsHeight = 0
      for (let i = 0; i < this.heightCache.length; i++) {

        if (scrollTop < passedCellsHeight){
          break;
        }
        this.passedCells = i
        if(!this.heightCache[i]){
          this.heightCache[i] = this.cellHeight
        }
        passedCellsHeight += this.heightCache[i]
      }

      this._adjustCells()

      this.paddingTop = this.heightCache.reduce((sum, height, index) => {
        if (index < this.passedCells){
          if (height) return sum + height
          return sum + this.cellHeight
        }
        return sum
      }, 0)
    }
    this.paddingBottom = this.scrollHeight - this.paddingTop - this.currentCellsTotalHeight
    if (this.paddingBottom < 0) this.paddingBottom = 0
  }

  // 内部调用的调整items相关数据的方法
  // 包括已经不需要渲染的items和需要渲染的items
  _adjustCells () {
    this.passedCells = this.passedCells > this.cellCacheNumber ? this.passedCells - this.cellCacheNumber : 0
    this.displayCells = this.list.slice(this.passedCells, this.renderNumber + this.cellCacheNumber * 2 + this.passedCells)
  }

  // 动态高度时根据已缓存的cell高度计算平均高度，方法接受当前渲染的cells的高度数组
  // 对已经渲染过的cell高度进行缓存，保证上方的支撑高度计算准确
  // 为了保持滑动的过程中，整体高度不发生改变，这里不更新整个滑动列表的总高度
  // 等待滚动结束时（监听scrollEnd事件），手动调用updateScrollHeight，更新高度
  updateCellHeight (cellsHeightInfo) {
    if (this.heightFixed) return

    // 更新平均cell高度
    this.currentCellsTotalHeight = cellsHeightInfo.reduce((sum, height) => sum + height, 0)
    this.cellHeight = Math.round(this.currentCellsTotalHeight / cellsHeightInfo.length)

    this.renderNumber = Math.ceil(this.scrollViewHeight / this.cellHeight)
    // 保存已知cell的高度信息
    this.heightCache.splice(this.passedCells, cellsHeightInfo.length, ...cellsHeightInfo)
  }

  // 对未渲染过的cell高度进行预估，保证下方的支撑高度尽量靠近实际高度
  // 调整整个滑动列表的总高度
  updateScrollHeight(){
    // 预估滑动区域总高度
    this.scrollHeight = this.heightCache.reduce((sum, height) => {
      if (height) return sum + height
      return sum + this.cellHeight
    }, 0)
    this.paddingBottom = this.scrollHeight - this.paddingTop - this.currentCellsTotalHeight
    if (this.paddingBottom < 0) this.paddingBottom = 0
  }

  // 可视窗口高度更改
  updateScrollViewHeight(height){
    this.scrollViewHeight = height
    if(this.cellHeight){
      this.renderNumber = Math.ceil(this.scrollViewHeight / this.cellHeight)
    }
  }

  // 获取待渲染的items及相关数据
  getRenderInfo () {
    return {
      scrollHeight: this.scrollHeight,
      paddingTop: this.paddingTop,
      paddingBottom: this.paddingBottom,
      displayCells: this.displayCells,
    }
  }
}
