# 漫游知识 · 广东2027五科可视化复习

[在线体验](https://yangwei251003.github.io/manyou-knowledge-comics/) · [五科课程](https://yangwei251003.github.io/manyou-knowledge-comics/#map) · [实际覆盖](https://yangwei251003.github.io/manyou-knowledge-comics/#coverage)

从只有五个样章，改为按26册人教版教材的114章组织，另加地理地图工具。原创讲解提炼、条件明确的公式、类比边界、方法与例题共同服务一轮复习。

![实际首页](docs/media/full-home-desktop.png)

## 当前实际能力

- 五科413节、1260条知识说明、446条公式或关系；115道章末例题及10道题型迁移示例。
- 已渲染1条独立讲解短片，中文合成旁白、字幕与授权配乐；仍待连续看审和听审。
- 按册目录、160主题方法提要、跨科搜索、公式回跳与24条主题路线。
- 8页实际ImageGen漫画；5个原有分步模型和5个新增可调精确模型。
- 原理复述、阅读标记、章节收藏、思路笔记和导出；记录只保存在当前浏览器。

## 状态边界

这是原创复习草稿与可运行网站，尚未经过教师教审或真实高三学生验证。教材目录覆盖经过核对，不等于全部知识、题型和学习效果已经验证。全量漫画、视频课程和分层题库尚在制作，不把文字、网页动画或静态图片冒称成片。

## 本地运行

需要Node.js。

```sh
npm ci
npm run dev
npm run check
npm run test:browser
```

浏览器测试使用Playwright Chromium。首次安装浏览器：`npx playwright install chromium`。网站本身无运行时npm依赖，使用原生ES模块；GitHub Pages可静态运行。

## 核对与维护

[逐册覆盖与来源](docs/FULL-CURRICULUM-AUDIT.md) · [目录匹配证据](docs/toc-audit.json) · [科学自查](docs/FULL-CONTENT-REVIEW.md) · [四视角走读](docs/V02-ROLE-REVIEW.md) · [运行验证](docs/VALIDATION.md)

`content/`是结构化原稿，`src/`为界面及精确模型，`production/`保留漫画提示词、散列和审核状态。历史160主题仍在`content/curriculum.json`，当前课程不以它为分母。教材原件与未通过图稿存本地忽略目录，不上传第三方教材PDF或扫描页。

## 许可与归属

代码MIT；本项目原创整理、题目与图像按[内容许可](CONTENT-LICENSE.md)说明分享。引用的一手材料、第三方模板、字体或音频保留各自权利和许可，不能从代码许可推导其素材许可。

## 更新

- 2026-11-06：按26册、114教材章重建课程；加入跨科公式、学习路线、完整章节阅读、8页漫画与5个新模型；409个教材节标题与资料规范化匹配通过。
- 2026-11-05：发布五个科学交互样章与160主题历史规划。
