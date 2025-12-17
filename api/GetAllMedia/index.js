const { CosmosClient } = require('@azure/cosmos');

module.exports = async function (context, req) {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
    };

    if (req.method === 'OPTIONS') {
        context.res = { status: 204, headers };
        return;
    }

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

        context.res = {
            status: 200,
            headers,
            body: JSON.stringify(resources)
        };
    } catch (error) {
        context.log.error('Error:', error.message);
        context.res = {
            status: 500,
            headers,
            body: JSON.stringify({ error: error.message })
        };
    }
};
