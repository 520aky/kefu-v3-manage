import request from '@/utils/request'

export const getDomainList = params => {
  return request({
    url: '/api/admin/getdomainlist',
    method: 'get',
    params,
  })
}

export const addDomain = params => {
  return request({
    url: '/api/admin/adddomain',
    method: 'get',
    params,
  })
}

// 修改域名

export const setDomain = params => {
  return request({
    url: '/admin/setdomain',
    method: 'get',
    params,
  })
}

export const delDomain = params => {
  return request({
    url: '/admin/deldomain',
    method: 'get',
    params,
  })
}
