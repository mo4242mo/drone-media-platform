# 下一步操作清单

## 🚀 立即行动

### 方案 A：使用 Azure Portal 部署中心（推荐新手）

1. **访问 Azure Portal**
   - https://portal.azure.com
   
2. **配置部署中心**
   - Function App → `func-drone-media-api`
   - Deployment Center → GitHub
   - 连接仓库：`drone-media-platform`
   - 分支：`main`
   
3. **等待自动部署**
   - Azure 会自动配置 GitHub Actions
   - 第一次部署约需 3-5 分钟

---

### 方案 B：手动触发 GitHub Actions（最快）

1. **访问 GitHub Actions**
   - https://github.com/mo4242mo/drone-media-platform/actions
   
2. **运行工作流**
   - 点击 "Deploy API"
   - 点击 "Run workflow"
   - 选择 `main` 分支
   - 点击绿色按钮确认

3. **查看部署日志**
   - 等待约 2-3 分钟
   - 查看是否有错误

---

## ⚠️ 如果 GitHub Actions 失败

### 检查 GitHub Secrets

需要配置以下 Secrets：

1. **获取发布凭据**（PowerShell）：

```powershell
az functionapp deployment list-publishing-credentials `
  --name func-drone-media-api `
  --resource-group rg-drone-media `
  --query "{username:publishingUserName, password:publishingPassword}"
```

2. **添加到 GitHub**：
   - 仓库 → Settings → Secrets and variables → Actions
   - 添加：
     - `AZURE_FUNCTIONAPP_PUBLISH_USERNAME`
     - `AZURE_FUNCTIONAPP_PUBLISH_PASSWORD`

---

## ✅ 验证部署成功

### 测试 API 端点

```powershell
# 测试 GET
Invoke-WebRequest -Uri "https://func-drone-media-api.azurewebsites.net/api/getMedia"

# 测试 POST
$body = @{
    title = "测试"
    description = "测试描述"
} | ConvertTo-Json

Invoke-WebRequest -Uri "https://func-drone-media-api.azurewebsites.net/api/uploadMedia" `
  -Method POST `
  -Body $body `
  -ContentType "application/json"
```

### 查看函数列表

```powershell
az functionapp function list `
  --name func-drone-media-api `
  --resource-group rg-drone-media `
  --query "[].name" `
  --output table
```

应该看到：
- GetAllMedia
- GetMedia
- UploadMedia
- UpdateMedia
- DeleteMedia

---

## 📊 监控和日志

### 实时日志流

```powershell
az webapp log tail `
  --name func-drone-media-api `
  --resource-group rg-drone-media
```

### Application Insights

访问 Azure Portal：
- Function App → Application Insights
- 查看请求、错误、性能指标

---

## 🔧 常见问题修复

### 问题：函数列表为空

**解决方案**：

```powershell
# 重启 Function App
az functionapp restart `
  --name func-drone-media-api `
  --resource-group rg-drone-media
```

### 问题：API 返回 404

**检查**：
1. 函数是否已部署
2. URL 是否正确
3. 函数是否启用

### 问题：API 返回 500

**检查**：
1. 环境变量是否配置
2. Cosmos DB 连接是否正常
3. Storage Account 连接是否正常

---

## 📚 相关文档

- [DEPLOYMENT-GUIDE.md](./DEPLOYMENT-GUIDE.md) - 完整部署指南
- [CICD-SETUP.md](./CICD-SETUP.md) - CI/CD 配置说明
- [README.md](./README.md) - 项目文档

---

## 🎓 今天学到的知识

1. ✅ Azure CLI 基本操作
2. ✅ Azure Functions 的 4 种部署方式
3. ✅ GitHub Actions 工作流触发
4. ✅ PowerShell 基本命令
5. ✅ 如何创建 ZIP 部署包
6. ✅ 如何验证和测试 API

---

**记住**：实际生产环境中，**GitHub Actions 自动部署**是最佳实践！

**最后更新**：2026年1月6日

