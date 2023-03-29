<template>
  <pro-table ref="table" :title="$t('kefu.title')" :request="getList" :columns="columns" :search="searchConfig" @selectionChange="handleSelectionChange">
    <!-- 工具栏 -->
    <template #toolbar>
      <!-- <el-button type="primary" icon="Delete">
        {{ $t('test/list.batchDelete') }}
      </el-button> -->
      <el-button type="primary" icon="Plus" @click="showAddCustomDialog">
        {{ $t('kefu.add') }}
      </el-button>
      <el-button type="primary" icon="Refresh" @click="refresh">
        {{ $t('test/list.refresh') }}
      </el-button>
    </template>
    <template #status="{row}">
      <el-tag :type="row.c_activ === 1 ? 'success' : 'danger'">
        {{ row.c_activ === 0 ? $t('public.nonactive') : $t('public.active') }}
      </el-tag>
    </template>
    <template #customindex="scope">
      {{ CustomIndex(scope.$index) }}
    </template>
    <template #imgurl="{row}">
      <el-image style="width: 60px; height: 50px" :src="row.c_pic" fit="fill" />
    </template>
    <template #operate="scope">
      <el-button size="small" type="primary" @click="$router.push(`/test/edit/${scope.row.id}`)">
        {{ $t('public.edit') }}
      </el-button>
      <el-button size="small" type="danger" @click="true">
        {{ $t('public.delete') }}
      </el-button>
    </template>
  </pro-table>

  <el-dialog v-model="isShowAddCustDialog" title="创建客服" width="30%" destroy-on-close>
    <template #default>
      <el-input type="number" class="mb5" v-model="kfObj.number">
        <template #prefix>
          <span class="pr2">数量</span>
        </template>
      </el-input>
      <el-input type="number" class="mb5" v-model="kfObj.day">
        <template #prefix>
          <span class="pr2">天数</span>
        </template>
      </el-input>
      <el-input type="string" placeholder="只能为2个字母或数字，默认AJ" maxlength="2" v-model="kfObj.prefix">
        <template #prefix>
          <span class="pr2">前缀</span>
        </template>
      </el-input>
    </template>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="isShowAddCustDialog = false">取消</el-button>
        <el-button type="primary" @click="addCustomClick" v-loading="loading">确定</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup>
import { getCustList, createCust } from '@/api/kefu.js'
import { reactive, getCurrentInstance, toRefs, ref, toRef } from 'vue'
import { useApp } from '@/pinia/modules/app'
import { AesEncryption } from '@/utils/encrypt'
const { proxy: ctx } = getCurrentInstance() // 可以把ctx当成vue2中的this
const { authorization } = useApp()
const CustomIndex = index => {
  const page = obj.pageIndex
  const pagesize = obj.pageSize
  return index + 1 + (page - 1) * pagesize
}
const obj = reactive({
  pageIndex: 1,
  pageSize: 10,
  // 数据表格列
  columns: [
    //{ type: 'selection', width: 56 },
    { label: 'kefu.index', tdSlot: 'customindex', width: 80 },
    {
      label: 'kefu.c_user',
      prop: 'c_user',
      sortable: true,
      width: 250,
    },
    {
      label: 'kefu.c_name',
      prop: 'c_name',
      minWidth: 100,
    },
    {
      label: 'kefu.c_pic',
      tdSlot: 'imgurl',
      minWidth: 100,
    },
    {
      label: 'public.status',
      tdSlot: 'status',
      minWidth: 80,
    },
    {
      label: 'kefu.c_day',
      prop: 'c_day',
      minWidth: 50,
    },
    {
      label: 'kefu.c_jhtime',
      prop: 'c_jhtime',
      minWidth: 120,
    },
    {
      label: 'kefu.c_dutime',
      prop: 'c_dutime',
      minWidth: 120,
    },
    {
      label: 'kefu.c_retime',
      prop: 'c_retime',
      minWidth: 120,
    },
    {
      label: 'kefu.remark',
      prop: 'remark',
      minWidth: 120,
    },
    {
      label: 'public.operate',
      width: 180,
      align: 'center',
      tdSlot: 'operate', // 自定义单元格内容的插槽名称
    },
  ],
  searchConfig: {
    labelWidth: '90px', // 必须带上单位
    inputWidth: '400px', // 必须带上单位
    fields: [
      {
        type: 'text',
        label: 'kefu.c_user',
        name: 'c_user',
        defaultValue: '',
      },
      {
        type: 'text',
        label: 'kefu.c_name',
        name: 'c_name',
        defaultValue: '',
      },
      {
        label: 'public.status',
        name: 'c_activ',
        type: 'select',
        defaultValue: 1,
        options: [
          {
            name: 'public.active',
            value: 1,
          },
          {
            name: 'public.nonactive',
            value: 0,
          },
        ],
      },
      {
        label: 'kefu.remark',
        name: 'c_jhtime',
        type: 'text',
        defaultValue: '',
      },
    ],
  },
  selectedItems: [],
  // 选择
  handleSelectionChange(arr) {
    obj.selectedItems = arr
  },
  async getList(params) {
    const { current, size } = params
    const { code, msg, result } = await getCustList({ page: current, limit: size })
    if (code != 0) {
      return ctx.$message({
        duration: 1000,
        message: msg,
        type: 'error',
      })
    }
    let res = JSON.parse(new AesEncryption({ key: authorization.token.substring(0, 16) }).decryptByAES(result))
    const { count, list } = res
    //console.log(res)
    obj.pageIndex = current
    obj.pageSize = size

    return {
      data: list,
      total: count,
    }
  },
})
const table = ref(null)
const refresh = () => {
  table.value.refresh()
}

const { getList, searchConfig, columns, handleSelectionChange } = toRefs(obj)

const isShowAddCustDialog = ref(false)
const kfObj = reactive({
  number: '1',
  day: '30',
  prefix: 'AJ',
  loading: false,
})
const { loading } = toRefs(kfObj)

const showAddCustomDialog = () => {
  isShowAddCustDialog.value = true
  kfObj.number = '1'
  kfObj.day = '30'
  kfObj.prefix = 'AJ'
}

// 创建客服
const addCustomClick = async () => {
  kfObj.loading = true
  try {
    const { code, msg } = await createCust({ number: kfObj.number, day: kfObj.day, prefix: kfObj.prefix })
    if (code != 0) {
      return ctx.$message({
        duration: 1000,
        message: msg,
        type: 'error',
      })
    }
    ctx.$message({
      duration: 1000,
      message: '添加成功',
      type: 'success',
    })
    isShowAddCustDialog.value = false
    refresh()
  } catch (error) {
    console.log('addCustomClick error:', error)
  } finally {
    kfObj.loading = false
  }
}
</script>

<style scoped>
.mb5 {
  margin-bottom: 5px;
}
.pr2 {
  padding-right: 2px;
}
</style>
