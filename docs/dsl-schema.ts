export interface Presentation {
  meta: {
    title: string;
    author?: string;
    theme: 'light' | 'dark' | 'nature' | 'cyber'; // 支持多套全局皮肤
    primaryColor?: string; // 主题色覆盖，如 '#0A7CFF'
  };
  slides: Slide[];
}

export interface Slide {
  id: string; // 唯一标识符
  /**
   * 页面大框架的布局模式：
   * - standard: 顶部大标题，下方内容区（默认垂直流式排列）
   * - split_half: 左右 50/50 分栏
   * - center: 内容完全居中（常用于封面/过渡页）
   */
  layout: 'standard' | 'split_half' | 'center'; 
  background?: {
    color?: string; // 背景色
    imageUrl?: string; // 背景图片
    opacity?: number; // 背景遮罩透明度
  };
  components: SlideComponent[]; // 页面中的原子化组件
  notes?: string; // 演讲者备注
}

// ---------------------------------------------------------
// 原子化组件定义 (Atomic Components)
// LLM 根据内容需要，像搭积木一样组合这些组件
// ---------------------------------------------------------

export type ComponentType = 
  | 'Heading' 
  | 'Paragraph' 
  | 'CardGrid' 
  | 'List' 
  | 'Image' 
  | 'Quote';

export interface BaseComponent {
  id: string;
  type: ComponentType;
  // 为了不让 LLM 陷入调像素的泥潭，我们只开放极少数的排版倾向控制
  layoutTarget?: 'main' | 'left_col' | 'right_col'; // 如果当前幻灯片是 split_half 布局，指明该组件放在哪一边
}

// 1. 标题组件 (支持主标题、副标题等)
export interface HeadingComponent extends BaseComponent {
  type: 'Heading';
  text: string;
  level: 1 | 2 | 3; // 1: 巨型标题(封面), 2: 页面主标题, 3: 模块小标题
  align?: 'left' | 'center' | 'right';
}

// 2. 正文段落组件
export interface ParagraphComponent extends BaseComponent {
  type: 'Paragraph';
  text: string; // 支持简单的加粗/斜体 Markdown 语法，如 **重点**
  align?: 'left' | 'center' | 'right';
}

// 3. 多列卡片组 (极其常用：可用于特性展示、SaaS价格表、SWOT分析、对比等)
export interface Card {
  title: string;
  content: string;
  icon?: string; // 图标名称 (例如使用 Lucide Icons)
  badge?: string; // 右上角角标，例如 "推荐" / "Pro"
  highlight?: boolean; // 是否高亮该卡片 (例如价格表中的推荐项)
}
export interface CardGridComponent extends BaseComponent {
  type: 'CardGrid';
  columns: 1 | 2 | 3 | 4; // 强制按网格排列
  cards: Card[];
}

// 4. 列表组件 (常用于总结、步骤说明)
export interface ListComponent extends BaseComponent {
  type: 'List';
  style: 'bullet' | 'number' | 'timeline'; // 增加 timeline 时间轴模式
  items: string[];
}

// 5. 图片组件
export interface ImageComponent extends BaseComponent {
  type: 'Image';
  url: string;
  alt?: string;
  caption?: string; // 图片下方的说明文字
  objectFit?: 'cover' | 'contain';
  borderRadius?: boolean; // 是否应用圆角设计
}

// 6. 强调引言组件
export interface QuoteComponent extends BaseComponent {
  type: 'Quote';
  text: string;
  author?: string;
}

export type SlideComponent = 
  | HeadingComponent 
  | ParagraphComponent 
  | CardGridComponent 
  | ListComponent 
  | ImageComponent 
  | QuoteComponent;
