// ============================================
// Drone Media Sharing Platform - Configuration
// ============================================

const CONFIG = {
    // Azure Function App API Base URL
    // 本地开发时使用: http://localhost:7071/api
    // 部署后替换为实际的Function App URL
    API_BASE_URL: 'https://func-drone-media-api.azurewebsites.net/api',
    
    // Storage Account 信息（用于直接访问blob）
    STORAGE_ACCOUNT: 'stdronemediastorage',
    STORAGE_CONTAINER: 'media',
    
    // 支持的文件类型
    ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
    ALLOWED_VIDEO_TYPES: ['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/webm'],
    
    // 文件大小限制 (50MB)
    MAX_FILE_SIZE: 50 * 1024 * 1024,
    
    // 分页设置
    PAGE_SIZE: 20
};

// 获取Blob URL
function getBlobUrl(fileName) {
    return `https://${CONFIG.STORAGE_ACCOUNT}.blob.core.windows.net/${CONFIG.STORAGE_CONTAINER}/${fileName}`;
}

// 检查是否为图片
function isImage(contentType) {
    return CONFIG.ALLOWED_IMAGE_TYPES.includes(contentType);
}

// 检查是否为视频
function isVideo(contentType) {
    return CONFIG.ALLOWED_VIDEO_TYPES.includes(contentType);
}

// 格式化文件大小
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// 格式化日期
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

