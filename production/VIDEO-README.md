# 圆锥曲线独立短视频制作记录

日期：2026-11-06。成片62.5秒，1280×720，24fps，H.264/AAC。内容为三种圆锥曲线距离定义和一个椭圆参数例子，不代表完整章回顾或全科视频覆盖。

## 实际制作

先写连续讲述稿，再本地生成59.1105秒旁白。faster-whisper回读取得时间码，字幕按原稿纠正“椭圆”“绝对值”等识别写法。8个独立图形场景按真实旁白时间组织：设问、椭圆、双曲线、抛物线、选模型、算焦距、回顾联系、署名。无外部视频镜头，无漫画插入，无同一实际片段复播。

图形由方程计算，点的位置、焦距和距离数值同步变化；每场有不同信息推进，点的移动单次完成，不循环填时长。原生HTML/SVG按帧取值，由后台浏览器和FFmpeg直接渲染，没有接入OpenFilm。统一品牌图形保留，不把通用线条函数复用等同于重复播放实际镜头。

## 参考比较与实际使用状态

| 参考 | 核验范围 | 取舍 |
|---|---|---|
| [Paper Perspective · Narrated Explainer](https://motiongit.com/adunext/template-02-expanded)，2.7.21-alpha.10；公开仓358192，commit cdc4f2372774178f8013e9f4c910c98d9d53abc5 | 读取当前说明、README及公共文件树，公共仓未取得完整制作包，未声称运行 | 参考纸面分层和图文关系；本片原生重新实现数学场景 |
| [Kinetic Tech公开版](https://github.com/motiontemplates/385712/tree/9dfbe7d7c6a6d4aa03f6f8e2f2285e631099faae)，0.2.7-open-beta | 读取公开说明，区分官网个人最新版和本地公开版，未为本片运行该包 | 金属字与高能光效不适合本片读公式，未套用 |
| [Vincent assemble-then-type-flyin](https://github.com/Vincentwei1021/video-shotcraft/blob/43bd349a136651865ecfa6ea1cf012f6e957d304/references/shots/effects/assemble-then-type-flyin.md) | 读取完整镜头卡及Apache-2.0许可，不冒称完整demo已运行 | 采用先图形骨架、后关键标签的节奏原则；未复制其3D发布页代码 |

## 声音与归属

旁白为本地Qwen CustomVoice 0.6B的“温柔女声”预设合成，不是教师录音或用户克隆音色。原始WAV和讲稿可编辑保留。

配乐：[A Kind Of Hope — Scott Buckley](https://www.scottbuckley.com.au/library/a-kind-of-hope/)，[CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)。从官方公开下载链接取得原始MP3，SHA-256在音频台账。使用从12秒开始的连续片段，淡入淡出、降音量并在讲解处侧链压低。未循环、未拼接成重复段，不表示音乐作者背书。

> ‘A Kind Of Hope’ by Scott Buckley — released under CC BY 4.0. www.scottbuckley.com.au

信用信息同时出现在成片片尾和网站视频下方。完整原音乐只保留本地研究缓存，不作为本项目原创作品再发布。

## 验收证据与缺口

实际已渲染及混音，有片长、尺寸、编码、完整解码、散列、波形响度和浏览器播放检查。已目视查看各关键数学场景截图，未连续看完实际MP4，未完成声音听审。ASR和信号测量不等于听感合格；因此不生成完整视频质量总分，也不标优秀成片或教师教审通过。

可复现入口：`scripts/render-conic-video.mjs`、`scripts/mix-conic-video.py`。FFmpeg通过环境变量或参数指定，不依赖个人绝对路径。渲染时先启动本地预览；所有外部资源在渲染前已缓存。
