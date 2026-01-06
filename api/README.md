# Azure Functions API 配置指南

## ✅ 当前配置状态

您的 Azure Functions 已经完全配置好了！

### 已安装的工具
- ✅ Azure Functions Core Tools v4.6.0
- ✅ VS Code Azure Functions 扩展
- ✅ Node.js 依赖包

### 配置文件
- ✅ `host.json` - Functions 主机配置
- ✅ `local.settings.json` - 本地环境变量
- ✅ `package.json` - 项目依赖
- ✅ `.vscode/` - VS Code 配置

## 🚀 如何运行函数

### 方法 1: 使用 VS Code（推荐）
1. 按 `F5` 或点击"运行和调试"
2. 选择 "Attach to Node Functions"
3. Functions 将在 `http://localhost:7071` 启动

### 方法 2: 使用命令行
```bash
cd api
npm start
```

## 📡 可用的 API 端点

### 1. 获取所有媒体
- **GET** `http://localhost:7071/api/media`
- 返回所有媒体资源列表

### 2. 上传媒体
- **POST** `http://localhost:7071/api/media`
- 上传新的图片/视频文件

### 3. 更新媒体
- **PUT** `http://localhost:7071/api/media/{id}`
- 更新媒体的标题和描述

### 4. 删除媒体
- **DELETE** `http://localhost:7071/api/media/{id}`
- 删除指定的媒体资源

## 🔧 环境变量配置

所有敏感配置都在 `local.settings.json` 中：

```json
{
  "STORAGE_CONNECTION_STRING": "Azure Blob Storage 连接字符串",
  "COSMOS_ENDPOINT": "Cosmos DB 端点",
  "COSMOS_KEY": "Cosmos DB 密钥",
  "COSMOS_DATABASE": "DroneMediaDB",
  "COSMOS_CONTAINER": "MediaAssets"
}
```

⚠️ **安全提示**: `local.settings.json` 包含敏感信息，已被 `.gitignore` 忽略，不会提交到 Git。

## 🧪 测试函数

### 使用 REST Client（VS Code 扩展）
安装 REST Client 扩展后，可以创建 `.http` 文件进行测试：

```http
### 获取所有媒体
GET http://localhost:7071/api/media

### 上传媒体（需要表单数据）
POST http://localhost:7071/api/media
Content-Type: multipart/form-data
```

### 使用 curl
```bash
# 获取所有媒体
curl http://localhost:7071/api/media

# 删除媒体
curl -X DELETE http://localhost:7071/api/media/{id}
```

## 📦 项目结构

```
api/
├── host.json                 # Functions 主机配置
├── local.settings.json       # 本地环境变量（不提交到 Git）
├── package.json              # Node.js 依赖
└── src/
    ├── index.js              # 入口文件，加载所有函数
    └── functions/
        ├── getMedia.js       # 获取媒体函数
        ├── uploadMedia.js    # 上传媒体函数
        ├── updateMedia.js    # 更新媒体函数
        └── deleteMedia.js    # 删除媒体函数
```

## 🔍 调试技巧

1. **查看日志**: Functions 运行时会在终端显示所有日志
2. **断点调试**: 在代码中设置断点，按 F5 启动调试
3. **查看请求**: 每个 HTTP 请求都会在终端显示详细信息

## 🚨 常见问题

### Q: 端口 7071 已被占用
**A**: 停止其他正在运行的 Functions 实例，或在 `host.json` 中修改端口

### Q: Cosmos DB 连接失败
**A**: 检查 `local.settings.json` 中的 `COSMOS_ENDPOINT` 和 `COSMOS_KEY` 是否正确

### Q: 文件上传失败
**A**: 检查 `STORAGE_CONNECTION_STRING` 是否配置正确

## 📚 更多资源

- [Azure Functions 文档](https://docs.microsoft.com/azure/azure-functions/)
- [Azure Functions v4 编程模型](https://learn.microsoft.com/azure/azure-functions/functions-reference-node)
- [Cosmos DB SDK](https://docs.microsoft.com/azure/cosmos-db/sql/sql-api-nodejs-get-started)
- [Azure Blob Storage SDK](https://docs.microsoft.com/azure/storage/blobs/storage-quickstart-blobs-nodejs)

## 🎯 下一步

现在您可以：
1. ✅ 按 F5 启动函数进行本地测试
2. ✅ 在浏览器中打开 `frontend/index.html` 测试完整应用
3. ✅ 使用 Azure 扩展部署到云端

祝您开发顺利！🚀

---

**部署状态**: 准备部署到 Azure Functions

