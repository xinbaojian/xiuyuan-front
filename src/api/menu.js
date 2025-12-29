import request from "@/utils/request";

/**
 * 获取菜单树
 * @param params 查询参数
 * @returns 菜单树
 */
export function getMenuTree(params) {
  return request({
    url: "/menu/tree",
    method: "get",
    params,
  });
}

/**
 * 新增菜单
 * @param data 菜单表单数据
 * @returns 结果
 */
export function addMenu(data) {
  return request({
    url: "/menu",
    method: "post",
    data: data,
  });
}

/**
 * 修改菜单
 * @param id 菜单ID
 * @param data 菜单表单数据
 * @returns 结果
 */
export function updateMenu(id, data) {
  return request({
    url: `/menu/${id}`,
    method: "post",
    data: data,
  });
}

/**
 * 删除菜单
 * @param id 菜单ID
 * @returns 结果
 */
export function deleteMenu(id) {
  return request({
    url: `/menu/${id}`,
    method: "delete",
  });
}
