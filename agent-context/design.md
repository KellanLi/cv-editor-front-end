
## 设计风格概述

现代简洁的设计风格，结合了Notion的简洁性与Canva的专业性。采用蓝紫色系渐变，打造科技感与专业性兼具的视觉体验。

## 配色系统

**主色调**

* Primary Blue (#6366f1): 主要按钮、链接、强调
* Gradient (#6366f1 → #8b5cf6): 品牌渐变、特殊强调

**中性色**

* Foreground (#1a1d2e): 主要文本
* Muted (#64748b): 次要文本、说明

**背景色**

* Background (#fafbfc): 页面背景
* Card (#ffffff): 卡片、面板

**辅助色**

* Accent (#eef2ff): 高亮背景、标签
* Secondary (#f1f5f9): 次要按钮、区域

## 字体系统

- Heading 1 - 大标题: Font-size: 36px, Weight: 500, 用于页面主标题
- Heading 2 - 二级标题: Font-size: 30px, Weight: 500, 用于区块标题
- Heading 3 - 三级标题: Font-size: 24px, Weight: 500, 用于卡片标题
- Heading 4 - 四级标题: Font-size: 20px, Weight: 500, 用于小节标题
- Body - 正文文本内容，清晰易读，适合长时间编辑使用。保持良好的行高和字间距。: Font-size: 16px, Weight: 400, 用于正文内容
- Small - 辅助文本、说明文字、时间戳等次要信息: Font-size: 14px, Weight: 400, 用于辅助信息

## 按钮系统

**Primary 按钮**

- 默认按钮

``` css
button {
  display: inline-flex;
  background-color: #6366f1;
  justify-content: center;
  align-items: center;
  height: 36px;
  padding: 0 16px;
  border-radius: 10px;
  color: #fff;
  font-size: 14px;
  font-weight: 500;
}

button:hover {
  background-color: #7374f2;
}
```

主要操作：创建、保存、提交等

- 大尺寸按钮

``` css
button {
  display: inline-flex;
  background-color: #6366f1;
  justify-content: center;
  align-items: center;
  padding: 0 24px;
  height: 40px;
  border-radius: 10px;
  color: #fff;
  font-size: 14px;
  font-weight: 500;
}

button:hover {
  background-color: #7374f2;
}
```

重要的主操作

- 小尺寸按钮

``` css
button {
  display: inline-flex;
  background-color: #6366f1;
  justify-content: center;
  align-items: center;
  padding: 0 16px;
  height: 32px;
  border-radius: 10px;
  color: #fff;
  font-size: 14px;
  font-weight: 500;
}

button:hover {
  background-color: #7374f2;
}
```

紧凑空间使用

**Secondary 按钮**

- 次要按钮

``` css
button {
  display: inline-flex;
  justify-content: center;
  align-items: center;
  border-radius: 10px;
  padding: 0 16px;
  height: 36px;
  background-color: #f5f7fa;
  color: #1a1d2e;
  font-size: 14px;
  font-weight: 500;
}
```

次要操作：取消、返回等

- 线框按钮

``` css
button {
  display: inline-flex;
  justify-content: center;
  align-items: center;
  border-radius: 10px;
  padding: 0 16px;
  font-size: 14px;
  font-weight: 500;
  height: 36px;
  border: solid 1px #e1e7ef;
  background-color: #fafbfc;
  color: #1a1d2e;
}

button:hover {
  background-color: #edf2ff;
  color: #4f47e6;
}
```

辅助操作

- 幽灵按钮

``` css
button {
  display: inline-flex;
  justify-content: center;
  align-items: center;
  border-radius: 10px;
  padding: 0 16px;
  font-size: 14px;
  font-weight: 500;
  height: 36px;
  background-color: rgba(0, 0, 0, 0);
  color: #1a1d2e;
}

button:hover {
  background-color: #edf2ff;
  color: #4f47e6;
}
```

最轻量的操作

**Icon 按钮**

``` css
button {
  display: inline-flex;
  justify-content: center;
  align-items: center;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 500;
  height: 36px;
  width: 36px;
  background-color: #6366f1;
  color: #fff;
}

button:hover {
  background-color: #7374f2;
}
```

``` css
button {
  display: inline-flex;
  justify-content: center;
  align-items: center;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 500;
  height: 36px;
  width: 36px;
  background-color: #f5f7fa;
  color: #1a1d2e;
}
```

``` css
button {
  display: inline-flex;
  justify-content: center;
  align-items: center;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 500;
  height: 36px;
  width: 36px;
  border: solid 1px #e1e7ef;
  background-color: #fafbfc;
  color: #1a1d2e;
}

button:hover {
  background-color: #edf2ff;
  color: #4f47e6;
}
```


``` css
button {
  display: inline-flex;
  justify-content: center;
  align-items: center;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 500;
  height: 36px;
  width: 36px;
  background-color: rgba(0, 0, 0, 0);
  color: #1a1d2e;
}

button:hover {
  background-color: #edf2ff;
  color: #4f47e6;
}
```
工具栏图标按钮

**状态按钮**
- 禁用状态

``` css
button {
  display: inline-flex;
  background-color: #b1b2f9;
  justify-content: center;
  align-items: center;
  height: 36px;
  padding: 0 16px;
  border-radius: 10px;
  color: #fff;
  font-size: 14px;
  font-weight: 500;
}
```

不可操作状态

- 删除按钮


``` css
button {
  display: inline-flex;
  background-color: #ef4345;
  justify-content: center;
  align-items: center;
  height: 36px;
  padding: 0 16px;
  border-radius: 10px;
  color: #fff;
  font-size: 14px;
  font-weight: 500;
}
```

危险操作：删除、清空

## 卡片系统

**基础卡片**

白色背景，圆角12px，柔和阴影。适合展示独立的内容块。

``` 
Border-radius: 12px
Background: #ffffff
Shadow: subtle
```

**悬停效果卡片**

鼠标悬停时有微妙的提升和阴影效果，增强交互反馈。

``` 
Hover: scale(1.02)
Shadow: enhanced
Transition: smooth
```

**强调卡片**

使用渐变背景突出重要信息或特殊内容区域。

``` 
Background: gradient
Border: accent
Use: highlights
```

## 间距与布局

**间距系统**

- XS: 4px / 0.25rem
- SM: 8px / 0.5rem
- MD: 16px / 1rem
- LG: 24px / 1.5rem
- XL: 32px / 2rem
- 2XL: 48px / 3rem

**圆角系统**

- Small: 8px
- Medium: 10px
- Large: 12px
- XL: 16px