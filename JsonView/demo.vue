<template>
	<json-view :data="json"></json-view>
</template>

<script>
  import JsonView from './index'
  import DynamicScroll from 'Components/DynamicScroll'

  export default {
    name: 'Scroll',
    components: { DynamicScroll,JsonView },
    data(){
      return {
        json: {
          a: 1,
          b: true,
          c: false,
          d: undefined,
          e: null,
          f: '<span>for html test</span>',
          g: '"string"',
          h: [
            1,
            true,
            false,
            undefined,
            null,
            'string',
            {
              a: 1,
              b: true,
              c: false,
              d: undefined,
              e: null,
              f: 'string',
              g: '"string"',
            },
            {
              a: 1,
              b: true,
              c: false,
              d: undefined,
              e: null,
              f: 'string',
              g: '"string"',
              h: [
                1,
                true,
                false,
                undefined,
                null,
                'string',
                {
                  a: 1,
                  b: true,
                  c: false,
                  d: undefined,
                  e: null,
                  f: 'string',
                  g: '"string"',
                }
              ]
            },
            {
              a: 1,
              b: true,
              c: false,
              d: undefined,
              e: null,
              f: 'string',
              g: '"string"',
              h: [
                1,
                true,
                false,
                undefined,
                null,
                'string',
                {
                  a: 1,
                  b: true,
                  c: false,
                  d: undefined,
                  e: null,
                  f: 'string',
                  g: '"string"',
                }
              ]
            },
            {
              a: 1,
              b: true,
              c: false,
              d: undefined,
              e: null,
              f: 'string',
              g: '"string"',
              h: [
                1,
                true,
                false,
                undefined,
                null,
                'string',
                {
                  a: 1,
                  b: true,
                  c: false,
                  d: undefined,
                  e: null,
                  f: 'string',
                  g: '"string"',
                }
              ]
            },
            {
              a: 1,
              b: true,
              c: false,
              d: undefined,
              e: null,
              f: 'string',
              g: '"string"',
              h: [
                1,
                true,
                false,
                undefined,
                null,
                'string',
                {
                  a: 1,
                  b: true,
                  c: false,
                  d: undefined,
                  e: null,
                  f: 'string',
                  g: '"string"',
                }
              ]
            }
          ]
        }
      }
    }
  }
</script>
