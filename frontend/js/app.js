// ============================================
// Drone Media Sharing Platform - Main Application
// ============================================

// 全局状态
let mediaList = [];
let currentFilter = 'all';
let currentMediaId = null;
let selectedFile = null;

// ============================================
// 初始化
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    initApp();
    setupDragAndDrop();
});

async function initApp() {
    await loadMedia();
}

// ============================================
// 媒体加载和显示
// ============================================
async function loadMedia() {
    showLoading(true);
    
    try {
        mediaList = await API.getAllMedia();
        renderMediaGrid();
        updateStats();
    } catch (error) {
        console.error('Failed to load media:', error);
        showToast('Failed to load media', 'error');
    } finally {
        showLoading(false);
    }
}

function renderMediaGrid() {
    const grid = document.getElementById('mediaGrid');
    const emptyState = document.getElementById('emptyState');
    
    // 应用筛选
    let filteredList = mediaList;
    if (currentFilter !== 'all') {
        filteredList = mediaList.filter(item => item.type === currentFilter);
    }
    
    // 应用搜索
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    if (searchTerm) {
        filteredList = filteredList.filter(item => 
            item.title.toLowerCase().includes(searchTerm) ||
            (item.description && item.description.toLowerCase().includes(searchTerm)) ||
            (item.tags && item.tags.some(tag => tag.toLowerCase().includes(searchTerm)))
        );
    }
    
    // 显示空状态或网格
    if (filteredList.length === 0) {
        grid.innerHTML = '';
        emptyState.style.display = 'block';
        return;
    }
    
    emptyState.style.display = 'none';
    
    // 渲染卡片
    grid.innerHTML = filteredList.map(item => createMediaCard(item)).join('');
}

function createMediaCard(item) {
    const isVideoType = item.type === 'video';
    const thumbnail = item.thumbnailUrl || item.blobUrl;
    const altitudeText = item.metadata?.gps?.altitude ? `📍 ${item.metadata.gps.altitude}m` : '';
    const droneText = item.metadata?.flight?.droneModel || '';
    
    return `
        <div class="media-card" onclick="openDetailModal('${item.id}')">
            <span class="media-type-badge ${item.type}">${isVideoType ? '🎬 VIDEO' : '📷 IMAGE'}</span>
            ${isVideoType 
                ? `<video class="media-thumbnail" src="${item.blobUrl}" muted></video>`
                : `<img class="media-thumbnail" src="${thumbnail}" alt="${item.title}" loading="lazy">`
            }
            <div class="media-info">
                <h3 class="media-title">${item.title}</h3>
                <div class="media-meta">
                    ${altitudeText ? `<span class="media-meta-item">${altitudeText}</span>` : ''}
                    ${droneText ? `<span class="media-meta-item">🚁 ${droneText}</span>` : ''}
                </div>
            </div>
        </div>
    `;
}

function updateStats() {
    const images = mediaList.filter(item => item.type === 'image').length;
    const videos = mediaList.filter(item => item.type === 'video').length;
    
    document.getElementById('totalAssets').textContent = mediaList.length;
    document.getElementById('totalImages').textContent = images;
    document.getElementById('totalVideos').textContent = videos;
}

// ============================================
// 筛选和搜索
// ============================================
function setFilter(filter) {
    currentFilter = filter;
    
    // 更新按钮状态
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.filter === filter);
    });
    
    renderMediaGrid();
}

function filterMedia() {
    renderMediaGrid();
}

// ============================================
// 上传功能
// ============================================
function openUploadModal() {
    document.getElementById('uploadModal').classList.add('active');
    resetUploadForm();
}

function closeUploadModal() {
    document.getElementById('uploadModal').classList.remove('active');
    resetUploadForm();
}

function resetUploadForm() {
    document.getElementById('uploadForm').reset();
    document.getElementById('uploadPlaceholder').style.display = 'block';
    document.getElementById('uploadPreview').style.display = 'none';
    document.getElementById('previewImage').style.display = 'none';
    document.getElementById('previewVideo').style.display = 'none';
    selectedFile = null;
}

function setupDragAndDrop() {
    const uploadZone = document.getElementById('uploadZone');
    
    uploadZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadZone.classList.add('dragover');
    });
    
    uploadZone.addEventListener('dragleave', () => {
        uploadZone.classList.remove('dragover');
    });
    
    uploadZone.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadZone.classList.remove('dragover');
        
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleFileSelection(files[0]);
        }
    });
}

function handleFileSelect(event) {
    const file = event.target.files[0];
    if (file) {
        handleFileSelection(file);
    }
}

function handleFileSelection(file) {
    // 验证文件类型
    const isValidImage = CONFIG.ALLOWED_IMAGE_TYPES.includes(file.type);
    const isValidVideo = CONFIG.ALLOWED_VIDEO_TYPES.includes(file.type);
    
    if (!isValidImage && !isValidVideo) {
        showToast('Unsupported file type', 'error');
        return;
    }
    
    // 验证文件大小
    if (file.size > CONFIG.MAX_FILE_SIZE) {
        showToast('File size exceeds 50MB limit', 'error');
        return;
    }
    
    selectedFile = file;
    
    // 显示预览
    const placeholder = document.getElementById('uploadPlaceholder');
    const preview = document.getElementById('uploadPreview');
    const previewImage = document.getElementById('previewImage');
    const previewVideo = document.getElementById('previewVideo');
    
    placeholder.style.display = 'none';
    preview.style.display = 'block';
    
    const reader = new FileReader();
    reader.onload = (e) => {
        if (isValidImage) {
            previewImage.src = e.target.result;
            previewImage.style.display = 'block';
            previewVideo.style.display = 'none';
        } else {
            previewVideo.src = e.target.result;
            previewVideo.style.display = 'block';
            previewImage.style.display = 'none';
        }
    };
    reader.readAsDataURL(file);
    
    // 自动填充标题
    const titleInput = document.getElementById('mediaTitle');
    if (!titleInput.value) {
        titleInput.value = file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');
    }
}

