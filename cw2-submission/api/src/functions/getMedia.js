const { app } = require('@azure/functions');
const { CosmosClient } = require('@azure/cosmos');

// Get all media
app.http('GetAllMedia', {
    methods: ['GET'],
    authLevel: 'anonymous',
    route: 'media',
    handler: async (request, context) => {
        const headers = { 'Content-Type': 'application/json' };
        
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
            
            return { status: 200, headers, body: JSON.stringify(resources) };
        } catch (error) {
            context.log('Error fetching media:', error);
            return { status: 500, headers, body: JSON.stringify({ error: error.message }) };
        }
    }
});

// Get single media
app.http('GetMedia', {
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


