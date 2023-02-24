import OSS from 'ali-oss';
import { getEnv } from '../get-env';

const region = getEnv('OSS_ORIGIN');
const accessKeyId = getEnv('OSS_ACCESSKEY_ID');
const accessKeySecret = getEnv('OSS_ACCESSKEY_SECRET');

const client = new OSS({
  region,
  accessKeyId,
  accessKeySecret,
  bucket: 'ysreader',
});

const headers = {
  // 指定Object的存储类型。
  'x-oss-storage-class': 'Standard',
  // 指定Object的访问权限。
  'x-oss-object-acl': 'private',
  // 通过文件URL访问文件时，指定以附件形式下载文件，下载后的文件名称定义为example.jpg。
  // 'Content-Disposition': 'attachment; filename="example.jpg"'
  // 设置Object的标签，可同时设置多个标签。
  'x-oss-tagging': 'Tag1=1&Tag2=2',
  // 指定PutObject操作时是否覆盖同名目标Object。此处设置为true，表示禁止覆盖同名Object。
  'x-oss-forbid-overwrite': 'true',
};

export async function putOss(fileName: string, file: any) {
  const res = await client.put(fileName, file);
  return res;
}
