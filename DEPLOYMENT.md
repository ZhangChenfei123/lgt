# 部署指南 - 长期链接

## 方案一：使用 Render 部署（推荐）

### 步骤：

1. **创建 GitHub 仓库**
   - 登录 https://github.com
   - 创建一个新仓库（可以是私有仓库）

2. **推送代码到 GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/你的用户名/你的仓库名.git
   git push -u origin main
   ```

3. **部署到 Render**
   - 登录 https://render.com
   - 点击 "New" -> "Web Service"
   - 选择你的 GitHub 仓库
   - 配置选项：
     - Name: 随便取一个名字
     - Runtime: Node
     - Build Command: `npm install && npm run build`
     - Start Command: `npm start`
   - 点击 "Deploy"

4. **获取链接**
   - 部署完成后，你会得到一个类似 `https://your-app-name.onrender.com` 的链接
   - 发给朋友的链接：`https://your-app-name.onrender.com`
   - 查看记录的链接：`https://your-app-name.onrender.com/admin`

## 方案二：使用 Railway 部署

### 步骤：

1. **创建 GitHub 仓库**（同上）

2. **部署到 Railway**
   - 登录 https://railway.app
   - 点击 "New Project" -> "Deploy from GitHub repo"
   - 选择你的仓库
   - Railway 会自动检测并部署

3. **获取链接**
   - 部署完成后会得到一个 `.railway.app` 的链接

## 方案三：使用 Vercel 部署

### 步骤：

1. **创建 GitHub 仓库**（同上）

2. **部署到 Vercel**
   - 登录 https://vercel.com
   - 点击 "Add New" -> "Project"
   - 导入你的 GitHub 仓库
   - 点击 "Deploy"

## 注意事项：

1. **数据库持久化**：当前使用的是 JSON 文件存储，数据会保存在服务器上。如果部署平台重启实例，数据可能会丢失。对于长期使用，建议考虑使用外部数据库（如 MongoDB Atlas）。

2. **免费套餐限制**：
   - Render 免费套餐：750小时/月，15分钟无活动后会休眠
   - Railway 免费套餐：$5/月额度
   - Vercel：Serverless Function 有调用次数限制

3. **自定义域名**：所有平台都支持自定义域名绑定，如果需要更友好的链接，可以绑定自己的域名。

## 项目结构：

```
lgt/
├── api/                    # 后端代码
│   ├── routes/
│   │   ├── auth.ts
│   │   └── choices.ts     # 选择记录 API
│   ├── app.ts             # Express 应用配置
│   ├── db.ts              # 数据存储逻辑
│   └── server.ts          # 服务器入口
├── src/                   # 前端代码
│   ├── pages/
│   │   ├── Home.tsx       # 问答页面
│   │   ├── Result.tsx     # 结果页面
│   │   └── Admin.tsx      # 管理员页面
│   ├── App.tsx
│   └── main.tsx
├── dist/                  # 构建产物
├── vercel.json            # Vercel 配置
├── package.json
└── README.md
```

## API 端点：

- `POST /api/choices` - 记录用户选择
- `GET /api/choices` - 获取所有选择记录