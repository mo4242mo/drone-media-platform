# CI/CD Setup Guide

## 📋 Overview

This project uses GitHub Actions for Continuous Integration/Continuous Deployment (CI/CD):
- **Frontend**: Automatically deploys to Azure Blob Storage Static Website
- **API**: Automatically deploys to Azure Functions

---

## 🔐 Configure GitHub Secrets

The following Secrets need to be configured in your GitHub repository:

### 1. AZURE_STORAGE_KEY

Storage Account access key for deploying the frontend.

**How to obtain** (via Azure Portal):
1. Login to Azure Portal
2. Navigate to Storage Account: `stdronemediastorage`
3. Go to **Access keys**
4. Copy **key1** or **key2** (the Key value, not the connection string)
5. Add to GitHub Secret `AZURE_STORAGE_KEY`

Or via Azure CLI:
```bash
az storage account keys list \
  --account-name stdronemediastorage \
  --resource-group rg-drone-media \
  --query "[0].value" \
  --output tsv
```

### 2. AZURE_FUNCTIONAPP_PUBLISH_PROFILE

Publish profile for deploying Azure Functions.

**How to obtain**:
1. Login to Azure Portal
2. Navigate to Function App: `func-drone-media-api`
3. Click **"Get publish profile"** to download
4. Open the downloaded `.PublishSettings` file with a text editor
5. Copy the entire file content (from `<publishData>` to `</publishData>`)
6. Add to GitHub Secret `AZURE_FUNCTIONAPP_PUBLISH_PROFILE`

**Note**: Do not use Azure CLI to obtain this, as it may redact sensitive information. Always download from the Portal.

---

## 📁 Workflow Files

### `.github/workflows/deploy-frontend.yml`

Deploys the frontend to Azure Blob Storage static website.

**Trigger Conditions**:
- Push to `main` branch
- Changes in `frontend/**` directory
- Changes in `.github/workflows/deploy-frontend.yml` file

**Steps**:
1. Checkout code
2. Setup Azure CLI
3. Upload frontend files to `$web` container

**Environment Variables**:
- `AZURE_STORAGE_ACCOUNT`: stdronemediastorage
- `AZURE_CONTAINER`: $web

### `.github/workflows/deploy-api.yml`

Deploys the API to Azure Functions.

**Trigger Conditions**:
- Push to `main` branch
- Changes in `api/**` directory
- Changes in `.github/workflows/deploy-api.yml` file

**Steps**:
1. Checkout code
2. Setup Node.js 20
3. Install dependencies
4. Deploy to Azure Functions using ZipDeploy

**Environment Variables**:
- `AZURE_FUNCTIONAPP_NAME`: func-drone-media-api
- `NODE_VERSION`: '20.x'

---

## 🎯 Testing CI/CD

### Method 1: Make a Code Change

1. Make a small change to a file (e.g., add a comment)
2. Commit and push to `main` branch:
```bash
git add .
git commit -m "Test CI/CD"
git push
```
3. Visit GitHub Actions page to view workflow progress

### Method 2: Re-run Workflows

1. Visit: https://github.com/[your-username]/[repo-name]/actions
2. Select a previous workflow run
3. Click **"Re-run all jobs"**

---

## 📊 Monitoring Deployments

### Check Deployment Status

**GitHub Actions Dashboard**:
- URL: `https://github.com/[username]/[repo]/actions`
- View real-time deployment logs
- Check success/failure status

**Azure Portal**:
- Function App: Check **Deployment Center** for deployment history
- Storage Account: Verify files in `$web` container

### Common Issues

#### Issue 1: Frontend Deployment Fails
- **Error**: `AuthenticationFailed` or `InvalidKey`
- **Solution**: Verify `AZURE_STORAGE_KEY` is correct (not a connection string)

#### Issue 2: API Deployment Fails
- **Error**: `Unauthorized (CODE: 401)`
- **Solution**: Re-download publish profile from Portal (not CLI)

#### Issue 3: Workflow Not Triggering
- **Cause**: Path filters don't match changed files
- **Solution**: Ensure changes are in `frontend/**` or `api/**` directories

---

## 🚀 Deployment Flow

```
Developer
    │
    │ git push
    ▼
GitHub (main branch)
    │
    ├─────────────────────────────┐
    │                             │
    ▼                             ▼
Deploy Frontend              Deploy API
(GitHub Actions)         (GitHub Actions)
    │                             │
    │ az storage blob             │ func azure
    │ upload-batch                │ functionapp publish
    ▼                             ▼
Azure Blob Storage          Azure Functions
($web container)            (func-drone-media-api)
    │                             │
    │                             │
    └──────────┬──────────────────┘
               │
               ▼
         Live Application
    (Users can access updated site)
```

---

## 🔄 Manual Deployment (Fallback)

If CI/CD fails, you can deploy manually:

### Deploy Frontend Manually
```bash
az storage blob upload-batch \
  --account-name stdronemediastorage \
  --account-key <your-storage-key> \
  --destination '$web' \
  --source ./frontend \
  --overwrite
```

### Deploy API Manually
```bash
cd api
func azure functionapp publish func-drone-media-api
```

---

## 📝 Best Practices

1. **Test Locally First**: Always test changes locally before pushing
2. **Small Commits**: Make small, focused commits for easier debugging
3. **Monitor Logs**: Check GitHub Actions logs for deployment issues
4. **Secret Rotation**: Regularly rotate keys and update GitHub Secrets
5. **Branch Protection**: Consider requiring CI/CD success before merging

---

## 🔒 Security Notes

- Never commit secrets to the repository
- All sensitive credentials are stored in GitHub Secrets
- Storage keys and publish profiles should be rotated regularly
- Use `.gitignore` to exclude `local.settings.json`

---

## 📞 Support

For issues with CI/CD:
1. Check GitHub Actions logs
2. Verify Azure resource status in Portal
3. Confirm GitHub Secrets are correctly configured
4. Review workflow YAML syntax

**Common Commands**:
```bash
# Check Azure CLI login
az account show

# List Function Apps
az functionapp list --resource-group rg-drone-media

# Check Storage Account
az storage account show --name stdronemediastorage
```

---

**Last Updated**: December 26, 2025
