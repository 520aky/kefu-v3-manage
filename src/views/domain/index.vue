<template>
  <pro-table ref="table" :title="$t('domain.title')" :request="getList" :columns="columns" :search="searchConfig" @selectionChange="handleSelectionChange">
    <!-- 工具栏 -->
    <template #toolbar>
      <!-- <el-button type="primary" icon="Delete">
        {{ $t('test/list.batchDelete') }}
      </el-button> -->
      <el-button type="primary" icon="Plus" @click="showAdddDomainDialog">
        {{ $t('domain.add') }}
      </el-button>
      <el-button type="primary" icon="Refresh" @click="refresh">
        {{ $t('test/list.refresh') }}
      </el-button>
    </template>
    <template #status="{row}">
      <el-tag :type="row.c_state === 0 ? 'danger' : row.c_state === 1 ? 'success' : 'warning'">
        {{ row.c_state === 0 ? '关闭' : row.c_state === 1 ? '开启' : '失效' }}
      </el-tag>
    </template>
    <template #type="{row}">
      <el-tag :type="row.c_type === 0 ? 'success' : ''">
        {{ row.c_type === 0 ? '入口域名' : '落地域名' }}
      </el-tag>
    </template>
    <template #customindex="scope">
      {{ CustomIndex(scope.$index) }}
    </template>

    <template #operate="{row}">
      <el-button size="small" type="primary" @click="showEditDialog(row)">
        {{ $t('public.edit') }}
      </el-button>
      <el-button size="small" type="danger" @click="delDomainClick(row)">
        {{ $t('public.delete') }}
      </el-button>
    </template>
  </pro-table>

  <el-dialog v-model="isShowAddDomainDialog" :title="isAdd ? '添加域名' : '修改域名'" width="30%" destroy-on-close class="add-domain">
    <template #default>
      <el-form :model="domainObj" :rules="rules" ref="ruleFormRef">
        <el-form-item prop="url" label="域名">
          <el-input type="text" class="mb5" v-model="domainObj.url" :disabled="!isAdd"></el-input>
        </el-form-item>
        <el-form-item prop="type" label="类型" v-if="isAdd">
          <el-select class="mb5 add-domain-select" v-model="domainObj.type" placeholder="请选择" size="large">
            <el-option v-for="item in type_options" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item prop="state" label="状态">
          <el-select class="mb5 add-domain-select" v-model="domainObj.state" placeholder="请选择" size="large">
            <el-option v-for="item in state_options" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button @click="isShowAddDomainDialog = false">取消</el-button>
          <el-button type="primary" @click="isAdd ? addDomainClick(ruleFormRef) : editDomainClick(ruleFormRef)" v-loading="loading">确定</el-button>
        </el-form-item>
      </el-form>
    </template>
    <!-- <template #footer>
      <span class="dialog-footer">
        <el-button @click="isShowAddDomainDialog = false">取消</el-button>
        <el-button type="primary" @click="addDomainClick" v-loading="loading">确定</el-button>
      </span>
    </template> -->
  </el-dialog>
</template>

