import request from '@/utils/request'

export const getCardList = params => {
  return request({
    url: '/api/admin/getcardlist',
    method: 'get',
    params,
  })
}

export const createCard = params => {
  return request({
    url: '/api/admin/createcard',
    method: 'get',
    params,
  })
}
