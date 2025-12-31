const { CosmosClient } = require('@azure/cosmos');

module.exports = async function (context, req) {
    context.log('GetMedia function triggered');

    // CORS headers
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Content-Type': 'application/json'
    };

    // Handle preflight
    if (req.method === 'OPTIONS') {
        context.res = { status: 204, headers };
        return;
    }

    const id = context.bindingData.id;

    if (!id) {
        context.res = {
            status: 400,
            headers,
            body: JSON.stringify({ message: 'Media ID is required' })
        };
        return;
    }

    try {
        const cosmosClient = new CosmosClient({
            endpoint: process.env.COSMOS_ENDPOINT,
            key: process.env.COSMOS_KEY
        });

        const database = cosmosClient.database(process.env.COSMOS_DATABASE);
        const container = database.container(process.env.COSMOS_CONTAINER);

        const { resource: item } = await container.item(id, id).read();

        if (!item) {
            context.res = {
                status: 404,
                headers,
                body: JSON.stringify({ message: 'Media not found' })
            };
            return;
        }

        context.res = {
            status: 200,
            headers,
            body: JSON.stringify(item)
        };
    } catch (error) {
        context.log.error('GetMedia error:', error);

        if (error.code === 404) {
            context.res = {
                status: 404,
                headers,
                body: JSON.stringify({ message: 'Media not found' })
            };
            return;
        }

        context.res = {
            status: 500,
            headers,
            body: JSON.stringify({
                message: 'Failed to fetch media',
                error: error.message
            })
        };
    }
};


