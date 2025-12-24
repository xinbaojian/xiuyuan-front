import request from "@/utils/request";
import { tokenName } from "@/config";

export async function login(data) {
  return request({
    url: "/login",
    method: "post",
    data,
  });
}

export function getUserInfo(accessToken) {
  return request({
    url: "/user/userInfo",
    method: "get",
    data: {
      [tokenName]: accessToken,
    },
  });
}

export function logout() {
  return request({
    url: "/logout",
    method: "post",
  });
}

export function register() {
  return request({
    url: "/register",
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
    url: "/user/page",
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
    url: "/user",
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
    url: `/user/${id}`,
    method: "post",
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
    url: `/user/${id}`,
    method: "delete",
  });
}
