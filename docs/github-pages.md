# GitHub 网页发布

网站版本：CSZ1版。

欢迎页入口：https://asukaneko-39.github.io/-CSZ1-pages/#cover

公开网页仓库：https://github.com/AsukaNeko-39/-CSZ1-pages

私有源码仓库：https://github.com/AsukaNeko-39/-CSZ1

公开修改记录（PDF，30 页）：https://asukaneko-39.github.io/-CSZ1-pages/docs/modification-record.pdf

修改记录于 2026-09-09 按用户要求上传，文件与本地记录内容一致。

2026-09-09 首页图栏更新：土地制度与重要文物图片贴齐外框，增加图片面积，逐张调整取景位置；方鼎主体加大，素纱单衣适度裁去两侧，竖版皿方罍用原图背景延展。图文卡保持等大对齐，详情页保留完整原图；修改记录追加前后对比图，共 29 页。

源码仓库继续保持私有。当前账号无法从私有仓库发布 GitHub Pages，因此使用独立公开仓库存放编译后的网页文件和图片素材。页面本身不要求登录，可直接转发访问。搜索引擎禁索引设置不等于访问权限控制。

2026-09-09 入口修复：外部新打开的链接即使带有栏目后缀，也先显示欢迎页；分享按钮复制欢迎页网址，复制权限受限时显示手动复制窗口。站内刷新和前进后退保留当前栏目。修改记录现为 30 页。

## 首次公开发布记录

- 日期：2026-09-09。
- 网页来源提交：`c9fc8d425eba60106880c03d2413aa388874618b`。
- 公开发布提交：`d73c4208f29682c1ba58a85cd7cf55f72d7659a7`。
- GitHub Pages 使用公开发布仓库的 `main` 分支根目录，并启用 HTTPS。
- 原上游仓库没有改动，本地仍禁用向原上游推送。

## 后续更新

发布需显式构建、检查并更新公开仓库；推送源码仓库不会自动更新网页。当前源码仓库中的旧 Pages 工作流只保留手动触发，本次发布不使用该工作流。

构建时必须使用 `/-CSZ1-pages/` 作为资源根路径。可使用项目已安装的工具：

```powershell
node node_modules/typescript/bin/tsc --noEmit
node node_modules/vite/bin/vite.js build --base '/-CSZ1-pages/' --outDir '<独立发布目录>'
```

公开仓库上传构建输出、网页素材及用户要求公开的修改记录 PDF；不上传源码开发历史、本地需求文档、凭据、依赖目录或 `.openai` 绑定。更新网页时保留 `docs/modification-record.pdf`、`.nojekyll`、`404.html` 和禁索引设置。更新前核对欢迎页、五个专题、图片路径与手机布局，更新后再次核对公开网址。
