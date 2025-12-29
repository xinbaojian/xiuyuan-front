/**
 * @author https://github.com/zxwk1998/vue-admin-better （不想保留author可删除）
 * @description 路由拦截状态管理，目前两种模式：all模式与intelligence模式
 */
import { asyncRoutes, constantRoutes } from '@/router'
import { getRouterList, getMenuTree, getCurrentMenuTree } from '@/api/router'
import { convertRouter, filterAsyncRoutes } from '@/utils/handleRoutes'

const state = () => ({
  routes: [],
  partialRoutes: [],
})
const getters = {
  routes: (state) => state.routes,
  partialRoutes: (state) => state.partialRoutes,
}
const mutations = {
  setRoutes(state, routes) {
    state.routes = constantRoutes.concat(routes)
  },
  setAllRoutes(state, routes) {
    state.routes = constantRoutes.concat(routes)
  },
}
const actions = {
  /**
   * @author https://github.com/zxwk1998/vue-admin-better （不想保留author可删除）
   * @description intelligence模式设置路由
   * @param {*} { commit }
   * @param {*} permissions
   * @returns
   */
  async setRoutes({ commit }, permissions) {
    //根据permissions做路由筛选
    let accessedRoutes = filterAsyncRoutes(asyncRoutes, permissions)
    commit('setRoutes', accessedRoutes)
    return accessedRoutes
  },
  /**
   * @author https://github.com/zxwk1998/vue-admin-better （不想保留author可删除）
   * @description all模式设置路由
   * @param {*} { commit }
   * @returns
   */
  async setAllRoutes({ commit }) {
    try {
      console.log('开始获取用户菜单...')

      // 使用获取当前用户菜单的接口
      let response = await getCurrentMenuTree()

      console.log('菜单接口返回:', response)

      let { data } = response

      if (!data || !Array.isArray(data)) {
        console.error('后端返回的路由数据格式不正确', data)
        data = []
      }

      console.log('原始菜单数据:', data)
      console.log('菜单数量:', data.length)

      const accessedRoutes = convertRouter(data)

      console.log('转换后的路由:', accessedRoutes)
      console.log('路由数量:', accessedRoutes.length)

      commit('setAllRoutes', accessedRoutes)
      return accessedRoutes
    } catch (error) {
      console.error('获取用户菜单失败', error)

      // 检查是否需要回退到硬编码路由
      const isDev = process.env.NODE_ENV === 'development'

      if (isDev) {
        console.warn('开发模式下菜单接口调用失败，回退到硬编码路由')
        // 使用硬编码路由作为降级方案
        const accessedRoutes = filterAsyncRoutes(asyncRoutes, ['admin'])
        console.log('使用硬编码路由，数量:', accessedRoutes.length)
        commit('setAllRoutes', accessedRoutes)
        return accessedRoutes
      }

      commit('setAllRoutes', [])
      return []
    }
  },
}
export default { state, getters, mutations, actions }
