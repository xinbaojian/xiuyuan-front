import request from "@/utils/request";
import { tokenName } from "@/config";

export async function login(data) {
  return request({
    url: "/admin/login",
    method: "post",
    data,
  });
}

export function getUserInfo(accessToken) {
  return request({
    url: "/admin/user/userInfo",
    method: "get",
    data: {
      [tokenName]: accessToken,
    },
  });
}

export function logout() {
  return request({
    url: "/admin/logout",
    method: "post",
  });
}

export function register() {
  return request({
    url: "/admin/register",
    method: "post",
  });
}

/**
 * 获取用户分页列表
 * @param params 查询参数
 * @returns 用户分页列表
 */
export function getUserList(params) {
  return request({
    url: "/admin/user/page",
    method: "get",
    params,
  });
}

/**
 * 新增用户
 * @param data 用户数据
 * @returns 结果
 */
export function addUser(data) {
  return request({
    url: "/admin/user",
    method: "post",
    data,
  });
}

/**
 * 修改用户
 * @param id 用户ID
 * @param data 用户数据
 * @returns 结果
 */
export function updateUser(id, data) {
  return request({
    url: `/admin/user/${id}`,
    method: "post",
    data,
  });
}

/**
 * 重置用户密码
 * @param id 用户ID
 * @param newPassword 新密码（可选，不传则使用系统默认密码）
 * @returns 结果
 */
export function resetUserPassword(id, newPassword) {
  const data = {};
  if (newPassword) {
    data.newPassword = newPassword;
  }
  return request({
    url: `/admin/user/resetPwd/${id}`,
    method: 'post',
    data,
  });
}

/**
 * 删除用户
 * @param id 用户ID
 * @returns 结果
 */
export function deleteUser(id) {
  return request({
    url: `/admin/user/${id}`,
    method: "delete",
  });
}

/**
 * 获取当前用户信息
 * @returns 当前用户信息
 */
export function getCurrentUserInfo() {
  return request({
    url: "/admin/user/current",
    method: "get",
  });
}

/**
 * 修改用户资料
 * @param id 用户ID
 * @param data 用户资料数据
 * @returns 结果
 */
export function updateUserProfile(id, data) {
  return request({
    url: `/admin/user/avatar/${id}`,
    method: "put",
    data,
  });
}
