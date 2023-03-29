<template>
  <pro-table ref="table" :title="$t('user.title')" :request="getList" :columns="columns" :search="searchConfig" @selectionChange="handleSelectionChange">
    <!-- 工具栏 -->
    <template #toolbar>
      <!-- <el-button type="primary" icon="Delete">
        {{ $t('test/list.batchDelete') }}
      </el-button> -->
      <el-button type="primary" icon="Plus" @click="showDialog">
        {{ $t('user.add') }}
      </el-button>
      <el-button type="primary" icon="Refresh" @click="refresh">
        {{ $t('test/list.refresh') }}
      </el-button>
    </template>

    <template #status="{row}">
      <el-tag :type="row.c_state === 1 ? 'success' : 'danger'">
        {{ row.c_state === 0 ? $t('card.unused') : $t('card.used') }}
      </el-tag>
    </template>

    <template #top="{row}">
      <el-tag :type="row.c_top === 1 ? 'success' : 'danger'">
        {{ row.c_top === 1 ? $t('user.top') : $t('user.notop') }}
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

  <el-dialog v-model="isShowDialog" title="添加用户" width="30%" destroy-on-close>
    <template #default>
      <el-input type="number" class="mb5" v-model="userObj.number">
        <template #prefix>
          <span class="pr2">数量</span>
        </template>
      </el-input>
      <el-input type="number" class="mb5" v-model="userObj.day">
        <template #prefix>
          <span class="pr2">天数</span>
        </template>
      </el-input>
    </template>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="isShowDialog = false">取消</el-button>
        <el-button type="primary" @click="userBtnClick" v-loading="loading">确定</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup>
import { getUserList } from '@/api/user.js'
import { reactive, getCurrentInstance, toRefs, ref, toRef } from 'vue'
import { useApp } from '@/pinia/modules/app'
import { AesEncryption } from '@/utils/encrypt'
import { param } from '@/utils'
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
    { label: 'public.index', tdSlot: 'customindex', width: 80 },
    {
      label: 'user.user',
      prop: 'c_user',
      //sortable: true,
      width: 300,
    },
    {
      label: 'user.nick',
      prop: 'c_nick',
      minWidth: 120,
    },
    {
      label: 'user.pic',
      tdSlot: 'imgurl',
      minWidth: 120,
    },
    {
      label: 'user.note',
      prop: 'c_note',
      minWidth: 120,
    },
    {
      label: 'user.top',
      tdSlot: 'top',
      minWidth: 120,
    },
    {
      label: 'user.time',
      prop: 'c_time',
      minWidth: 180,
    },
    {
      label: 'user.ip',
      prop: 'c_ip',
      minWidth: 120,
    },
    {
      label: 'user.addr',
      prop: 'c_addr',
      minWidth: 180,
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
        label: 'user.user',
        name: 'c_user',
        defaultValue: '',
      },
      {
        type: 'select',
        label: 'card.c_state',
        name: 'c_state',
        defaultValue: 1,
        options: [
          {
            name: 'card.used',
            value: 1,
          },
          {
            name: 'card.unused',
            value: 0,
          },
        ],
      },
      {
        type: 'text',
        label: 'user.note',
        name: 'c_note',
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
    const { code, msg, result } = await getUserList({ page: current, limit: size })
    if (code != 0) {
      return ctx.$message({
        duration: 1000,
        message: msg,
        type: 'error',
      })
    }
    let res = JSON.parse(new AesEncryption({ key: authorization.token.substring(0, 16) }).decryptByAES(result))
    // console.log(res)
    const { count, list } = res
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

const isShowDialog = ref(false)
const userObj = reactive({
  number: '',
  day: '',
  loading: false,
})
const { loading } = toRefs(userObj)

const showDialog = () => {
  isShowDialog.value = true
  userObj.number = ''
  userObj.day = ''
}

// 创建客服
const userBtnClick = async () => {
  // cardObj.loading = true
  // try {
  //   const { code, msg } = await createCard({ number: cardObj.number, day: cardObj.day })
  //   if (code != 0) {
  //     return ctx.$message({
  //       duration: 1000,
  //       message: msg,
  //       type: 'error',
  //     })
  //   }
  //   ctx.$message({
  //     duration: 1000,
  //     message: '添加成功',
  //     type: 'success',
  //   })
  //   isShowAddCardDialog.value = false
  //   refresh()
  // } catch (error) {
  //   console.log('addCardClick error:', error)
  // } finally {
  //   cardObj.loading = false
  // }
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
