const { MongoClient } = require('mongodb');

const sourceUrl = 'Source_DB_URL';
const targetUrl = 'Destination_DB_URL';

async function openDbFromUrl(mongoUrl) {
    const client = new MongoClient(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true });

    try {
        await client.connect();
        return client.db();
    } catch (err) {
        console.error('error opening database:', err);
        throw err;
    }
}

async function copyCollections(source, target) {
    try {
        const collectionNames = await source.listCollections().toArray();

        for (const collectionInfo of collectionNames) {
            const collectionName = collectionInfo.name;
            console.log(`Copying collection: ${collectionName}`);

            const sourceCollection = source.collection(collectionName);
            const targetCollection = target.collection(collectionName);

            const results = await sourceCollection.find().toArray();

            if (results.length > 0) {
                await targetCollection.insertMany(results);
                console.log(`Copied ${results.length} documents to ${collectionName}`);
            } else {
                console.log(`Skipped copying ${collectionName} (collection is empty)`);
            }
        }

        console.log('All collections copied successfully');
    } catch (err) {
        console.error('Error copying collections:', err);
        throw err;
    }
}

(async () => {
    try {
        const sourceDb = await openDbFromUrl(sourceUrl);
        const targetDb = await openDbFromUrl(targetUrl);

        await copyCollections(sourceDb, targetDb);
    } catch (err) {
        process.exit(1);
    }
})();
