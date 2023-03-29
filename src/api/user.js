import request from '@/utils/request'

export const getUserList = params => {
  return request({
    url: '/api/admin/getuserlist',
    method: 'get',
    params,
  })
}
