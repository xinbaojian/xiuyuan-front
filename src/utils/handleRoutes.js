/**
 * @author https://github.com/zxwk1998/vue-admin-better （不想保留author可删除）
 * @description all模式渲染后端返回路由
 * @param constantRoutes
 * @returns {*}
 */
export function convertRouter(asyncRoutes) {
  // 处理空值情况
  if (!asyncRoutes || !Array.isArray(asyncRoutes)) {
    console.warn('后端返回的路由格式不正确或为空')
    return []
  }

  console.log('convertRouter 开始处理，原始数据:', JSON.stringify(asyncRoutes, null, 2))

  return asyncRoutes
    .map((route, index) => {
      if (!route) return null

      console.log(`处理路由 ${index}:`, route.path, route.name, route.meta?.title)

      // 过滤掉禁用的菜单
      if (route.status === 'DISABLE') {
        console.log('路由已禁用，跳过:', route.path)
        return null
      }

      // 处理 redirect 字段
      if (route.redirect === 'noRedirect' || route.redirect === '' || route.redirect === null || route.redirect === undefined) {
        // 如果是根路由且没有有效的 redirect，且有子路由，则重定向到第一个子路由
        if (route.path === '/' && route.children && route.children.length > 0) {
          const firstChild = route.children[0]
          // 确保第一个子路由有 path
          if (firstChild && firstChild.path) {
            // 如果子路由是绝对路径（以 / 开头），直接使用；否则拼接
            const redirectPath = firstChild.path.startsWith('/') ? firstChild.path : `${route.path}${firstChild.path}`
            route.redirect = redirectPath
            console.log('根路由设置 redirect:', redirectPath)
          }
        } else {
          console.log('删除无效 redirect:', route.redirect, 'for route:', route.path)
          delete route.redirect
        }
      }

      // 处理组件路径
      if (route.component) {
        if (typeof route.component === 'string') {
          if (route.component === 'Layout') {
            route.component = () => import('@/layouts')
            console.log('Layout 组件转换:', route.path)
          } else if (route.component === 'EmptyLayout') {
            route.component = () => import('@/layouts/EmptyLayout')
          } else {
            try {
              // 处理路径格式："/setting/user/index.vue" -> "views/setting/user/index.vue"
              let componentPath = route.component

              // 如果路径以 / 开头，去掉开头的 /
              if (componentPath.startsWith('/')) {
                componentPath = componentPath.substring(1)
              }

              // 如果路径不包含 views，添加 views 前缀
              if (!componentPath.includes('views')) {
                componentPath = `views/${componentPath}`
              }

              console.log('组件路径转换:', route.component, '->', `@/${componentPath}`)

              route.component = () =>
                import(`@/${componentPath}`).catch((err) => {
                  console.error(`路由组件加载失败: @/${componentPath}`, err)
                  return import('@/views/404')
                })
            } catch (err) {
              console.error(`路由组件解析失败: ${route.component}`, err)
              route.component = () => import('@/views/404')
            }
          }
        }
      }

      // 处理权限字段：将字符串转换为数组
      if (route.meta && route.meta.permissions) {
        if (typeof route.meta.permissions === 'string') {
          console.log('权限转换:', route.meta.permissions, '-> [', route.meta.permissions, ']')
          route.meta.permissions = [route.meta.permissions]
        }
      }

      if (route.children) {
        console.log('处理子路由，数量:', route.children.length, 'for route:', route.path)
        if (Array.isArray(route.children) && route.children.length) {
          route.children = convertRouter(route.children)
          // 过滤掉空路由
          route.children = route.children.filter((child) => child !== null)
          console.log('子路由处理后剩余数量:', route.children.length, 'for route:', route.path)
        }
        if (!route.children || route.children.length === 0) {
          console.log('删除空的子路由 for route:', route.path)
          delete route.children
        }
      }

      return route
    })
    .filter((route) => route !== null) // 过滤掉无效路由
}

/**
 * @author https://github.com/zxwk1998/vue-admin-better （不想保留author可删除）
 * @description 判断当前路由是否包含权限
 * @param permissions
 * @param route
 * @returns {boolean|*}
 */
function hasPermission(permissions, route) {
  // 确保permissions是数组
  if (!permissions || !Array.isArray(permissions)) {
    return false
  }

  if (route.meta && route.meta.permissions) {
    return permissions.some((role) => route.meta.permissions.includes(role))
  } else {
    return true
  }
}

/**
 * @author https://github.com/zxwk1998/vue-admin-better （不想保留author可删除）
 * @description intelligence模式根据permissions数组拦截路由
 * @param routes
 * @param permissions
 * @returns {[]}
 */
export function filterAsyncRoutes(routes, permissions) {
  // 处理无效参数
  if (!routes || !Array.isArray(routes)) {
    return []
  }

  if (!permissions || !Array.isArray(permissions)) {
    return []
  }

  const finallyRoutes = []
  routes.forEach((route) => {
    if (!route) return

    const item = { ...route }
    if (hasPermission(permissions, item)) {
      if (item.children && Array.isArray(item.children)) {
        item.children = filterAsyncRoutes(item.children, permissions)
      }
      finallyRoutes.push(item)
    }
  })
  return finallyRoutes
}
