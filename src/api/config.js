import request from "@/utils/request";

/**
 * 分页查询系统配置列表
 * @param {Object} params - 查询参数
 * @param {number} params.pageNo - 页码
 * @param {number} params.pageSize - 每页数量
 * @param {string} params.configName - 参数名称
 * @param {string} params.configKey - 参数键名
 * @param {string} params.configType - 系统内置（Y是 N否）
 */
export function getList(params) {
  return request({
    url: "/admin/config/page",
    method: "get",
    params,
  });
}

/**
 * 新增系统配置
 * @param {Object} data - 配置数据
 * @param {string} data.configName - 参数名称
 * @param {string} data.configKey - 参数键名
 * @param {string} data.configValue - 参数键值
 * @param {string} data.configType - 系统内置（Y是 N否）
 * @param {string} data.remark - 备注
 */
export function doCreate(data) {
  return request({
    url: "/admin/config",
    method: "post",
    data,
  });
}

/**
 * 修改系统配置
 * @param {Object} data - 配置数据
 * @param {string} data.id - 配置ID
 * @param {string} data.configName - 参数名称
 * @param {string} data.configKey - 参数键名
 * @param {string} data.configValue - 参数键值
 * @param {string} data.configType - 系统内置（Y是 N否）
 * @param {string} data.remark - 备注
 */
export function doEdit(data) {
  return request({
    url: `/admin/config/${data.id}`,
    method: "post",
    data,
  });
}

/**
 * 删除系统配置
 * @param {Object} data - 包含id的对象
 * @param {string} data.id - 配置ID
 */
export function doDelete(data) {
  return request({
    url: `/admin/config/${data.id}`,
    method: "delete",
  });
}
