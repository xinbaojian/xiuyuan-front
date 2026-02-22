import request from "@/utils/request";

/**
 * 分页查询角色列表
 * @param {Object} params 查询参数
 * @returns 角色分页列表
 */
export function getList(params) {
  return request({
    url: "/admin/role/page",
    method: "get",
    params,
  });
}

/**
 * 新增角色
 * @param {Object} data 角色表单数据
 * @returns 新增结果
 */
export function doCreate(data) {
  return request({
    url: "/admin/role",
    method: "post",
    data,
  });
}

/**
 * 修改角色
 * @param {Object} data 角色表单数据
 * @returns 修改结果
 */
export function doEdit(data) {
  return request({
    url: "/admin/role/" + data.id,
    method: "post",
    data,
  });
}

/**
 * 删除角色
 * @param {string} id 角色ID
 * @returns 删除结果
 */
export function doDelete(id) {
  return request({
    url: "/admin/role/" + id,
    method: "delete",
  });
}

/**
 * 获取角色下拉列表
 * @returns 角色下拉列表
 */
export function getRoleOptions() {
  return request({
    url: "/admin/role/options",
    method: "get",
  });
}

/**
 * 获取角色的菜单权限
 * @param {string} roleId 角色ID
 * @returns 角色的菜单权限列表
 */
export function getRolePermissions(roleId) {
  return request({
    url: `/admin/role/${roleId}/permission`,
    method: "get",
  });
}

/**
 * 设置角色菜单权限
 * @param {string} roleId 角色ID
 * @param {Array} menuIds 菜单ID数组
 * @returns 设置结果
 */
export function setRolePermissions(roleId, menuIds) {
  return request({
    url: `/admin/role/${roleId}/permission`,
    method: "put",
    data: menuIds,
  });
}
