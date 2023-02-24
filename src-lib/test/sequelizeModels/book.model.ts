import { createHash } from 'crypto';
import { readFileSync } from 'fs';
import { Model, DataTypes, Sequelize } from 'sequelize';
import { EditTypes } from '../../server';
import { FilterTypes } from '../../server/mongoose/mongoose-filter-types';
import { getEnv } from '../get-env';
import { File } from 'formidable';
import { extname } from 'path';
import { putOss } from '../utils/ali-oss';

const name = getEnv('MYSQL_DATABASE_NAME');
const user = getEnv('MYSQL_DATABASE_USER');
const password = getEnv('MYSQL_DATABASE_PASSWORD');
const host = getEnv('MYSQL_DATABASE_HOST');
const port = getEnv('MYSQL_DATABASE_PORT');

export const sequelizeObj = new Sequelize(name, user, password, {
  host,
  port: Number(port),
  dialect: 'mysql', /* 选择 'mysql' | 'mariadb' | 'postgres' | 'mssql' 其一 */
  dialectOptions: {
    charset: 'utf8mb4',
    collate: 'utf8mb4_unicode_ci',
    supportBigNumbers: true,
    bigNumberStrings: true,
  },
  pool: {
    max: 5,
    min: 0,
    idle: 30000,
  },
  timezone: '+08:00',
  logging: console.log,
});

export class Book extends Model {}


Book.init({
  name: {
    type: new DataTypes.STRING(32),
    name: '小说名称',
    comment: '小说名称',
    filterType: new FilterTypes.FilterStringSearchType({
      conditionType: 'string',
    }),
  },
  cover: {
    type: DataTypes.STRING,
    name: '封面图片',
    // name: '图片2',
    comment: '封面图片',
    editType: new EditTypes.EditStringImageType({
      helpText: '图片列表',
      maxFileSize: 80000 * 1000,
      prefix: getEnv('OSS_PREFIX'),
      writeFile: async function(file: File) : Promise<{
        url: string;
      }> {
        const fileData = readFileSync(file.filepath);
        const hash = createHash('md5').update(fileData).digest('hex');
        const extName = extname(file.originalFilename!);

        const fileName = `/book-cover/${hash}_${fileData.length}${extName}`;
        const putRst = await putOss(fileName, fileData);
        return {
          url: putRst.name,
        };
      },
    }),
  },
  quotation: {
    type: DataTypes.TEXT,
    name: '推荐语',
    comment: '引导语（推荐语、主编说）',
  },
  serialStatus: {
    type: DataTypes.ENUM,
    values: ['1', '2'],
    defaultValue: '1', // 默认连载中1, 2是完结
    name: '连载状态',
    comment: '连载状态: 1，连载中; 2, 完结',
  },
  offShelf: {
    type: DataTypes.BOOLEAN,
    defaultValue: false, // 默认小说是上架状态
    name: '是否下载',
    comment: '下架状态： true；上架；为false; 默认为false，上架中',
  },
}, {
  sequelize: sequelizeObj,
  timestamps: true, // 启用时间戳
  tableName: 'books',
  paranoid: true, // 软删除
});
