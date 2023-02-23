import { ModelAdminBase } from './model-admin-base';

export interface NavMenuProps {
  title: string;
  link?: string;
  icon?: string;
  isKeepAlive?: boolean;
  isFull?: boolean;
  name?: string;
  target?: 'main_frame' | '_blank' | string;
  children?: SiteNavMenu[];
  model?: ModelAdminBase;
}

/**
 * 站点导航菜单
 */
export class SiteNavMenu {
  /**
    * 菜单名称
    */
  public title = '';

  public name = '';

  public model: ModelAdminBase;

  /**
    * 链接
    */
  public link = '';

  /**
    * a标签的target属性
    */
  public target: 'main_frame' | '_blank' | string = 'main_frame';

  /**
    * 图标
    */
  public icon = '';

  /**
    * 子类
    */
  public children: SiteNavMenu[] = [];

  constructor(config: NavMenuProps) {
    this.title = config.title;
    this.link = config.link ?? `#basePath#list/?modelName=${config.name}`;

    if (typeof config.icon === 'string') {
      this.icon = config.icon;
    }
    if (typeof config.target === 'string') {
      this.target = config.target;
    }
    if (typeof config.name === 'string') {
      this.name = config.name;
    }
    if (Array.isArray(config.children)) {
      config.children.forEach((item) => this.add(item));
    }
    if (config.model) {
      this.model = config.model;
    }
  }

  public add(...menus: SiteNavMenu[]): SiteNavMenu {
    for (let i = 0; i < menus.length; i += 1) {
      const menu = menus[i];
      if (!(menu instanceof SiteNavMenu)) throw new Error('请添加一个SiteNavMenu对象');
      if (menu.model) {
        // 如果模型存在，需要将model注册到yiAdmin中
      }
      this.children.push(menu);
    }
    return this;
  }
}
