const { app } = require('@azure/functions');
const { CosmosClient } = require('@azure/cosmos');

app.http('updateMedia', {
    methods: ['PUT'],
    authLevel: 'anonymous',
    route: 'media/{id}',
    handler: async (request, context) => {
        const headers = { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'PUT, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' };
        
        try {
            // #region agent log
            fetch('http://127.0.0.1:7242/ingest/a558d500-056b-4d45-a4d0-c69715fa1605',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'updateMedia.js:10',message:'Update request received',data:{id:request.params.id},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H2'})}).catch(()=>{});
            // #endregion
            const body = await request.json();
            const id = request.params.id;
            
            if (!id) {
                return { status: 400, headers, body: JSON.stringify({ error: 'Media ID is required' }) };
            }
            
            const client = new CosmosClient({
                endpoint: process.env.COSMOS_ENDPOINT,
                key: process.env.COSMOS_KEY
            });
            
            const database = client.database(process.env.COSMOS_DATABASE);
            const container = database.container(process.env.COSMOS_CONTAINER);
            
            // Get existing item
            const { resource: existing } = await container.item(id, id).read();
            if (!existing) {
                return { status: 404, headers, body: JSON.stringify({ error: 'Media not found' }) };
            }
            
            // Update fields
            const updated = {
                ...existing,
                title: body.title || existing.title,
                description: body.description || existing.description,
                tags: body.tags || existing.tags,
                updatedAt: new Date().toISOString()
            };
            
            await container.item(id, id).replace(updated);
            
            // #region agent log
            fetch('http://127.0.0.1:7242/ingest/a558d500-056b-4d45-a4d0-c69715fa1605',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'updateMedia.js:48',message:'Update success',data:{id},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H2'})}).catch(()=>{});
            // #endregion
            return { status: 200, headers, body: JSON.stringify(updated) };
        } catch (error) {
            context.log('Update error:', error);
            // #region agent log
            fetch('http://127.0.0.1:7242/ingest/a558d500-056b-4d45-a4d0-c69715fa1605',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'updateMedia.js:55',message:'Update error',data:{error:error.message},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H2'})}).catch(()=>{});
            // #endregion
            return { status: 500, headers, body: JSON.stringify({ error: error.message }) };
        }
    }
});


