import request from "@/utils/request";

export function getList(params) {
  return request({
    url: "/admin/role/page",
    method: "get",
    params,
  });
}

export function doEdit(data) {
  return request({
    url: "/admin/role/" + data.id,
    method: "post",
    data,
  });
}

export function doDelete(data) {
  return request({
    url: "/admin/role/" + data.id,
    method: "delete",
    data,
  });
}

export function doCreate(data) {
  return request({
    url: "/admin/role",
    method: "post",
    data,
  });
}

export function getDetail(id) {
  return request({
    url: "/admin/role/" + id,
    method: "get",
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
