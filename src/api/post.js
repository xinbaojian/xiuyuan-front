import request from "@/utils/request";

export function getList(params) {
  return request({
    url: "/post/page",
    method: "get",
    params,
  });
}

export function doCreate(data) {
  return request({
    url: "/post",
    method: "post",
    data,
  });
}

export function doEdit(data) {
  return request({
    url: `/post/${data.id}`,
    method: "post",
    data,
  });
}

export function doDelete(data) {
  return request({
    url: `/post/${data.id}`,
    method: "delete",
  });
}

/**
 * 获取岗位下拉列表
 * @returns 岗位下拉列表
 */
export function getPostOptions() {
  return request({
    url: "/post/options",
    method: "get",
  });
}