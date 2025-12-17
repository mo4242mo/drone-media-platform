# CI/CD 设置指南

## 📋 概述

本项目使用 GitHub Actions 实现持续集成/持续部署 (CI/CD)：
- **前端**: 自动部署到 Azure Blob Storage 静态网站
- **API**: 自动部署到 Azure Functions

---

## 🔐 配置 GitHub Secrets

在 GitHub 仓库中需要配置以下 Secrets：

### 1. AZURE_CREDENTIALS

用于 Azure CLI 登录的服务主体凭据。

**获取方式**（在 Azure CLI 中运行）:
```bash
az ad sp create-for-rbac --name "github-actions-drone-media" \
  --role contributor \
  --scopes /subscriptions/{subscription-id}/resourceGroups/rg-drone-media \
  --sdk-auth
```

将输出的 JSON 复制到 GitHub Secret `AZURE_CREDENTIALS`。

### 2. AZURE_FUNCTIONAPP_PUBLISH_PROFILE

用于部署 Azure Functions 的发布配置文件。

**获取方式**:
1. 登录 Azure Portal
2. 进入 Function App: `func-drone-media-api`
3. 点击 "Get publish profile" 下载
4. 将文件内容复制到 GitHub Secret `AZURE_FUNCTIONAPP_PUBLISH_PROFILE`

或使用 Azure CLI:
```bash
az functionapp deployment list-publishing-profiles \
  --name func-drone-media-api \
  --resource-group rg-drone-media \
  --xml
```

---

## 📁 工作流文件

### 前端部署 (`.github/workflows/deploy-frontend.yml`)
- **触发条件**: 推送到 `main` 分支且 `frontend/` 目录有更改
- **操作**: 上传前端文件到 Azure Blob Storage `$web` 容器

### API 部署 (`.github/workflows/deploy-api.yml`)
- **触发条件**: 推送到 `main` 分支且 `api/` 目录有更改
- **操作**: 构建并部署到 Azure Functions

---

## 🚀 手动触发部署

两个工作流都支持手动触发：
1. 进入 GitHub 仓库的 Actions 页面
2. 选择工作流
3. 点击 "Run workflow"

---

## ✅ 验证部署

### 前端
访问: https://stdronemediastorage.z7.web.core.windows.net

### API
测试: https://func-drone-media-api.azurewebsites.net/api/media

---

## 📊 监控告警

已配置以下 Azure Monitor 告警规则：

| 告警名称 | 条件 | 严重性 |
|---------|------|--------|
| alert-api-errors | HTTP 5xx > 5 次/5分钟 | 2 (警告) |
| alert-api-response-time | 平均响应时间 > 3秒 | 3 (信息) |
| alert-cosmosdb-ru | RU 消耗 > 1000/5分钟 | 3 (信息) |

---

## 🔗 相关链接

- [Azure Portal](https://portal.azure.com)
- [GitHub Actions 文档](https://docs.github.com/en/actions)
- [Azure Functions 部署](https://docs.microsoft.com/azure/azure-functions/functions-continuous-deployment)


