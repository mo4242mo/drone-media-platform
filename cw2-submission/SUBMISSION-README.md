# COM682 CW2 Submission Documentation

**Student**: [Your Name and Student ID]  
**Project**: Drone Media Sharing Platform - Cloud Native Implementation  
**Submission Date**: December 26, 2025

---

## 📦 Submission Contents

This folder contains the complete code implementation for CW2, including:

### 1. Frontend (`frontend/`)
- **Static Website**: HTML + CSS + JavaScript
- **Deployment**: Azure Blob Storage Static Website Hosting
- **Live URL**: https://stdronemediastorage.z7.web.core.windows.net

### 2. Backend API (`api/`)
- **Azure Functions**: Node.js v4 Programming Model
- **REST API Endpoints**: Complete CRUD Operations
- **Deployment**: Azure Function App
- **API Base URL**: https://func-drone-media-api.azurewebsites.net/api

### 3. CI/CD Configuration (`.github/workflows/`)
- **Deploy Frontend**: Automated deployment to Blob Storage
- **Deploy API**: Automated deployment to Function App
- **Trigger**: Every push to main branch

### 4. Documentation
- **README.md**: Complete project documentation
- **CICD-SETUP.md**: CI/CD configuration guide
- **.gitignore**: Excludes sensitive information and temporary files

---

## ✅ CW2 Requirements Implementation Status

| Requirement | Status | Description |
|-------------|--------|-------------|
| **Cloud-Native Storage (Blob Storage)** | ✅ | Store media files (images/videos) |
| **NoSQL Database (Cosmos DB)** | ✅ | Store metadata (title/description/tags) |
| **REST API (Azure Functions)** | ✅ | Complete CRUD operations |
| **CRUD Functionality** | ✅ | Create/Read/Update/Delete all implemented |
| **CI/CD (GitHub Actions)** | ✅ | Automated deployment for frontend and backend |
| **Application Insights** | ✅ | Monitor API performance and errors |
| **Azure Monitor Alerts** | ✅ | Configured alert rules |

---

## 🏗️ Azure Resources List

### Core Resources
1. **Resource Group**: `rg-drone-media`
2. **Storage Account**: `stdronemediastorage`
   - Blob Container: `media` (stores media files)
   - Static Website: `$web` (hosts frontend)
3. **Cosmos DB**: `cosmos-drone-media`
   - Database: `DroneMediaDB`
   - Container: `MediaAssets` (partition key: `/id`)
4. **Function App**: `func-drone-media-api`
   - Runtime: Node.js 20
   - Plan: Consumption (pay-per-use)

### Advanced Services
5. **Application Insights**: `appi-drone-media`
   - Real-time API request monitoring
   - Performance metrics tracking
   - Error log collection
6. **Azure Monitor Alerts**
   - High response time alert (>2 seconds)
   - High error rate alert (>5%)

---

## 🔗 API Endpoints List

| Endpoint | Method | Function | URL |
|----------|--------|----------|-----|
| `/getMedia` | GET | Retrieve all media assets | https://func-drone-media-api.azurewebsites.net/api/getMedia |
| `/uploadMedia` | POST | Upload new media | https://func-drone-media-api.azurewebsites.net/api/uploadMedia |
| `/updateMedia` | PUT | Update media information | https://func-drone-media-api.azurewebsites.net/api/updateMedia |
| `/deleteMedia` | DELETE | Delete media | https://func-drone-media-api.azurewebsites.net/api/deleteMedia |

---

## 🎬 Video Demonstration Content

The video demonstration includes:

1. **Application Functionality Demo**
   - CREATE: Upload new media files
   - READ: Browse media list and details
   - UPDATE: Edit media information
   - DELETE: Delete media assets

2. **Azure Resources Showcase**
   - Resource Group in Azure Portal
   - Storage Account (Blob + Static Website)
   - Cosmos DB (Database + Container)
   - Function App (API Configuration)

3. **CI/CD Demonstration**
   - GitHub Actions workflows
   - Automated deployment process
   - Deployment history

4. **Advanced Features Showcase**
   - Application Insights monitoring dashboard
   - Azure Monitor alert rules
   - Real-time performance metrics

---

## 📝 Technology Stack

### Frontend
- HTML5 + CSS3
- Vanilla JavaScript (ES6+)
- Azure Blob Storage Static Website Hosting

### Backend
- Azure Functions (Node.js v4 Model)
- Azure Cosmos DB (NoSQL)
- Azure Blob Storage (File Storage)

### DevOps
- GitHub Actions (CI/CD)
- Azure CLI
- Git Version Control

### Monitoring
- Application Insights
- Azure Monitor
- Log Analytics

---

## 🔒 Security Notes

- All sensitive information (API keys, connection strings) is managed through GitHub Secrets
- This submission code does not contain any sensitive information
- `local.settings.json` (contains local development keys) has been excluded

---

## 📞 Contact Information

For any questions, please contact:
- **Email**: [Your Email]
- **GitHub**: https://github.com/mo4242mo/drone-media-platform

---

## 📄 License

MIT License - See README.md for details
