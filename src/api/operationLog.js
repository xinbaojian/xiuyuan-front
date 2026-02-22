import request from "@/utils/request";

/**
 * 分页查询操作日志
 * @param {Object} params 查询参数
 * @param {number} params.pageNo 页码
 * @param {number} params.pageSize 每页数量
 * @param {string} params.module 操作模块
 * @param {string} params.operationType 操作类型
 * @param {string} params.operatorId 操作人ID
 * @param {string} params.operatorName 操作人名称
 * @param {string} params.status 操作状态 SUCCESS/FAILURE
 * @param {string} params.startTime 开始时间
 * @param {string} params.endTime 结束时间
 * @returns 操作日志分页列表
 */
export function getList(params) {
  return request({
    url: "/admin/operation/log/page",
    method: "get",
    params,
  });
}

/**
 * 查询操作日志详情
 * @param {string} id 日志ID
 * @returns 日志详情
 */
export function getDetail(id) {
  return request({
    url: `/admin/operation/log/${id}`,
    method: "get",
  });
}
