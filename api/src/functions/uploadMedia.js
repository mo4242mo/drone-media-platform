const { app } = require('@azure/functions');
const { CosmosClient } = require('@azure/cosmos');
const { BlobServiceClient } = require('@azure/storage-blob');
const { v4: uuidv4 } = require('uuid');

app.http('uploadMedia', {
    methods: ['POST'],
    authLevel: 'anonymous',
    route: 'media/upload',
    handler: async (request, context) => {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/a558d500-056b-4d45-a4d0-c69715fa1605',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'uploadMedia.js:13',message:'Upload request received',data:{method:request.method,url:request.url},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H1'})}).catch(()=>{});
        // #endregion
        
        const headers = { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' };
        
        try {
            // #region agent log
            fetch('http://127.0.0.1:7242/ingest/a558d500-056b-4d45-a4d0-c69715fa1605',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'uploadMedia.js:18',message:'Parsing formData',data:{},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H4'})}).catch(()=>{});
            // #endregion
            const formData = await request.formData();
            const file = formData.get('file');
            const title = formData.get('title') || 'Untitled';
            const description = formData.get('description') || '';
            const tags = formData.get('tags') || '';
            
            // #region agent log
            fetch('http://127.0.0.1:7242/ingest/a558d500-056b-4d45-a4d0-c69715fa1605',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'uploadMedia.js:25',message:'FormData parsed',data:{hasFile:!!file,title,fileType:file?.type,fileSize:file?.size},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H4'})}).catch(()=>{});
            // #endregion
            
            if (!file) {
                return { status: 400, headers, body: JSON.stringify({ error: 'No file provided' }) };
            }
            
            const id = uuidv4();
            const fileName = `${id}-${file.name}`;
            const fileBuffer = await file.arrayBuffer();
            
            // Upload to Blob Storage
            // #region agent log
            fetch('http://127.0.0.1:7242/ingest/a558d500-056b-4d45-a4d0-c69715fa1605',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'uploadMedia.js:35',message:'Env vars check',data:{hasStorageConn:!!process.env.STORAGE_CONNECTION_STRING,hasCosmosEndpoint:!!process.env.COSMOS_ENDPOINT,hasCosmosKey:!!process.env.COSMOS_KEY},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H4'})}).catch(()=>{});
            // #endregion
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
            
            // #region agent log
            fetch('http://127.0.0.1:7242/ingest/a558d500-056b-4d45-a4d0-c69715fa1605',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'uploadMedia.js:65',message:'Upload success',data:{id,fileName},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H1'})}).catch(()=>{});
            // #endregion
            return { status: 201, headers, body: JSON.stringify(mediaItem) };
        } catch (error) {
            context.log('Upload error:', error);
            // #region agent log
            fetch('http://127.0.0.1:7242/ingest/a558d500-056b-4d45-a4d0-c69715fa1605',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'uploadMedia.js:71',message:'Upload error',data:{error:error.message,stack:error.stack},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H4'})}).catch(()=>{});
            // #endregion
            return { status: 500, headers, body: JSON.stringify({ error: error.message }) };
        }
    }
});


