const { app } = require('@azure/functions');
const { CosmosClient } = require('@azure/cosmos');
const { BlobServiceClient } = require('@azure/storage-blob');
const { v4: uuidv4 } = require('uuid');

app.http('uploadMedia', {
    methods: ['POST'],
    authLevel: 'anonymous',
    route: 'media/upload',
    handler: async (request, context) => {
        const headers = { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' };
        
        try {
            const formData = await request.formData();
            const file = formData.get('file');
            const title = formData.get('title') || 'Untitled';
            const description = formData.get('description') || '';
            const tags = formData.get('tags') || '';
            
            if (!file) {
                return { status: 400, headers, body: JSON.stringify({ error: 'No file provided' }) };
            }
            
            const id = uuidv4();
            const fileName = `${id}-${file.name}`;
            const fileBuffer = await file.arrayBuffer();
            
            // Upload to Blob Storage
            const blobServiceClient = BlobServiceClient.fromConnectionString(
                process.env.STORAGE_CONNECTION_STRING
            );
            const containerClient = blobServiceClient.getContainerClient('media');
            const blockBlobClient = containerClient.getBlockBlobClient(fileName);
            
            await blockBlobClient.upload(Buffer.from(fileBuffer), fileBuffer.byteLength, {
                blobHTTPHeaders: { blobContentType: file.type }
            });
            
            // Save metadata to Cosmos DB
            const mediaItem = {
                id,
                title,
                description,
                tags: tags.split(',').map(t => t.trim()).filter(t => t),
                fileName,
                fileType: file.type,
                fileSize: fileBuffer.byteLength,
                blobUrl: blockBlobClient.url,
                uploadedAt: new Date().toISOString()
            };
            
            const cosmosClient = new CosmosClient({
                endpoint: process.env.COSMOS_ENDPOINT,
                key: process.env.COSMOS_KEY
            });
            
            const database = cosmosClient.database(process.env.COSMOS_DATABASE);
            const container = database.container(process.env.COSMOS_CONTAINER);
            await container.items.create(mediaItem);
            
            return { status: 201, headers, body: JSON.stringify(mediaItem) };
        } catch (error) {
            context.log('Upload error:', error);
            return { status: 500, headers, body: JSON.stringify({ error: error.message }) };
        }
    }
});


