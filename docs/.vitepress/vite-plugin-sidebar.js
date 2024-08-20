// vite-plugin-sidebar.js
import { readdirSync, statSync } from "fs";
import { resolve, join, basename } from "path";

const excludeDirectoryName = ["public", ".vitepress"]

function createSidebarPlugin() {
  return {
    name: "vite-plugin-sidebar",

    // 在 Vite 构建开始之前执行
    async configResolved(config) {
      const docsDir = resolve(__dirname, "../");
      const sidebarConfig = config.vitepress.site.themeConfig.sidebar || [];
      const sidebar = await generateSidebar(docsDir, sidebarConfig);
      config.vitepress.site.themeConfig.sidebar = sidebar;
    },
  };
}

// 递归读取目录并生成侧边栏配置
async function generateSidebar(dir, existingSidebar) {
  const files = readdirSync(dir);
  const sidebar = [];

  for (const file of files) {
    if(excludeDirectoryName.indexOf(file) === -1) {
      const filePath = join(dir, file);
      const stat = statSync(filePath);
      if (stat.isDirectory()) {
        const items = [];
        const subDir = file;
        const subDirPath = join(dir, subDir);
  
        // 读取子目录中的所有 Markdown 文件
        const markdownFiles = readdirSync(subDirPath)
          .filter((f) => f.endsWith(".md") && !f.startsWith("index"))
          .map((f) => {
            const title = basename(f, ".md");
            return {
              text: title,
              link: `/${subDir}/${title.replace(/\s+/g, "-").toLowerCase()}`,
            };
          });
        // console.log("🚀 ~ generateSidebar ~ markdownFiles:", markdownFiles)
  
        // 如果现有侧边栏配置中已存在该板块，合并
        const existingItem = existingSidebar.find((item) => item.text === subDir);
        // console.log("🚀 ~ generateSidebar ~ existingItem:", existingItem)
        if (existingItem) {
          existingItem.items = [...existingItem.items, ...markdownFiles];
        } else {
          items.push(...markdownFiles);
        }
  
        sidebar.push({
          text: subDir,
          link: `/${subDir}`,
          items: items,
        });
      }
    }
  }

  return sidebar;
}

export default createSidebarPlugin;
