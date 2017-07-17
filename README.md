# node实例《个人博客》项目

## 目录结构
> 项目克隆到本地，需要在当前目录下创建db文件夹

* node-example

    *  db : 数据库存储目录<需手动创建，并手动关联数据库：**mongod --dbpath=项目文件下的db目录**>
    *  models : 数据库模型文件目录
    *  public : 公共文件目录（css，js，image...）
    *  routers : 路由文件目录
    *  schemas : 数据库结构文件（schema）目录
    *  views : 模板视图文件目录
    *  app.js : 应用入口文件
    *  package.json : 配置文件

### 项目数据库依赖：**mongodb**搭建，所以需要先安装数据库。地址：<https://www.mongodb.com/>
安装完成后:打开cmd,进入安装目录下的bin目录:执行
```mongodb
  mongod --dbpath=项目文件下的db目录
```
默认数据库端口27017，修改端口号**mongod --port**+端口号
### 进入项目目录，执行node:
```node
  npm install
  npm server
```
