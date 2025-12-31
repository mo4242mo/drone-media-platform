// ============================================
// Drone Media Sharing Platform - API Module
// ============================================

const API = {
    /**
     * 上传媒体文件
     * @param {File} file - 文件对象
     * @param {Object} metadata - 元数据
     * @returns {Promise<Object>} - 上传结果
     */
    async uploadMedia(file, metadata) {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/a558d500-056b-4d45-a4d0-c69715fa1605',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'api.js:13',message:'Frontend upload start',data:{fileName:file.name,fileType:file.type,fileSize:file.size,url:`${CONFIG.API_BASE_URL}/media/upload`},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H1'})}).catch(()=>{});
        // #endregion
        
        const formData = new FormData();
        formData.append('file', file);
        formData.append('title', metadata.title || 'Untitled');
        formData.append('description', metadata.description || '');
        formData.append('tags', metadata.tags || '');

        const response = await fetch(`${CONFIG.API_BASE_URL}/media/upload`, {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            let error;
            try {
                error = await response.json();
            } catch {
                error = null;
            }
            // #region agent log
            fetch('http://127.0.0.1:7242/ingest/a558d500-056b-4d45-a4d0-c69715fa1605',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'api.js:30',message:'Frontend upload failed',data:{status:response.status,statusText:response.statusText,error},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H1'})}).catch(()=>{});
            // #endregion
            throw new Error(error?.message || error?.error || 'Upload failed');
        }

        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/a558d500-056b-4d45-a4d0-c69715fa1605',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'api.js:36',message:'Frontend upload success',data:{status:response.status},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H1'})}).catch(()=>{});
        // #endregion
        return response.json();
    },

    /**
     * 获取所有媒体
     * @param {Object} params - 查询参数
     * @returns {Promise<Array>} - 媒体列表
     */
    async getAllMedia(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const url = `${CONFIG.API_BASE_URL}/media${queryString ? '?' + queryString : ''}`;

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error('Failed to fetch media');
        }

        return response.json();
    },

    /**
     * 获取单个媒体详情
     * @param {string} id - 媒体ID
     * @returns {Promise<Object>} - 媒体详情
     */
    async getMedia(id) {
        const response = await fetch(`${CONFIG.API_BASE_URL}/media/${id}`);

        if (!response.ok) {
            throw new Error('Failed to fetch media details');
        }

        return response.json();
    },

    /**
     * 更新媒体信息
     * @param {string} id - 媒体ID
     * @param {Object} data - 更新数据
     * @returns {Promise<Object>} - 更新结果
     */
    async updateMedia(id, data) {
        const response = await fetch(`${CONFIG.API_BASE_URL}/media/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            let error;
            try {
                error = await response.json();
            } catch {
                error = null;
            }
            throw new Error(error?.message || error?.error || 'Update failed');
        }

        return response.json();
    },

    /**
     * 删除媒体
     * @param {string} id - 媒体ID
     * @returns {Promise<void>}
     */
    async deleteMedia(id) {
        const response = await fetch(`${CONFIG.API_BASE_URL}/media/${id}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            let error;
            try {
                error = await response.json();
            } catch {
                error = null;
            }
            throw new Error(error?.message || error?.error || 'Delete failed');
        }

        return response.json();
    }
};