<script setup>
import { getDomainList, addDomain, setDomain, delDomain } from '@/api/domain.js'
import { reactive, getCurrentInstance, toRefs, ref, toRef } from 'vue'
import { useApp } from '@/pinia/modules/app'
import { AesEncryption } from '@/utils/encrypt'
import { param } from '@/utils'
import domain from '@/router/modules/domain'
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
      label: 'domain.c_domain',
      prop: 'c_domain',
      //sortable: true,
      width: 300,
    },
    {
      label: 'domain.c_state',
      tdSlot: 'status',
      minWidth: 80,
    },
    {
      label: 'domain.c_type',
      tdSlot: 'type',
      minWidth: 80,
    },
    {
      label: 'card.c_time',
      prop: 'c_time',
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
        label: 'domain.c_domain',
        name: 'c_domain',
        defaultValue: '',
      },
      {
        type: 'select',
        label: 'domain.c_type',
        name: 'c_type',
        defaultValue: 0,
        options: [
          {
            name: 'domain.domain_fall',
            value: 1,
          },
          {
            name: 'domain.domain_enter',
            value: 0,
          },
        ],
      },
      {
        type: 'select',
        label: 'domain.c_state',
        name: 'c_state',
        defaultValue: 0,
        options: [
          {
            name: 'public.closed',
            value: 0,
          },
          {
            name: 'public.opened',
            value: 1,
          },
          {
            name: 'public.invalid',
            value: 2,
          },
        ],
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
    const { code, msg, result } = await getDomainList({ page: current, limit: size })
    if (code != 0) {
      return ctx.$message({
        duration: 1000,
        message: msg,
        type: 'error',
      })
    }
    let res = JSON.parse(new AesEncryption({ key: authorization.token.substring(0, 16) }).decryptByAES(result))
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

import { ElMessageBox } from 'element-plus'
// 删除域名
const delDomainClick = row => {
  ElMessageBox.confirm('确定删除吗?', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(async () => {
    try {
      let params = { id: row.id }
      const { msg } = await delDomain(params)
      ctx.$message({
        duration: 1000,
        message: msg,
        type: 'error',
      })
      refresh()
    } catch (error) {
      console.log('delDomainClick error:', error)
    }
  })
}

const { getList, searchConfig, columns, handleSelectionChange } = toRefs(obj)

const isShowAddDomainDialog = ref(false)
const domainObj = reactive({
  url: '',
  type: '',
  state: '',
  id: '',
  loading: false,
})
const { loading } = toRefs(domainObj)

const showAdddDomainDialog = () => {
  isShowAddDomainDialog.value = true
  domainObj.url = ''
  domainObj.type = 0
  domainObj.state = 1
  domainObj.id = ''
  isAdd.value = true
}
const type_options = [
  { value: 0, label: '入口域名' },
  { value: 1, label: '落地域名' },
]
const state_options = [
  { value: 0, label: '关闭' },
  { value: 1, label: '开启' },
]

const isAdd = ref(true)
const showEditDialog = row => {
  isShowAddDomainDialog.value = true
  isAdd.value = false
  domainObj.id = row.id
  domainObj.state = row.c_state
  domainObj.type = row.c_type
  domainObj.url = row.c_domain
}
// 修改域名
const editDomainClick = async formEl => {
  if (!formEl) return
  await formEl.validate(async (valid, fields) => {
    if (valid) {
      domainObj.loading = true
      try {
        let params = { id: domainObj.id, state: domainObj.state }
        const { msg } = await setDomain(params)
        ctx.$message({
          duration: 1000,
          message: msg,
          type: 'error',
        })

        isShowAddDomainDialog.value = false
        refresh()
      } catch (error) {
        console.log('edit domain error:', error)
      } finally {
        domainObj.loading = false
      }
    }
  })
}

// 添加域名
const addDomainClick = async formEl => {
  if (!formEl) return
  await formEl.validate(async (valid, fields) => {
    if (valid) {
      domainObj.loading = true
      try {
        let params = { url: domainObj.url, type: domainObj.type, state: domainObj.state }
        const { code, msg } = await addDomain(params)
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
        isShowAddDomainDialog.value = false
        refresh()
      } catch (error) {
        console.log('addDomainClick error:', error)
      } finally {
        domainObj.loading = false
      }
    } else {
      console.log('error submit!', fields)
    }
  })
}
const ruleFormRef = ref('')

const rules = reactive({
  url: [
    { required: true, message: '请输入域名', trigger: 'blur' },
    { pattern: /(http|https):\/\/([\w.]+\/?)\S*/, message: '只能以http或https开头', trigger: 'blur' },
  ],
  type: [{ required: true, message: '请输入域名', trigger: 'blur' }],
  state: [{ required: true, message: '请输入域名', trigger: 'blur' }],
})
</script>

<style scoped>
.mb5 {
  margin-bottom: 5px;
}
.pr2 {
  padding-right: 2px;
}
.add-domain-select {
  width: 100%;
}
.adddomain-btn {
  display: flex;
  justify-content: flex-end;
}
</style>
