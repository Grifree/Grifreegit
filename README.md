# justmodel

为提高开发效率和压缩源码提高网页载入速度，我们使用了构建工具压缩代码，所以在修改代码时请使用构建工具构建后修改

## 安装
> 请确保你安装了 node 和 npm
[fis3](http://fis.baidu.com/fis3/docs/beginning/intro.html) [fms](http://fmsjs.org/)
```shell
npm install supervisor -g
npm install fis3 -g
npm install fms
npm install fis-parser-node-sass
npm install fis-parser-handlebars-3.x
npm install fis-parser-marked-template
npm install fis3-hook-commonjs
```

## 开发
在命里行运行构建
```shell
# 启动开发阶段构建脚本
npm run fis
# 一次编译为压缩版本
npm run build
# 启动 Mock Server
npm run fms
```


## 组件

arale http://aralejs.org/ 我们使用了 arale 的组件通过 window.A 使用
```js
// 在页面中运行如下代码即可明白
console.log(A)
```