<template>
  <virtual-table :list="cells" :scrollViewHeight="736">
    <div slot="cell" slot-scope="props"
         :style="props.cell.style">{{props.cell.text}}</div>
  </virtual-table>
</template>

<script>
  import VirtualTable from './packages'

  export default {
    name: 'Scroll',
    components: { VirtualTable },
    computed: {
      cells () {
        return new Array(1000).fill(1).map((item, index) => {
          return {
            style: {
              height: Math.floor(Math.random() * 100 + 100) + 'px',
              // height: '300px',
              color: '#ffffff',
              fontSize: '30px',
              background: this.getRandomColor()
            },
            text: '#' + (index + 1)
          }
        })
      }
    },
    methods: {
      getRandomColor () {
        const colors = new Array(3).fill(1).map(item => Math.floor(Math.random() * 255))
        return `rgb(${colors.join(',')})`
      }
    }
  }
</script>
