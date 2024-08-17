# VitePress+GithubPages构建网站

技术栈：VitePress(编写页面) + Github Action(CI/CD) + GithubPages(服务器)

注意：使用 GithubPages 必须保证你的仓库是 **public** 的才可以

## 编写页面

总体的流程可以参考 [这里](https://vitepress.dev/zh/guide/getting-started)

需要注意的只有下面几个点：

1. vitepress 文件需要和源代码隔离起来

   ![image-20240817094108939](VitePress+GithubPage%E6%9E%84%E5%BB%BA%E7%BD%91%E7%AB%99.assets/image-20240817094108939.png)

2. 如何添加一个页面到侧边栏：[指路](/guide/在本网站创建一个文档/#创建一篇文章)

3. **部署时的坑！针对 GithubPages**

   由于 GitHubPages 在部署项目之后的域名自动带上项目名称

   ![image-20240817095415843](VitePress+GithubPage%E6%9E%84%E5%BB%BA%E7%BD%91%E7%AB%99.assets/image-20240817095415843.png)

   所以我们需要在 `.vitepress/config.mts` 文件中配置网站的基础路径，不然会丢失样式

   ![image-20240817095935364](VitePress+GithubPage%E6%9E%84%E5%BB%BA%E7%BD%91%E7%AB%99.assets/image-20240817095935364.png)

4. 网站首页使用的图片资源，例如：`logo.png` 等，建议保存在 public 目录下

   ![image-20240817100135489](VitePress+GithubPage%E6%9E%84%E5%BB%BA%E7%BD%91%E7%AB%99.assets/image-20240817100135489.png)

## 添加 Github Action

> [官方文档](https://docs.github.com/zh/actions/writing-workflows/workflow-syntax-for-github-actions)

在项目的根目录下创建一个 `.github/workflows` 文件夹

该文件下的所有 yml 文件都会被 github 识别然后根据不同的场景触发(push/pull request.....)指定的 Job

这里以我们本项目的 `deploy.yml` 为例子

```yaml
# 工作流的名称
name: Deploy

# 什么时候触发
on:
  # push 即触发，有很多，可以看 https://docs.github.com/zh/actions/writing-workflows/choosing-when-your-workflow-runs/events-that-trigger-workflows 这里面
  push:
  	# branches 筛选器，可以指定某一个分支触发了事件后才会工作
    branches:
      - main

# 具体的作业内容
jobs:
  # 这一级是 job_id，必须是字母或者_开头，只能包含字母数字字符、- 或 _,可以创建多个，例如
  ## deploy:
  ##   ...
  ## deploy_2:
  ##   ...
  deploy:
  	# 定义执行改作业的机器环境
  	## 有很多，公用库的可以看这里，感觉用 ubuntu-latest 就好了
    runs-on: ubuntu-latest
    # 这个作业会使用的权限，这里因为要把编译后的内容放在存储库中，所以需要 content.write
    permissions:
      contents: write
    # 这里就是具体的作业内容了
    steps:
      # uses 可以直接引用 docker hub 上的镜像，并使用
      ## 这里的 chekout 是拉取源代码
      - uses: actions/checkout@v3
        with:
          ## 所有所有历史记录
          fetch-depth: 0
      ## 使用 pnpm/action-setup@v2 安装 pnpm 包管理器
      - uses: pnpm/action-setup@v2
        with:
          ## 指定 pnpm 的版本，6.x 会报错不知道为啥
          version: 8
      ## 设置 Node.js 环境并缓存依赖
      - uses: actions/setup-node@v3
        with:
          node-version: 16
          cache: pnpm
      ## 使用 pnpm 安装项目依赖
      - run: pnpm install --frozen-lockfile

      ## 构建步骤，执行 pnpm docs:build 来构建文档
      - name: Build
        run: pnpm docs:build

	  ## 使用 peaceiris/actions-gh-pages@v3 可以把构建后的文档部署到我们仓库中 gh-pages 分支
      - name: Deploy
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: docs/.vitepress/dist
```

> 前期不熟，可以直接让 AI 帮忙写或者网上找(搞这个还删了一次库hh)

**注意：如果使用的 yml 里用的管理工具时 pnpm/yarn 这类的话，.gitignore 文件中不能忽略对应的 lock 文件**

![image-20240817103033224](VitePress+GithubPage%E6%9E%84%E5%BB%BA%E7%BD%91%E7%AB%99.assets/image-20240817103033224.png)

在仓库的 **Action 栏** 可以看到执行的情况

![image-20240817103220309](VitePress+GithubPage%E6%9E%84%E5%BB%BA%E7%BD%91%E7%AB%99.assets/image-20240817103220309.png)



## 配置 GihubPages

按照上述的步骤 deploy success 后仓库会有一个新的分支：**gh-pages**

打开项目的 **Settings** 栏，找到 **Pages**，在这里可以配置我们要部署的分支

![image-20240817103717997](VitePress+GithubPage%E6%9E%84%E5%BB%BA%E7%BD%91%E7%AB%99.assets/image-20240817103717997.png)

这里我们选择刚刚自动重建的 **gh-pages** 分支和 **(root)** ，点击 Save 就可以了

![image-20240817103831576](VitePress+GithubPage%E6%9E%84%E5%BB%BA%E7%BD%91%E7%AB%99.assets/image-20240817103831576.png)

部署后的域名规则：

1. **仓库名访问**：如果你的 GitHub Pages 部署在了 GitHub 用户名或组织的仓库中，访问地址通常是 `https://<username>.github.io/<repository-name>`。这里的 `<username>` 是你的 GitHub 用户名，`<repository-name>` 是你的仓库名。
2. **组织页面**：如果你的 GitHub Pages 部署在组织中，访问地址将是 `https://<organization>.github.io/<repository-name>`。

> 这里也就是：https://els-caramelteaegg.github.io/AiHub-Docs/









