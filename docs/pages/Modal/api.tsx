import * as configMd from './config.md';

export default [
  {
    title: "API",
    intro: configMd,
    json: [
      {
        props: "zIndex",
        intro: "对应css的z-index",
        type: "number",
        defaultValue: "1000",
      },
      {
        props: "width",
        intro: "对话框宽度",
        type: "number",
        defaultValue: "256",
      },
      {
        props: "onOk",
        intro: "确认按钮回调，返回值为`true`时关闭",
        type: "() => boolean",
        defaultValue: "-",
      },
      {
        props: "onCancel",
        intro: "取消按钮回到",
        type: "() => void",
        defaultValue: "-",
      },
      {
        props: "onClose",
        intro: "对话框关闭时回调",
        type: "() => void",
        defaultValue: "-",
      },
      {
        props: "okText",
        intro: "确认按钮文本",
        type: "ReactNode",
        defaultValue: "确定",
      },
      {
        props: "cancelText",
        intro: "取消按钮文本",
        type: "ReactNode",
        defaultValue: "取消",
      },
      {
        props: "title",
        intro: "标题",
        type: "ReactNode",
        defaultValue: "-",
      },
      {
        props: "content",
        intro: "内容",
        type: "ReactNode",
        defaultValue: "-",
      },
      {
        props: "bodyContent",
        intro: "主体部分，可以覆盖title、content以icon",
        type: "ReactNode",
        defaultValue: "-",
      },
      {
        props: "icon",
        intro: "图标",
        type: "ReactNode",
        defaultValue: "-",
      },
    ]
  }
]
