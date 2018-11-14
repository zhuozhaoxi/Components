<template>
  <dynamic-scroll :list="displayList" :scrollViewHeight="height" :cellCacheNumber="50"
                  style="position: relative" :style="{'padding-left': gutterWidth+'px'}" class="JsonView-wrapper">
    <div slot="before" class="JsonView-gutters" slot-scope="props" :style="{height: props.data.scrollHeight+'px'}">
      <!-- 行数占位 -->
      <div class="JsonView-gutter JsonView-line-numbers" :style="{width: lineNumberWidth+8+'px'}"></div>
      <!-- 展开符占位 -->
      <div class="JsonView-gutter JsonView-fold-gutter"></div>
    </div>
    <div slot="cell" slot-scope="props" :style="{'padding-left': gutterWidth+'px'}">
      <div class="JsonView-gutter-wrapper">
        <div class="JsonView-gutter-elt JsonView-line-number" :style="{width: lineNumberWidth+'px'}">{{ props.cell.line }}</div>
        <div :style="{left: lineNumberWidth+8+'px', width: subtleWidth+'px'}"
             v-if="props.cell.isFolder"
             @click="toggleFolder(props.cell)"
             :class="{'JsonView-fold-gutter-folded': !props.cell.open }"
             class="JsonView-gutter-elt JsonView-gutter-subtle">
          <i class="icon-caret-bottom json-dict-toggle"></i>
        </div>
      </div>
      <pre class="JsonView-line"><span v-html="props.cell.fullStr"></span><template v-if="!props.cell.open"><span
        class="JsonView-folded-marker"
        @click="toggleFolder(props.cell)">↔</span>{{ getEndWrapper(props.cell) }}</template></pre>
    </div>
  </dynamic-scroll>
</template>

<style lang="scss" scoped>
  @import "./index.scss";
</style>

<script>
  import DynamicScroll from 'Components/DynamicScroll'

  export default {
    data(){
      return {
        fullList: [],
        displayList: [],
        lineNumberWidth: 20,
        subtleWidth: 21
      }
    },
    computed: {
      gutterWidth: function(){
        return this.lineNumberWidth + this.subtleWidth + 8 + 1;
      }
    },
    props: {
      data: {
        default(){
          return {}
        }
      },
      height: {
        type: Number,
        default: 500
      }
    },
    components: {
      DynamicScroll
    },
    mounted(){
      this.init(this.data);
    },
    methods: {
      init: function (data) {
        let arr = this.objectToStringArr(data);
        this.displayList = this.fullList = this.createListByStringArr(arr);
        this.setWidth();
      },
      setWidth(){
        let length = this.fullList.length;
        let width = (length.toString().length) / 2  * 16;
        width = Math.max(width, 20);
        this.lineNumberWidth = width;
      },
      // 通过JSON.stringify,将object转换成string,按行分割
      objectToStringArr(object){
        let jsonStr = JSON.stringify(object, function(k,v){
          if(v === undefined){
            return "";
          }else{
            return v;
          }
        }, 4);
        return jsonStr.split("\n");
      },
      createListByStringArr(arr){
        let queue = [],currentLine,section = {};
        let list = arr.map((value, index) => {
          currentLine = index+1;
          if(this.isWrapperLine(value)){
            if(this.isWrapperLineBegin(value)){
              queue.push(currentLine)
            }else{
              section[queue.pop()] = currentLine;
            }
          }
          let fullStr = value;
          let match = value.match(/^(\s*)("(.*)":\s)?("(?=.*",?$).*"|[\da-zA-Z]+|\[|\{)(,?)$/);
          let objKey,objValue,textIndent,endChart,className,hasKey,keyString;
          if(match){
            textIndent = match[1];
            hasKey = match[2];
            objKey = match[3];
            objValue = match[4];
            endChart = match[5];
            if(hasKey){
              keyString = `<span class="json-property">"${objKey}"</span>: `;
            }else{
              keyString = '';
            }
            if(objValue === '[' || objValue === '{'){
              fullStr = `${textIndent}${keyString}${objValue}`;
            }else{
              className = this.getClassNameByValue(objValue);
              fullStr = `${textIndent}${keyString}<span class="${className}">${objValue}</span>${endChart}`;
            }
          }
          return {
            show: 1,
            isFolder: false,
            str: value,
            fullStr: fullStr, // 带html的
            line: currentLine,
            endLine: currentLine,
            open: true
          }
        });
        for (let index in section){
          if(section.hasOwnProperty(index)){
            list[index-1]['isFolder'] = true;
            list[index-1]['endLine'] = section[index];
          }
        }
        return list;
      },
      getClassNameByValue(value){
        let map = [
          ['json-string', /^".*"$/],
          ['json-bool', /^(false|true)$/],
          ['json-number', /^\d+$/]
        ];
        for(const rule of map){
          if(value.match(rule[1])){
            return rule[0];
          }
        }
        return "json-atom";
      },
      getEndWrapper(item){
        let endIndex = item.endLine - 1;
        return $.trim(this.fullList[endIndex].str);
      },
      isWrapperLine(str){
        let reg = new RegExp(/(?<!{|\[)[{}\[\]],?$/);
        return reg.test(str);
      },
      isWrapperLineBegin(str){
        let reg = new RegExp(/[{\[]$/);
        return reg.test(str);
      },
      toggleFolder(folderItem){
        let startLine = folderItem['line'],
          endLine = folderItem['endLine'];
        folderItem.open = !folderItem.open;
        let itemArr = this.fullList.slice(startLine, endLine);
        if(folderItem.open){
          itemArr.forEach(function(item){
            item.show++;
          })
        }else{
          itemArr.forEach(function(item){
            item.show--;
          })
        }
        this.displayList = this.fullList.filter(item => item.show > 0)
      }
    },
    watch: {
      data: function(n){
        this.init(n);
      }
    }
  }
</script>
