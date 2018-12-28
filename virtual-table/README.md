# virtual-table

> vue virtual table for rendering long lists

## Install

``` bash
# install dependencies
npm install zx-vue-virtual-table --save
```

## How to use
```
# import package
import VirtualTable from 'zx-vue-virtual-table'

# declare component
Vue.component('virtual-table', VirtualTable)

# useage
<virtual-table :list="cells" :scrollViewHeight="736">
  <div slot="cell" slot-scope="props">
    {{props.cell.text}}
  </div>
</virtual-table>
```

## Attributes

Attribute | Type | Description | Default    
---|---|---|---
scroll-view-height | int | Table height, required | ---
list | array | Table data, required | ---
cell-cache-number | int | Pre-rendered quantity | 3
cell-height | int | cell height, 0 means dynamic height, other means fixed height | 0

## Slots

Name | Description | Parameters
---|---|---
before | will insert before virtual table | data:array (current rendered data) 
after | will insert after virtual table | data:array (current rendered data)
cell | render template for each item | cell: --- (item of table data) 



