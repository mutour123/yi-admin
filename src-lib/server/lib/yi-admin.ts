import express, { NextFunction } from 'express';
import { ModelAdminBase } from './model-admin-base';
import { SiteNavMenu } from './site-nav-menu';
import { EditTypes, ListTypes } from './types';
import { createExpressRouter } from './router-express';
import { Server } from 'http';

export interface CsrfParamResult {
  query?: Record<string, string>;
  body?: Record<string, string>;
}

/**
 * admin站点
 */
export class YiAdmin {
  /**
    * 判断用户是否有权限
    * 如果没有权限，直接在里侧抛出异常
    */
  public permissionExpress: (req: Express.Request, res: Express.Response, next: NextFunction) => any = (req, res, next) => {
    next();
  };

  /**
    * 对应的express路由
    */
  expressRouter: express.Router;

  /**
    * 站点导航菜单
    */
  public siteNavMenu: SiteNavMenu = new SiteNavMenu({
    title: 'root',
  });

  public siteConfig: {
      siteName: string;
   };

  public options: {
      csrfParam?: (req: express.Request,
         res: express.Response) => CsrfParamResult;
   };

  public modelNavMenu: SiteNavMenu = new SiteNavMenu({
    title: '数据模型管理',
  });

  constructor({
    permissionExpress,
    siteConfig = {},
    csrfParam,
  }: {
      permissionExpress?: (req: Express.Request, res: Express.Response, next: NextFunction) => any;
      siteConfig?: {
         siteName?: string;
      };

      /**
       * 获取csrf参数的回调函数
       * 返回的数据会在post请求发起的时候拼入post请求的body或者query中
       */
       csrfParam?: (req: express.Request,
         res: express.Response) => CsrfParamResult;
   }) {
    this.options = {
      csrfParam,
    };

    if (permissionExpress) {
      this.permissionExpress = permissionExpress;
    }

    // 如果model中有一个需要才应该add到siteNavMenu中
    // this.siteNavMenu.add(this.modelNavMenu);

    this.siteConfig = {
      siteName: siteConfig.siteName ?? 'yi-admin',
    };
  }

  public modelAdminsMap: {
    [name: string]: ModelAdminBase;
  } = {};

  createExpressRouter(basePath: string = '/', options: {
    hmr?: {
      server: Server;
      clientPort: number;
    }
  } = {}): Promise<express.Router> {
    this.ready();
    return createExpressRouter({
      yiAdmin: this,
      basePath,
    });
  }

  /**
    * 添加一个modelAdmin到yi-admin实例中
    * @param modelAdmin
    */
  addModelAdmin(modelAdmin: ModelAdminBase, {
    addToSiteNavMenu = true,
  }: {
      addToSiteNavMenu?: boolean;
   } = {}): void {
    if (this.modelAdminsMap[modelAdmin.name]) {
      throw new Error(`已经存在一个name为${modelAdmin.name}的model-admin实体在本站点中`);
    }
    this.modelAdminsMap[modelAdmin.name] = modelAdmin;

    if (addToSiteNavMenu) {
      this.modelNavMenu.add(new SiteNavMenu({
        name: modelAdmin.name,
        title: `管理 ${modelAdmin.title || modelAdmin.name}`,
        link: `#basePath#list/?modelName=${modelAdmin.name}`,
      }));
    }
  }

  private readySiteNavMenu(navMenu: SiteNavMenu) {
    const { model, name, children = [] } = navMenu;
    if (model && name) {
      // 如果有模型
      if (!this.modelAdminsMap[name]) {
        this.modelAdminsMap[name] = model;
      }
    }
    if (children.length) {
      children.forEach((item) => {
        this.readySiteNavMenu(item);
      });
    }
  }

  private ready() {
    // 整理siteNavMenu中的model
    this.readySiteNavMenu(this.siteNavMenu);
    // 判断是否需要将modelNavMenu添加到siteNavMenu中
    if (this.modelNavMenu.children?.length) {
      this.siteNavMenu.add(this.modelNavMenu);
    }
  }

  addNavMenu(navMenu: SiteNavMenu) {
    const modelAdmin = navMenu.model;

    if (modelAdmin) {
      // 如果模型存在，需要将model注册到modelAdminMap中
      if (this.modelAdminsMap[modelAdmin.name]) {
        throw new Error(`已经存在一个name为${modelAdmin.name}的model-admin实体在本站点中`);
      }
      this.modelAdminsMap[modelAdmin.name] = modelAdmin;
    }
    this.siteNavMenu.add(navMenu);
  }

  static EditTypes = EditTypes;

  static ListTypes = ListTypes;
}
