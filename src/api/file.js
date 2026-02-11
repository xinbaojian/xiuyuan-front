import request from "@/utils/request";

/**
 * 上传文件
 * @param file 文件对象
 * @param options 上传选项
 * @returns 附件ID
 */
export function uploadFile(file, options = {}) {
  const formData = new FormData();
  formData.append("file", file);

  const params = {};
  if (options.useRandomFileName !== undefined) {
    params.useRandomFileName = options.useRandomFileName;
  }
  if (options.overwrite !== undefined) {
    params.overwrite = options.overwrite;
  }

  return request({
    url: "/file-store/upload/annex",
    method: "post",
    data: formData,
    params,
    headers: {
      // 删除默认的 Content-Type，让浏览器自动设置 multipart/form-data 和 boundary
      "Content-Type": undefined,
    },
  });
}

/**
 * 根据附件ID获取附件信息
 * @param annexId 附件ID
 * @returns 附件信息
 */
export function getFileInfo(annexId) {
  return request({
    url: `/file-store/upload/info/${annexId}`,
    method: "get",
  });
}
