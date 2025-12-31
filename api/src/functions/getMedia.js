const { app } = require('@azure/functions');
const { CosmosClient } = require('@azure/cosmos');

// Get all media
app.http('getMedia', {
    methods: ['GET'],
    authLevel: 'anonymous',
    route: 'media',
    handler: async (request, context) => {
        const headers = { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' };
        
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/a558d500-056b-4d45-a4d0-c69715fa1605',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'getMedia.js:11',message:'GetMedia request received',data:{},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H5'})}).catch(()=>{});
        // #endregion
        
        try {
            const client = new CosmosClient({
                endpoint: process.env.COSMOS_ENDPOINT,
                key: process.env.COSMOS_KEY
            });
            
            const database = client.database(process.env.COSMOS_DATABASE);
            const container = database.container(process.env.COSMOS_CONTAINER);
            
            const { resources } = await container.items
                .query('SELECT * FROM c ORDER BY c.uploadedAt DESC')
                .fetchAll();
            
            // #region agent log
            fetch('http://127.0.0.1:7242/ingest/a558d500-056b-4d45-a4d0-c69715fa1605',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'getMedia.js:28',message:'GetMedia success',data:{count:resources.length},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H5'})}).catch(()=>{});
            // #endregion
            return { status: 200, headers, body: JSON.stringify(resources) };
        } catch (error) {
            context.log('Error fetching media:', error);
            // #region agent log
            fetch('http://127.0.0.1:7242/ingest/a558d500-056b-4d45-a4d0-c69715fa1605',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'getMedia.js:35',message:'GetMedia error',data:{error:error.message},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H5'})}).catch(()=>{});
            // #endregion
            return { status: 500, headers, body: JSON.stringify({ error: error.message }) };
        }
    }
});

// Get single media by ID (not used by frontend currently)
app.http('getMediaById', {
    methods: ['GET'],
    authLevel: 'anonymous',
    route: 'media/{id}',
    handler: async (request, context) => {
        const headers = { 'Content-Type': 'application/json' };
        const id = request.params.id;
        
        try {
            const client = new CosmosClient({
                endpoint: process.env.COSMOS_ENDPOINT,
                key: process.env.COSMOS_KEY
            });
            
            const database = client.database(process.env.COSMOS_DATABASE);
            const container = database.container(process.env.COSMOS_CONTAINER);
            
            const { resource } = await container.item(id, id).read();
            
            if (!resource) {
                return { status: 404, headers, body: JSON.stringify({ error: 'Media not found' }) };
            }
            
            return { status: 200, headers, body: JSON.stringify(resource) };
        } catch (error) {
            context.log('Error fetching media:', error);
            return { status: 500, headers, body: JSON.stringify({ error: error.message }) };
        }
    }
});


