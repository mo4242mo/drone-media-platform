const { app } = require('@azure/functions');
const { CosmosClient } = require('@azure/cosmos');
const { BlobServiceClient } = require('@azure/storage-blob');

app.http('deleteMedia', {
    methods: ['DELETE'],
    authLevel: 'anonymous',
    route: 'media/{id}',
    handler: async (request, context) => {
        const headers = { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'DELETE, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' };
        const id = request.params.id;
        
        try {
            const cosmosClient = new CosmosClient({
                endpoint: process.env.COSMOS_ENDPOINT,
                key: process.env.COSMOS_KEY
            });
            
            const database = cosmosClient.database(process.env.COSMOS_DATABASE);
            const container = database.container(process.env.COSMOS_CONTAINER);
            
            // Get existing item to find blob name
            const { resource: existing } = await container.item(id, id).read();
            if (!existing) {
                return { status: 404, headers, body: JSON.stringify({ error: 'Media not found' }) };
            }
            
            // Delete from Blob Storage
            const blobServiceClient = BlobServiceClient.fromConnectionString(
                process.env.STORAGE_CONNECTION_STRING
            );
            const containerClient = blobServiceClient.getContainerClient('media');
            const blockBlobClient = containerClient.getBlockBlobClient(existing.fileName);
            await blockBlobClient.deleteIfExists();
            
            // Delete from Cosmos DB
            await container.item(id, id).delete();
            
            return { status: 200, headers, body: JSON.stringify({ message: 'Deleted successfully' }) };
        } catch (error) {
            context.log('Delete error:', error);
            return { status: 500, headers, body: JSON.stringify({ error: error.message }) };
        }
    }
});


