# Azure Functions 部署完整指南

## 🎯 方法一：GitHub Actions 自动部署（推荐）

### 前提条件

1. **GitHub Secrets 配置**

需要在 GitHub 仓库设置中添加以下 Secrets：

访问：https://github.com/你的用户名/你的仓库/settings/secrets/actions

#### 获取发布凭据（PowerShell）：

```powershell
# 方法 1: 获取用户名和密码
az functionapp deployment list-publishing-credentials `
  --name func-drone-media-api `
  --resource-group rg-drone-media
```

将结果添加到 GitHub Secrets：
- `AZURE_FUNCTIONAPP_PUBLISH_USERNAME` = publishingUserName
- `AZURE_FUNCTIONAPP_PUBLISH_PASSWORD` = publishingPassword

### 部署步骤

1. **修改代码后提交**

```powershell
# 查看状态
git status

# 添加修改的文件
git add api/

# 提交
git commit -m "update: 更新 API 函数"

# 推送到 main 分支
git push origin main
```

2. **查看部署进度**

- 访问：https://github.com/你的用户名/你的仓库/actions
- 点击最新的 "Deploy API" 工作流
- 查看部署日志

3. **验证部署**

```powershell
# 测试 API
curl https://func-drone-media-api.azurewebsites.net/api/getMedia
```

---

## 🔧 方法二：Azure CLI ZIP Deploy

### 步骤

1. **进入 API 目录**

```powershell
cd api
```

2. **创建部署包**

```powershell
# 安装依赖
npm install

# 打包（包含 node_modules）
Compress-Archive -Path host.json, package.json, package-lock.json, node_modules, src -DestinationPath deploy.zip -Force
```

3. **部署到 Azure**

```powershell
az functionapp deployment source config-zip `
  --resource-group rg-drone-media `
  --name func-drone-media-api `
  --src deploy.zip
```

---

## 💻 方法三：Azure Functions Core Tools

### 步骤

1. **确保已安装 Core Tools**

```powershell
func --version
```

如果没有安装：

```powershell
npm install -g azure-functions-core-tools@4
```

2. **部署**

```powershell
cd api
func azure functionapp publish func-drone-media-api
```

### 可选参数：

```powershell
# 使用远程构建
func azure functionapp publish func-drone-media-api --build remote

# 强制覆盖
func azure functionapp publish func-drone-media-api --force
```

---

## 🔍 验证和测试

### 1. 检查函数列表

```powershell
az functionapp function list `
  --name func-drone-media-api `
  --resource-group rg-drone-media `
  --query "[].{Name:name}" `
  --output table
```

### 2. 查看实时日志

```powershell
func azure functionapp logstream func-drone-media-api
```

或使用 Azure CLI：

```powershell
az webapp log tail `
  --name func-drone-media-api `
  --resource-group rg-drone-media
```

### 3. 测试 API 端点

```powershell
# 测试 GET
Invoke-WebRequest -Uri "https://func-drone-media-api.azurewebsites.net/api/getMedia" -Method GET

# 测试 POST（上传）
$body = @{
    title = "测试媒体"
    description = "测试描述"
} | ConvertTo-Json

Invoke-WebRequest -Uri "https://func-drone-media-api.azurewebsites.net/api/uploadMedia" `
  -Method POST `
  -Body $body `
  -ContentType "application/json"
```

---

## ⚙️ 配置环境变量

### 在 Azure Portal 配置

1. 访问 Azure Portal
2. 进入 Function App: `func-drone-media-api`
3. 左侧菜单 → **Configuration** → **Application settings**
4. 点击 **+ New application setting**

### 使用 Azure CLI 配置

```powershell
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

---

## 🔄 重启 Function App

如果部署后函数没有显示，尝试重启：

```powershell
az functionapp restart `
  --name func-drone-media-api `
  --resource-group rg-drone-media
```

---

## ⚠️ 常见问题

### 问题 1: "Invalid URI: The URI scheme is not valid"

**原因**: AzureWebJobsStorage 配置问题

**解决方案**:

```powershell
# 检查配置
az functionapp config appsettings list `
  --name func-drone-media-api `
  --resource-group rg-drone-media `
  --query "[?name=='AzureWebJobsStorage']"

# 如果值为空或无效，重新设置
az functionapp config appsettings set `
  --name func-drone-media-api `
  --resource-group rg-drone-media `
  --settings AzureWebJobsStorage="你的存储连接字符串"
```

### 问题 2: 部署超时

**解决方案**: 使用 GitHub Actions 或创建更小的部署包

### 问题 3: CORS 错误

**解决方案**:

```powershell
az functionapp cors add `
  --name func-drone-media-api `
  --resource-group rg-drone-media `
  --allowed-origins "https://stdronemediastorage.z7.web.core.windows.net"
```

---

## 📝 最佳实践

1. **优先使用 GitHub Actions**：自动化、可追溯、可回滚
2. **本地测试**：使用 `func start` 在本地测试
3. **环境分离**：使用不同的 Function App 用于开发和生产
4. **监控**：配置 Application Insights 监控性能
5. **日志**：定期检查日志排查问题

---

## 🎓 学习资源

- [Azure Functions 文档](https://docs.microsoft.com/azure/azure-functions/)
- [GitHub Actions 部署](https://docs.github.com/actions)
- [Azure CLI 参考](https://docs.microsoft.com/cli/azure/functionapp)

---

**最后更新**: 2026年1月6日

