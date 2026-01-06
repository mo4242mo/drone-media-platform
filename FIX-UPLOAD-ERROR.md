# 修复上传错误 - 完整指南

## 🔍 问题确认

### 当前状态
- ✅ **前端正常**：https://stdronemediastorage.z7.web.core.windows.net/
- ❌ **API 未部署**：Function App 中没有函数
- ❌ **上传失败**：返回 404 错误

### 根本原因
API 函数没有部署到 Azure Function App

---

## 🚀 解决方案

### 方案 A：GitHub Actions 自动部署（最推荐）

#### 第一步：获取发布凭据

在 PowerShell 中运行：

```powershell
# 获取发布凭据
az functionapp deployment list-publishing-credentials `
  --name func-drone-media-api `
  --resource-group rg-drone-media `
  --query "{username:publishingUserName, password:publishingPassword}" `
  --output json
```

#### 第二步：配置 GitHub Secrets

1. 访问 GitHub 仓库设置：
   - https://github.com/你的用户名/drone-media-platform/settings/secrets/actions

2. 点击 **New repository secret**

3. 添加两个 Secrets：
   
   **Secret 1:**
   - Name: `AZURE_FUNCTIONAPP_PUBLISH_USERNAME`
   - Value: 从上面命令获取的 `username`
   
   **Secret 2:**
   - Name: `AZURE_FUNCTIONAPP_PUBLISH_PASSWORD`
   - Value: 从上面命令获取的 `password`

#### 第三步：触发部署

**选项 1：推送代码触发**

```bash
# 对 API 做一个小修改来触发部署
cd api
echo "# Deployment trigger" >> README.md

# 提交并推送
git add .
git commit -m "fix: trigger API deployment"
git push origin main
```

**选项 2：手动触发工作流**

1. 访问：https://github.com/你的用户名/drone-media-platform/actions
2. 点击左侧 **Deploy API**
3. 点击右侧 **Run workflow**
4. 选择 `main` 分支
5. 点击绿色的 **Run workflow** 按钮

#### 第四步：等待部署完成

- 部署需要约 2-3 分钟
- 在 Actions 页面查看实时日志
- 看到绿色勾号表示成功 ✅

---

### 方案 B：使用 Azure Portal 部署中心

如果 GitHub Actions 遇到问题，使用这个备用方案：

#### 步骤：

1. **登录 Azure Portal**
   - https://portal.azure.com

2. **找到 Function App**
   - 搜索：`func-drone-media-api`

3. **进入部署中心**
   - 左侧菜单 → **Deployment Center**

4. **配置源代码**
   - Source: 选择 **GitHub**
   - 授权 GitHub 账号
   - Organization: 选择你的 GitHub 用户名
   - Repository: `drone-media-platform`
   - Branch: `main`

5. **保存**
   - Azure 会自动创建 GitHub Actions 工作流
   - 第一次部署自动开始

---

### 方案 C：本地直接部署（最快，但不推荐生产环境）

如果需要立即测试，可以从本地部署：

```powershell
# 进入 API 目录
cd api

# 确保依赖已安装
npm install

# 部署到 Azure
func azure functionapp publish func-drone-media-api --build remote
```

---

## ✅ 验证部署成功

### 1. 检查函数列表

```powershell
az functionapp function list `
  --name func-drone-media-api `
  --resource-group rg-drone-media `
  --query "[].name" `
  --output table
```

应该看到：
```
Result
----------
getMedia
uploadMedia
updateMedia
deleteMedia
```

### 2. 测试 API 端点

```powershell
# 测试获取媒体列表
Invoke-WebRequest -Uri "https://func-drone-media-api.azurewebsites.net/api/media" -Method GET

# 应该返回 200 状态码和空数组 []
```

### 3. 测试前端上传

1. 访问：https://stdronemediastorage.z7.web.core.windows.net/
2. 点击 **+ UPLOAD**
3. 选择一张图片
4. 填写标题
5. 点击 **UPLOAD MEDIA**
6. 应该成功上传 ✅

---

## 🔧 如果还是失败

### 检查环境变量配置

```powershell
# 列出所有应用设置
az functionapp config appsettings list `
  --name func-drone-media-api `
  --resource-group rg-drone-media `
  --query "[].{Name:name, Value:value}" `
  --output table
```

确保以下配置存在且正确：

| 配置名称 | 说明 |
|---------|------|
| `COSMOS_ENDPOINT` | Cosmos DB 端点 |
| `COSMOS_KEY` | Cosmos DB 密钥 |
| `COSMOS_DATABASE` | DroneMediaDB |
| `COSMOS_CONTAINER` | MediaAssets |
| `STORAGE_CONNECTION_STRING` | Storage Account 连接字符串 |
| `FUNCTIONS_WORKER_RUNTIME` | node |
| `FUNCTIONS_EXTENSION_VERSION` | ~4 |

### 如果环境变量缺失，添加它们：

```powershell
# 示例：添加 Cosmos DB 配置
az functionapp config appsettings set `
  --name func-drone-media-api `
  --resource-group rg-drone-media `
  --settings `
    COSMOS_ENDPOINT="https://cosmos-drone-media.documents.azure.com:443/" `
    COSMOS_KEY="你的密钥" `
    COSMOS_DATABASE="DroneMediaDB" `
    COSMOS_CONTAINER="MediaAssets" `
    STORAGE_CONNECTION_STRING="你的连接字符串"
```

### 检查 CORS 配置

```powershell
# 添加前端域名到 CORS
az functionapp cors add `
  --name func-drone-media-api `
  --resource-group rg-drone-media `
  --allowed-origins "https://stdronemediastorage.z7.web.core.windows.net"

# 或者暂时允许所有（仅用于测试）
az functionapp cors add `
  --name func-drone-media-api `
  --resource-group rg-drone-media `
  --allowed-origins "*"
```

### 重启 Function App

```powershell
az functionapp restart `
  --name func-drone-media-api `
  --resource-group rg-drone-media
```

---

## 📊 常见错误和解决方案

| 错误 | 原因 | 解决方案 |
|------|------|----------|
| 404 Not Found | 函数未部署 | 按上面步骤部署 API |
| 500 Internal Server Error | 环境变量配置错误 | 检查并添加环境变量 |
| CORS Error | 跨域配置问题 | 配置 CORS 允许前端域名 |
| 401 Unauthorized | 认证问题 | 检查 Function App 的认证设置 |
| Connection Timeout | 函数冷启动 | 等待 30 秒后重试 |

---

## 🎯 推荐执行顺序

1. ✅ **获取发布凭据**（5 分钟）
2. ✅ **配置 GitHub Secrets**（2 分钟）
3. ✅ **触发 GitHub Actions 部署**（3 分钟部署时间）
4. ✅ **验证部署成功**（1 分钟）
5. ✅ **测试上传功能**（1 分钟）

**总计约 12 分钟即可修复！**

---

## 📞 需要帮助？

如果遇到其他错误：

1. **查看 GitHub Actions 日志**
   - https://github.com/你的用户名/drone-media-platform/actions
   - 点击最新的运行查看详细日志

2. **查看 Function App 日志**
   ```powershell
   az webapp log tail `
     --name func-drone-media-api `
     --resource-group rg-drone-media
   ```

3. **查看 Application Insights**
   - Azure Portal → func-drone-media-api → Application Insights

---

**最后更新**：2026年1月6日

