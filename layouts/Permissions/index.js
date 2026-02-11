import permissions from './permissions'

// Vue 3 插件注册方式
const install = function (app) {
  app.directive('permissions', permissions)
}

if (window.Vue) {
  window['permissions'] = permissions
}

permissions.install = install
export default permissions
