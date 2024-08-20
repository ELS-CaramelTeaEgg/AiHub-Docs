import { defineConfig } from "vitepress";

import createSidebarPlugin from "./vite-plugin-sidebar";

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "AiHub",
  description: "A AI Community",
  base: "/AiHub-Docs/",
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: "Home", link: "/" },
      { text: "Guide", link: "/guide" },
    ],

    sidebar: [
      // 最外面一层是板块配置，对应的就是一级目录
      {
        // 标题
        text: "Guide",
        // 文章地址，一级目录的文章，可有可无
        link: "/guide",
        // 对应的板块下的二级目录
        items: [
          // text 就是标题，link 就是对应的文章
          { text: "在本网站创建一个文档", link: "/guide/在本网站创建一个文档" },
          {
            text: "VitePress+GithubPages构建网站",
            link: "/guide/VitePress+GithubPages构建网站",
          },
        ],
      },
      {
        text: "Server",
        link: "/server",
        items: [
          { text: "响应消息国际化配置", link: "/server/响应消息国际化配置" },
        ],
      },
      {
        text: "Mobile",
        link: "/mobile",
      },
    ],

    socialLinks: [
      { icon: "github", link: "https://github.com/ELS-CaramelTeaEgg" },
    ],
  },
  ignoreDeadLinks: true,
  vite: {
    plugins: [createSidebarPlugin()],
  },
});
