# 新世界新闻

IB 中文创意新闻编辑部，使用 React、TypeScript 和 Vite。

## 本地运行

```sh
npm ci
npm run dev
```

生产构建：`npm run build`；本地生产服务：`npm start`。

源码已包含新闻、档案和配图。单文件离线版可运行 `npx vite build --config vite.singlefile.config.ts`，输出到 `dist-singlefile/`；Vercel 使用标准构建 `dist/`。

## Vercel 部署

`vercel.json` 配置前端路由与 `/api` 服务函数。分享记录在 Vercel 上使用私有 Vercel Blob 存储，需要为项目配置 `BLOB_READ_WRITE_TOKEN`（连接 Blob store 后自动提供）。本地开发默认保存到 `data/shares.json`，该文件不会上传 GitHub。

GitHub 的 `main` 分支已连接 Vercel，推送后自动部署。也可运行 `vercel --prod`。

编辑状态保存在当前浏览器；使用“云端分享”发布公开新闻后，读者可通过 `/s/<id>` 阅读，后续发布会更新同一个链接。前端角色登录是创意作业演示机制。
