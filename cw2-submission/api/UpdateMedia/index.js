const { CosmosClient } = require('@azure/cosmos');

module.exports = async function (context, req) {
    context.log('UpdateMedia function triggered');

    // CORS headers
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'PUT, OPTIONS',
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

        // Get existing item
        const { resource: existingItem } = await container.item(id, id).read();

        if (!existingItem) {
            context.res = {
                status: 404,
                headers,
                body: JSON.stringify({ message: 'Media not found' })
            };
            return;
        }

        const updateData = req.body || {};

        // Merge updates with existing data
        const updatedItem = {
            ...existingItem,
            title: updateData.title || existingItem.title,
            description: updateData.description !== undefined ? updateData.description : existingItem.description,
            metadata: updateData.metadata
                ? {
                      ...existingItem.metadata,
                      ...updateData.metadata,
                      gps: updateData.metadata.gps
                          ? {
                                ...existingItem.metadata?.gps,
                                ...updateData.metadata.gps
                            }
                          : existingItem.metadata?.gps,
                      flight: updateData.metadata.flight
                          ? {
                                ...existingItem.metadata?.flight,
                                ...updateData.metadata.flight
                            }
                          : existingItem.metadata?.flight
                  }
                : existingItem.metadata,
            tags: updateData.tags || existingItem.tags,
            updatedAt: new Date().toISOString()
        };

        // Update in Cosmos DB
        const { resource: result } = await container.item(id, id).replace(updatedItem);

        context.res = {
            status: 200,
            headers,
            body: JSON.stringify({
                message: 'Media updated successfully',
                data: result
            })
        };
    } catch (error) {
        context.log.error('UpdateMedia error:', error);

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
                message: 'Failed to update media',
                error: error.message
            })
        };
    }
};


