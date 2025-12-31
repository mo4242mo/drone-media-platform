# 🚁 Drone Media Sharing Platform

A cloud-native drone media sharing platform built with Azure services, supporting image and video upload, browsing, editing, and deletion.

COM682 Cloud Native Development - CW2 Implementation

---

## 🌐 Live Demo

| Component | URL |
|-----------|-----|
| **Frontend** | https://stdronemediastorage.z7.web.core.windows.net |
| **API** | https://func-drone-media-api.azurewebsites.net/api |

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         User Browser                             │
└──────────────────────────────┬──────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│              Azure Blob Storage (Static Website)                 │
│                    Frontend HTML/CSS/JS                          │
└──────────────────────────────┬──────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Azure Functions (REST API)                    │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────┐│
│  │GetAllMedia│ │GetMedia │ │UploadMedia│ │UpdateMedia│ │Delete ││
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └────────┘│
└────────────────┬───────────────────────────────────┬────────────┘
                 │                               │
                 ▼                               ▼
┌────────────────────────────┐    ┌──────────────────────────────┐
│     Azure Cosmos DB        │    │    Azure Blob Storage        │
│     (Metadata Storage)     │    │    (Media File Storage)      │
│   DroneMediaDB/MediaAssets │    │       media container        │
└────────────────────────────┘    └──────────────────────────────┘
```

## ☁️ Azure Services

| Service | Purpose | Resource Name |
|---------|---------|---------------|
| **Blob Storage** | Static Website + Media Storage | stdronemediastorage |
| **Cosmos DB** | NoSQL Metadata Storage | cosmos-drone-media |
| **Functions** | Serverless REST API | func-drone-media-api |
| **Application Insights** | Monitoring & Logging | func-drone-media-api |
| **Monitor Alerts** | Alert Rules | 3 alert rules |

## 📡 API Endpoints

| Operation | Method | Endpoint |
|-----------|--------|----------|
| Get All Media | GET | `/api/getMedia` |
| Upload Media | POST | `/api/uploadMedia` |
| Update Media | PUT | `/api/updateMedia` |
| Delete Media | DELETE | `/api/deleteMedia` |

## 🔧 Tech Stack

**Frontend**
- HTML5 / CSS3 / JavaScript
- Responsive Design
- Dark Cyberpunk Theme UI

**Backend**
- Node.js 20
- Azure Functions v4 Programming Model
- @azure/cosmos SDK
- @azure/storage-blob SDK

**Database**
- Azure Cosmos DB (NoSQL)
- Partition Key: `/id`

## 🚀 CI/CD

Automated deployment using GitHub Actions:

- **Frontend Deployment**: Auto-deploy to Blob Storage on push to `main` branch
- **API Deployment**: Auto-deploy to Function App on push to `main` branch

Workflow files:
- `.github/workflows/deploy-frontend.yml` - Frontend deployment
- `.github/workflows/deploy-api.yml` - API deployment

## 📊 Monitoring & Alerts

| Alert | Condition | Severity |
|-------|-----------|----------|
| HTTP 5xx Errors | > 5 in 5min | Warning |
| Response Time | > 3 seconds | Info |
| Cosmos DB RU | > 1000 in 5min | Info |

## 📁 Project Structure

```
drone-media-platform/
├── .github/
│   └── workflows/
│       ├── deploy-frontend.yml    # Frontend CI/CD
│       └── deploy-api.yml         # API CI/CD
├── api/
│   ├── src/
│   │   ├── functions/
│   │   │   ├── getMedia.js        # GET all media
│   │   │   ├── uploadMedia.js     # POST upload
│   │   │   ├── updateMedia.js     # PUT update
│   │   │   └── deleteMedia.js     # DELETE media
│   │   └── index.js               # Entry point
│   ├── host.json                  # Function host config
│   └── package.json               # Dependencies
├── frontend/
│   ├── css/
│   │   └── style.css              # Styles
│   ├── js/
│   │   ├── api.js                 # API client
│   │   ├── app.js                 # Main app logic
│   │   └── config.js              # Configuration
│   └── index.html                 # Main page
├── CICD-SETUP.md                  # CI/CD Setup Guide
└── README.md                      # This file
```

## 🚦 Getting Started

### Prerequisites
- Azure Account
- Azure CLI installed
- Node.js 18+ installed
- Git

### Local Development

1. **Clone the repository**
```bash
git clone https://github.com/mo4242mo/drone-media-platform.git
cd drone-media-platform
```

2. **Configure API locally**
```bash
cd api
npm install
cp local.settings.json.example local.settings.json
# Edit local.settings.json with your Azure credentials
func start
```

3. **Open frontend**
```bash
cd frontend
# Open index.html in browser or use live server
```

### Deployment

#### Deploy Frontend
```bash
az storage blob upload-batch \
  --account-name stdronemediastorage \
  --destination '$web' \
  --source ./frontend \
  --overwrite \
  --auth-mode key
```

#### Deploy API
```bash
cd api
func azure functionapp publish func-drone-media-api
```

Or use GitHub Actions (automatic on push to main branch).

## 📝 Environment Variables

Create `api/local.settings.json`:

```json
{
  "IsEncrypted": false,
  "Values": {
    "AzureWebJobsStorage": "UseDevelopmentStorage=true",
    "FUNCTIONS_WORKER_RUNTIME": "node",
    "COSMOS_DB_ENDPOINT": "https://your-cosmosdb.documents.azure.com:443/",
    "COSMOS_DB_KEY": "your-cosmos-key",
    "STORAGE_ACCOUNT_NAME": "your-storage-account",
    "STORAGE_CONNECTION_STRING": "your-connection-string"
  }
}
```

## 🔒 Security

- All sensitive credentials are stored in GitHub Secrets for CI/CD
- Local development uses `local.settings.json` (not committed)
- Cosmos DB uses secure connection strings
- Blob Storage uses SAS tokens for secure file access

## 👨‍💻 Developer

COM682 Cloud Native Development - Coursework 2

Solent University

## 📄 License

This project is for academic purposes only.

---

**Built with Azure ☁️**
