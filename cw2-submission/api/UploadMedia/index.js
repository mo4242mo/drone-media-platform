const { BlobServiceClient } = require('@azure/storage-blob');
const { CosmosClient } = require('@azure/cosmos');
const { v4: uuidv4 } = require('uuid');
const multipart = require('parse-multipart-data');

module.exports = async function (context, req) {
    context.log('UploadMedia function triggered');

    // CORS headers
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Content-Type': 'application/json'
    };

    // Handle preflight
    if (req.method === 'OPTIONS') {
        context.res = { status: 204, headers };
        return;
    }

    try {
        // Parse multipart form data
        const contentType = req.headers['content-type'];
        if (!contentType || !contentType.includes('multipart/form-data')) {
            context.res = {
                status: 400,
                headers,
                body: JSON.stringify({ message: 'Content-Type must be multipart/form-data' })
            };
            return;
        }

        const boundary = multipart.getBoundary(contentType);

        // Azure Functions Node httpTrigger provides `rawBody` for unparsed payloads.
        // Prefer it to avoid binary corruption.
        const body = req.rawBody ?? req.body;
        const bodyBuffer = Buffer.isBuffer(body) ? body : Buffer.from(body || '');

        const parts = multipart.parse(bodyBuffer, boundary);

        // Find file and metadata parts
        let filePart = null;
        let metadataPart = null;

        for (const part of parts) {
            if (part.filename) {
                filePart = part;
            } else if (part.name === 'metadata') {
                try {
                    metadataPart = JSON.parse(part.data.toString());
                } catch {
                    metadataPart = null;
                }
            }
        }

        if (!filePart) {
            context.res = {
                status: 400,
                headers,
                body: JSON.stringify({ message: 'No file provided' })
            };
            return;
        }

        // Generate unique ID and filename
        const id = uuidv4();
        const originalName = filePart.filename;
        const extension = originalName.includes('.') ? originalName.split('.').pop() : 'bin';
        const blobName = `${id}.${extension}`;

        // Determine media type
        const contentTypeFile = filePart.type || 'application/octet-stream';
        const isVideo = contentTypeFile.startsWith('video/');
        const mediaType = isVideo ? 'video' : 'image';

        // Upload to Blob Storage
        const blobServiceClient = BlobServiceClient.fromConnectionString(
            process.env.STORAGE_CONNECTION_STRING
        );
        const containerClient = blobServiceClient.getContainerClient('media');

        // Ensure container exists
        await containerClient.createIfNotExists({ access: 'blob' });

        const blockBlobClient = containerClient.getBlockBlobClient(blobName);
        await blockBlobClient.upload(filePart.data, filePart.data.length, {
            blobHTTPHeaders: {
                blobContentType: contentTypeFile
            }
        });

        const blobUrl = blockBlobClient.url;

        // Save metadata to Cosmos DB
        const cosmosClient = new CosmosClient({
            endpoint: process.env.COSMOS_ENDPOINT,
            key: process.env.COSMOS_KEY
        });

        const database = cosmosClient.database(process.env.COSMOS_DATABASE);
        const container = database.container(process.env.COSMOS_CONTAINER);

        const mediaDocument = {
            id,
            type: mediaType,
            title: metadataPart?.title || originalName,
            description: metadataPart?.description || '',
            fileName: originalName,
            blobName,
            blobUrl,
            contentType: contentTypeFile,
            fileSize: filePart.data.length,
            metadata: metadataPart?.metadata || {},
            tags: metadataPart?.tags || [],
            uploadedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        const { resource: createdItem } = await container.items.create(mediaDocument);

        context.res = {
            status: 201,
            headers,
            body: JSON.stringify({
                message: 'Media uploaded successfully',
                data: createdItem
            })
        };
    } catch (error) {
        context.log.error('Upload error:', error);
        context.res = {
            status: 500,
            headers,
            body: JSON.stringify({
                message: 'Upload failed',
                error: error.message
            })
        };
    }
};


