<div align="center">
  <img src="./web/public/logo-Prena.jpeg" alt="Prena Logo" width="120" />
  <h1>Prena | 轻呈</h1>
  <p><b>复杂内容，轻松呈现</b></p>
  <p>下一代基于 Web 与原子化组件的 AI 演示文稿生成引擎</p>
</div>

<br/>

## 🌟 为什么需要 Prena？

天下苦“死板的 PPT 模板”久矣！
传统的 AI PPT 生成工具往往基于固定模版，为了迎合模版的字数限制，AI 常常会**粗暴地删减、裁剪用户的核心观点**。而当尝试将精美的网页排版导出为 PPTX 时，由于“网页 CSS”与“后端 PPT 引擎”是两套完全不同的渲染逻辑，导致导出的文件**版面错乱、字体偏移**，毫无“所见即所得”可言。

**Prena (轻呈)** 彻底颠覆了这一流程：
1. **内容优先，动态生长**：抛弃固定模版。Prena 提供了一套灵活的“原子化组件库”（如多列卡片组、时间轴列表、图文分栏），AI 可以像搭积木一样，根据内容的多少动态组装页面。
2. **绝对的所见即所得**：抛弃后端的 Python PPTX 生成库。Prena 直接在浏览器前端抓取真实的 DOM 绝对坐标与最终渲染样式，将其 1:1 逆向输出为真实的本地 `.pptx` 文件。**网页上看到的美，就是 PPTX 里的美。**

---

## ✨ 核心特性

- 🎨 **Web-First 工业级控制台**：内置精美的 React 可视化编辑器，支持左侧缩略图导航与即时大纲预览。
- 🧱 **原子化组件驱动**：支持 Title, Paragraph, CardGrid（极其强大的多列卡片）, List, Image 等基础组件任意堆叠。
- 🪄 **一键热修改与换肤**：支持在网页直接点击文字进行富文本编辑 (ContentEditable)；支持一键切换预设的高级配色主题卡（经典蓝、翡翠绿、优雅紫等）。
- 🚀 **100% 纯本地高保真导出**：点击导出后，利用 `PptxGenJS` 直接在前端抓取 CSS 计算坐标，生成的每一页均为真实可编辑的原生 PPTX 形状，且完美支持导出**演讲稿备注**。
- 🎬 **沉浸式 Web 播放器**：不仅是编辑器，更是路演利器。内置极简放映模式，无需导出也可完成精彩演讲。

---

## 🚀 快速开始

### 1. 安装依赖
Prena 基于最新的 React + Vite 构建。
```bash
cd web
npm install
```

### 2. 本地开发预览
```bash
npm run dev
```
打开浏览器访问 `http://localhost:5173/`，即可体验完整的控制台。

### 🤖 3. AI 智能体“一句话”全自动安装
为了极致降低使用门槛，如果您正在使用代码智能体（如 Antigravity, Claude Code, Cursor, Open Code, Workbuddy），您可以直接将以下这句“咒语”发给它，它会自动为您完成一切：

> **"请克隆 https://github.com/sanshaoshuai/Prena 仓库，进入 web 目录执行 npm install 安装依赖，然后 npm run dev 启动服务，并为我打开本地预览链接。"**

### 3. 如何配合 AI Agent 自动生成？
Prena 采用“人机分离”的创新架构：
- **人类端**：您正在浏览的 README 和启动的 Web 控制台，用于最终的视觉调整与导出。
- **AI 端**：请查看项目根目录下的 [`SKILL.md`](./SKILL.md)。这是专门写给 AI 读的“系统提示词 (System Prompt)”。

**工作流演示**：
1. 打开您最喜欢的 AI 工具（如 Kimi, GPT-4, Antigravity IDE）。
2. 将 `SKILL.md` 的内容喂给 AI，告诉它：“以后请按照这个设定工作”。
3. 把您的长文档/商业需求发给 AI，AI 会自动为您规划大纲，并严格按照协议为您生成底层的 `deck.json` 数据文件。
4. 您的 Web 控制台会瞬间热更新，呈现出完美的 PPTX！

---

## 🛠 技术栈

*   **UI 框架**: React 18 + Vite
*   **视觉实现**: 纯原生 CSS (CSS Grid / Flexbox 动态自适应)
*   **导出引擎**: PptxGenJS + DOM 绝对坐标逆向映射
*   **图标库**: Lucide React

---
<div align="center">
  <i>"Don't just make a presentation. Make a masterpiece."</i>
</div>
