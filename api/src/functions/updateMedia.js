const { app } = require('@azure/functions');
const { CosmosClient } = require('@azure/cosmos');

app.http('updateMedia', {
    methods: ['PUT'],
    authLevel: 'anonymous',
    route: 'media/{id}',
    handler: async (request, context) => {
        const headers = { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'PUT, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' };
        
        try {
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
            
            return { status: 200, headers, body: JSON.stringify(updated) };
        } catch (error) {
            context.log('Update error:', error);
            return { status: 500, headers, body: JSON.stringify({ error: error.message }) };
        }
    }
});


