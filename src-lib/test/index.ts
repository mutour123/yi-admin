import express from 'express';
import mongoose from 'mongoose';
import { config } from 'dotenv';
import { resolve } from 'path';
import myadmin from './admin';
import myadmin2 from './admin2';
import { getEnv } from './get-env';
import { createServer } from 'http';
import { Book, sequelizeObj } from './sequelizeModels/book.model';


config();

const MONGODB_URI = getEnv('MONGODB_URI', 'mongodb://localhost:27017/');


export async function createApp2() {
  // 连接mongoosedb数据库
  await mongoose.connect(MONGODB_URI, {});
  // sequlize连接mysql数据库


  // 验证是否连接成功
  sequelizeObj.authenticate().then(async () => {
    console.log('Connection has been established successfully.');
    Book.sync({
      alter: true,
    }).then((res) => {
      console.log('res:==', res);
    });
    // Book.sync();
  }).catch((err) => {
    console.error('Unable to connect to the database:', err);
  });
  // await sequelizeObj.sync({ force: true });
  const app = express();
  const server = createServer(app);

  app.use('/uploads', express.static(resolve(__dirname, '../../uploads')));

  app.use('/test/', await myadmin.createExpressRouter('/test/', { }));

  app.use('/test2/', await myadmin2.createExpressRouter('/test2/', { }));

  app.use('/test-post', async (req, res) => {
    console.log('res:===', req.body);
    res.send('ok');
  });

  return server;
}

async function start(): Promise<void> {
  const app = await createApp2();

  const port = Number.parseInt(getEnv('PORT', '5000'), 10);
  const host = getEnv('HOST', '0.0.0.0');

  app.listen(port, host, () => {
    console.log(`server is listening on ${host}:${port}`);
  });
}

start().catch(console.error);