async function handleUpload(event) {
    event.preventDefault();
    
    if (!selectedFile) {
        showToast('Please select a file', 'error');
        return;
    }
    
    const submitBtn = document.getElementById('submitBtn');
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span>UPLOADING...</span>';
    
    try {
        // 收集元数据
        const metadata = {
            title: document.getElementById('mediaTitle').value,
            description: document.getElementById('mediaDescription').value,
            metadata: {
                gps: {
                    latitude: parseFloat(document.getElementById('latitude').value) || null,
                    longitude: parseFloat(document.getElementById('longitude').value) || null,
                    altitude: parseFloat(document.getElementById('altitude').value) || null
                },
                flight: {
                    droneModel: document.getElementById('droneModel').value || null
                }
            },
            tags: document.getElementById('mediaTags').value
                ? document.getElementById('mediaTags').value.split(',').map(t => t.trim())
                : []
        };
        
        await API.uploadMedia(selectedFile, metadata);
        
        showToast('Media uploaded successfully!', 'success');
        closeUploadModal();
        await loadMedia();
        
    } catch (error) {
        console.error('Upload failed:', error);
        showToast(error.message || 'Upload failed', 'error');
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<span>UPLOAD MEDIA</span>';
    }
}

// ============================================
// 详情/编辑功能
// ============================================
async function openDetailModal(id) {
    currentMediaId = id;
    
    try {
        const media = await API.getMedia(id);
        
        // 填充数据
        document.getElementById('detailTitle').textContent = media.title;
        document.getElementById('editId').value = media.id;
        document.getElementById('editTitle').value = media.title;
        document.getElementById('editDescription').value = media.description || '';
        document.getElementById('editDroneModel').value = media.metadata?.flight?.droneModel || '';
        document.getElementById('editAltitude').value = media.metadata?.gps?.altitude || '';
        document.getElementById('editLatitude').value = media.metadata?.gps?.latitude || '';
        document.getElementById('editLongitude').value = media.metadata?.gps?.longitude || '';
        document.getElementById('editTags').value = media.tags ? media.tags.join(', ') : '';
        
        // 文件信息
        document.getElementById('detailFileName').textContent = media.fileName;
        document.getElementById('detailFileType').textContent = media.contentType;
        document.getElementById('detailFileSize').textContent = formatFileSize(media.fileSize);
        document.getElementById('detailUploadedAt').textContent = formatDate(media.uploadedAt);
        
        // 显示媒体
        const detailImage = document.getElementById('detailImage');
        const detailVideo = document.getElementById('detailVideo');
        
        if (media.type === 'video') {
            detailImage.style.display = 'none';
            detailVideo.style.display = 'block';
            detailVideo.src = media.blobUrl;
        } else {
            detailVideo.style.display = 'none';
            detailImage.style.display = 'block';
            detailImage.src = media.blobUrl;
        }
        
        document.getElementById('detailModal').classList.add('active');
        
    } catch (error) {
        console.error('Failed to load media details:', error);
        showToast('Failed to load media details', 'error');
    }
}

function closeDetailModal() {
    document.getElementById('detailModal').classList.remove('active');
    currentMediaId = null;
    
    // 停止视频播放
    const video = document.getElementById('detailVideo');
    video.pause();
    video.src = '';
}

async function handleUpdate(event) {
    event.preventDefault();
    
    if (!currentMediaId) return;
    
    try {
        const data = {
            title: document.getElementById('editTitle').value,
            description: document.getElementById('editDescription').value,
            metadata: {
                gps: {
                    latitude: parseFloat(document.getElementById('editLatitude').value) || null,
                    longitude: parseFloat(document.getElementById('editLongitude').value) || null,
                    altitude: parseFloat(document.getElementById('editAltitude').value) || null
                },
                flight: {
                    droneModel: document.getElementById('editDroneModel').value || null
                }
            },
            tags: document.getElementById('editTags').value
                ? document.getElementById('editTags').value.split(',').map(t => t.trim())
                : []
        };
        
        await API.updateMedia(currentMediaId, data);
        
        showToast('Media updated successfully!', 'success');
        closeDetailModal();
        await loadMedia();
        
    } catch (error) {
        console.error('Update failed:', error);
        showToast(error.message || 'Update failed', 'error');
    }
}

async function handleDelete() {
    if (!currentMediaId) return;
    
    if (!confirm('Are you sure you want to delete this media? This action cannot be undone.')) {
        return;
    }
    
    try {
        await API.deleteMedia(currentMediaId);
        
        showToast('Media deleted successfully!', 'success');
        closeDetailModal();
        await loadMedia();
        
    } catch (error) {
        console.error('Delete failed:', error);
        showToast(error.message || 'Delete failed', 'error');
    }
}

// ============================================
// 工具函数
// ============================================
function showLoading(show) {
    const overlay = document.getElementById('loadingOverlay');
    if (show) {
        overlay.classList.remove('hidden');
    } else {
        overlay.classList.add('hidden');
    }
}

function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `<span>${type === 'success' ? '✓' : type === 'error' ? '✗' : 'ℹ'}</span> ${message}`;
    
    container.appendChild(toast);
    
    // 自动移除
    setTimeout(() => {
        toast.style.animation = 'slideIn 0.3s ease reverse';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// ESC键关闭模态框
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeUploadModal();
        closeDetailModal();
    }
});

