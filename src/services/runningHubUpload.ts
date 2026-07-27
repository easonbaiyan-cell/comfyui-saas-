export async function uploadToRunningHub(fileBlob: Blob, filename?: string): Promise<string> {
  let finalFileName = filename;
  if (!finalFileName) {
    const mimeType = fileBlob.type || 'image/jpeg';
    // Fallback if mimeType doesn't contain a slash
    const ext = mimeType.includes('/') ? mimeType.split('/')[1] : 'jpg';
    finalFileName = `upload_${Date.now()}.${ext}`;
  }

  const formData = new FormData();
  formData.append('file', fileBlob, finalFileName);

  // 核心修复：绝对禁止手动指定 Content-Type: multipart/form-data
  // 必须让浏览器自动生成带 boundary 的 Content-Type

  const apiKey = process.env.NEXT_PUBLIC_RUNNINGHUB_API_KEY;

  // 核心修复：客户端直接 POST 请求 RunningHub，解决 413 限制
  const response = await fetch('https://www.runninghub.cn/openapi/v2/media/upload/binary', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`
    },
    body: formData,
  });

  if (!response.ok) {
    const text = await response.text();
    let errorData;
    try {
      errorData = JSON.parse(text);
    } catch (e) {
      // not JSON
    }
    if (errorData) {
      throw new Error(errorData.error || errorData.message || errorData.msg || '上传文件到 RunningHub 失败');
    } else {
      throw new Error('RunningHub 服务器拒绝了该文件，可能是文件过大或格式错误');
    }
  }

  const text = await response.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch (e) {
    throw new Error('RunningHub 响应格式错误：非法的 JSON 数据');
  }

  if (data.code !== undefined && data.code !== 0) {
    throw new Error(data.error || data.message || data.msg || '上传文件到 RunningHub 失败');
  }

  if (!data.data || !data.data.fileName) {
    throw new Error('RunningHub 响应格式错误：缺少 fileName');
  }

  return data.data.fileName;
}
