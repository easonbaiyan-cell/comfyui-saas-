export async function uploadToRunningHub(fileBlob: Blob, filename: string): Promise<string> {
  const formData = new FormData();
  formData.append('file', fileBlob, filename);

  const response = await fetch('/api/upload-rh', {
    method: 'POST',
    body: formData,
  });

  const data = await response.json();

  if (!response.ok || data.code !== 0) {
    throw new Error(data.error || data.message || '上传文件到 RunningHub 失败');
  }

  if (!data.data || !data.data.fileName) {
    throw new Error('RunningHub 响应格式错误：缺少 fileName');
  }

  return data.data.fileName;
}
