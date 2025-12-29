import request from '@/utils/request'

export function getRouterList(data) {
  return request({
    url: '/menu/navigate',
    method: 'post',
    data,
  })
}

/**
 * 获取菜单树（用于动态菜单）
 * @returns {Promise}
 */
export function getMenuTree() {
  return request({
    url: '/menu/tree',
    method: 'get',
  })
}


/**
 * 获取当前用户动态菜单
 * @returns {Promise}
 */
export function getCurrentMenuTree() {
  return request({
    url: '/menu/current/menu/tree',
    method: 'get',
  })
}