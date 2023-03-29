import request from '@/utils/request'

export const getCustList = params => {
  return request({
    url: '/api/admin/getcustlist',
    method: 'get',
    params,
  })
}

export const createCust = params => {
  return request({
    url: '/api/admin/createcust',
    method: 'get',
    params,
  })
}
