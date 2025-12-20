import request from "@/utils/request";

export function getList(params) {
  return request({
    url: "/role/page",
    method: "get",
    params,
  });
}

export function doEdit(data) {
  return request({
    url: "/role/" + data.id,
    method: "post",
    data,
  });
}

export function doDelete(data) {
  return request({
    url: "/role/" + data.id,
    method: "delete",
    data,
  });
}

export function doCreate(data) {
  return request({
    url: "/role",
    method: "post",
    data,
  });
}

export function getDetail(id) {
  return request({
    url: "/role/" + id,
    method: "get",
  });
}
