# CVList：计算机视觉研究指南

**从研究想法，到可检验的研究。**

CVList 是一个中文静态教学网站，围绕“要把一个研究想法变成可实施、可检验的研究，需要说明哪些事情？”组织内容。网站用六个层面讲解计算机视觉研究，并结合任务说明、模型结果、公开示例和农业应用帮助理解。

## 查看网页

直接打开根目录的 `index.html` 即可离线浏览，无需安装依赖或启动服务。图片、样式、导航脚本和三维重建动画均已内嵌；访问论文、模型和示例来源链接时需要联网。

也可以使用 Node.js 20 或以上版本启动本地预览：

```powershell
npm run web
```

浏览器访问 <http://127.0.0.1:4173/web/dist/>。默认端口为 `4173`，可通过环境变量 `PORT` 修改。

网页展示已保存的结果与公开素材，不会在浏览器中运行模型或训练实验。

## 网页内容

首页以“改造 YOLO 检测密集苹果”为例，用分支图解释一项研究的六个层面。该示例是教学用的研究设计，不代表已完成的实验或结论。

| 层面 | 主要内容 | 页面入口 |
| --- | --- | --- |
| 任务 | 明确输入与输出，查看任务技术、代表模型、应用和图像示例 | `#tasks` |
| 研究问题 | 从失败条件出发，提出具体、可检验的问题 | `#problem` |
| 输入与数据 | 核对输入、标注、数据划分与使用条件 | `#data` |
| 学习设定与方法 | 明确监督条件、解决思路和可拆分的改动 | `#methods` |
| 模型 | 选择计算结构，建立可复现的基础方案 | `#models` |
| 验证方式 | 设计指标、对照、消融和失败分析 | `#evaluation` |

任务分支包含 18 项视觉任务，按五组组织；第六组提供 8 个农业任务组合：

- 基础视觉：分类、回归、目标检测、图像分割。
- 空间感知与三维：图像匹配、深度估计、三维重建、多光谱视觉感知。
- 时序与动态视觉：多目标跟踪、变化检测、视频时刻定位。
- 视觉与语言：图像描述、视觉问答、指称表述定位、图文检索、指称表述分割。
- 视觉生成与编辑：文生图、图像编辑与转换。
- 农业应用：围绕农业数据展示任务组合、图像示例、数据条件与来源。

左侧导航支持展开与收起，各层面提供对应的二级导航，任务组也可单独折叠。移动端选择二级条目后自动收起侧栏。网页支持浏览器前进、后退和深链接，例如 `index.html#task-03` 可直达目标检测；无效链接回到首页。

## 修改与构建

在项目根目录执行：

```powershell
npm.cmd ci --include=optional --no-audit --no-fund
npm run build:web
npm run verify:web
```

只修改网页内容和重新构建时，需要 Node.js 依赖及项目中现有的素材、结果文件，无需下载模型或配置 Python。Windows 下若 PowerShell 阻止执行 `npm.ps1`，可将命令中的 `npm` 换成 `npm.cmd`。

| 文件或目录 | 用途 |
| --- | --- |
| `lib/research-site.mjs` | 六层指南正文、首页分支图、共享布局、样式与路由 |
| `build-web.mjs` | 组装任务内容、处理图像并生成便携网页 |
| `tasks.json` | 18 项任务的定义、分组与脚本入口 |
| `task-notes.json` | 核心技术、代表模型、当前示例方法与应用 |
| `public-examples.json` | 公开示例的说明、图像路径与来源 |
| `agriculture.json` | 农业任务组合、数据条件与来源 |
| `assets/` | 网页构建和模型示例使用的输入素材 |
| `results/` | 已保存的模型结果、可视化图像与检查报告 |
| `index.html`、`web/dist/index.html` | 构建生成的两个相同网页文件 |
| `verify-web.mjs` | 网页内容、内嵌资源、内部链接和导航状态检查 |
| `serve.mjs` | 本地预览服务 |
| `site/` | 静态部署网页及托管配置；本机独立仓库的 `.git` 元数据不上传 |
| `outputs/site-deployment.json` | 现有部署信息记录 |
| `scripts/`、其余 `lib/` 模块 | 可选的模型推理示例与共享工具 |

修改正文或数据后，运行 `npm run build:web`，再运行 `npm run verify:web`。不要只编辑生成的 HTML，否则下次构建会覆盖修改。

构建报告写入 `results/web-export.json`，网页检查报告写入 `results/web-verification.json`。检查覆盖六层页面、18 项任务、8 个农业组合、图像与来源完整性，以及导航折叠、深链接、移动端状态和无效链接回退。该检查不替代真实浏览器的视觉验收。

`build:web` 只更新根目录和 `web/dist/` 的网页，不会自动更新 `site/dist/` 或发布线上网站。部署目录使用 `site/.openai/hosting.json` 中指定的 `dist`，发布前应同步经检查的网页。

## 可选：重新运行模型示例

网站保留了 11 项可运行任务：分类、质量回归、目标检测、语义分割、深度估计、多目标跟踪、变化检测、图像描述、指称表述定位、图文检索、指称表述分割。其余 7 项使用作者公开示例、官方数据或输入用例，没有对应的本项目推理脚本。

这部分额外需要 Python 环境、Python 依赖及模型权重。Windows 默认通过 `py -3.12` 调用 Python，也可用 `CVLIST_PYTHON` 指定解释器路径。

```powershell
py -3.12 -m pip install --no-cache-dir -r requirements-python.txt
npm run setup
npm run list
node run.mjs 03
node run.mjs 16 --text "the green car"
node run.mjs --all
npm run verify
npm run build:web
npm run verify:web
```

首次执行 `setup` 需要联网下载选定的模型和素材；推理使用本地模型文件。`--all` 只运行已实现的 11 项任务。附加的 `scripts/extra_image_retrieval.mjs` 提供以图搜图示例。各任务脚本支持 `--help`，可查看输入和输出参数。

模型与输入素材的来源、版本和摘要记录在 `sources.lock.json`；公开示例及农业图像的下载记录分别位于 `assets/public-examples/downloads.json` 和 `assets/agriculture/downloads.json`。`.cache/`、`.tmp/`、`node_modules/`、`models/` 和 `.python/` 是缓存、依赖或运行环境目录，按需生成。本仓库按完整项目快照保存现有依赖、缓存日志、检查报告和部署文件；Git 内部元数据与空目录不纳入版本管理。已提交的 `node_modules/` 包含 Windows x64 二进制，在其他系统上使用时应重新执行 `npm ci` 安装适用的依赖。

理解结果时需注意：深度估计输出相对深度；质量回归输出原始分数；检索相似度不是概率。语义分割不区分同类独立实例，跟踪与变化检测为基础实现。公开素材和保存的推理结果用于解释任务，不代表数据集精度评估或研究结论。

