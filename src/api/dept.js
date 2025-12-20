import request from "@/utils/request";

/**
 * 获取部门树
 * @param queryParams 查询参数
 * @returns 部门树
 */
export function getDeptTree(queryParams) {
  return request({
    url: "/dept/tree",
    method: "get",
    params: queryParams,
  });
}

/**
 * 新增部门
 * @param data 部门表单数据
 * @returns 结果
 */
export function addDept(data) {
  return request({
    url: "/dept",
    method: "post",
    data: data,
  });
}

/**
 * 修改部门
 * @param id 部门ID
 * @param data 部门表单数据
 * @returns 结果
 */
export function updateDept(id, data) {
  return request({
    url: `/dept/${id}`,
    method: "post",
    data: data,
  });
}

/**
 * 删除部门
 * @param id 部门ID
 * @returns 结果
 */
export function deleteDept(id) {
  return request({
    url: `/dept/${id}`,
    method: "delete",
  });
}